import { GoogleGenAI, Type, Schema, Tool, FunctionDeclaration, FunctionCallingConfigMode, Content, Chat, GenerateContentResponse, GenerateContentParameters } from '@google/genai';
import { birthPercentileFunction, joinedData } from './birthyear';

// sampling the birth year from our historical data
const birthyearData = await joinedData();
const birthyearInverse = birthPercentileFunction(birthyearData, 2025);
export const sampleBirthyear = () => Math.round(birthyearInverse(Math.random())!);

// utility functions for LLM calls
const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// RPM
async function throttle<T>(fn: () => Promise<T>, backoff: number = 1000): Promise<T> {
  return fn().catch((error) => {
    if (error.name === "ClientError") {
      console.warn(`Throttling for ${backoff}ms...`);
      return new Promise((resolve) => setTimeout(resolve, backoff)).then(() => throttle(fn, backoff * 2));
    } else {
      console.error("Error while throttling:", JSON.stringify(error));
      throw error;
    }
  });
}

const sampleFunctionDeclaration: FunctionDeclaration = {
  name: 'sample',
  description: 'Samples "variable = np.random.choice(values, p=weights)"',
  parameters: {
    type: Type.OBJECT,
    properties: {
      "preliminary thoughts": {
        type: Type.STRING,
        description: "Preliminary reasoning about what variable to sample next, and what its conditional distribution looks like. Recall your knowledge about history, geography and culture.",
      },
      variable: {
        type: Type.STRING,
        description: "The name of the variable to be sampled.",
      },
      values: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "The list of possible values to sample from. Ideally 2 to 20 values.",
      },
      weights: {
        type: Type.ARRAY,
        items: {
          type: Type.NUMBER,
        },
        description: "The list of weights corresponding to each value.",
      },
    },
    required: ["preliminary thoughts", "variable", "values", "weights"],
    propertyOrdering: ["preliminary thoughts", "variable", "values", "weights"],
  }
};
function sampleFunction<T>(values: T[], weights: number[]): T {
  // sample a random value as in np.random.choice(values, p=weights)
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (randomValue <= cumulativeWeight) {
      return values[i];
    }
  }
  throw new Error("Sampling failed: no value selected");
}

const submitFunctionDeclaration: FunctionDeclaration = {
  name: 'submit',
  description: 'Store all your sampled variables in the database.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      notes: {
        type: Type.STRING,
        description: "Final notes to include in the database entry.",
      },
    },
    required: ["notes"],
  }
}

// types
type Choice<T> = {
  "preliminary thoughts": string;
  "values": T[];
  "weights": number[];
  "choice": T;
}
type BiographyGen = Record<string, Choice<string>>;

const promptBiographyGen = `
You are an expert anthropologist and historian, with literacy in statistics and data science.
You are working on a project that aims at illustrating the full distribution of all human lives ever lived, from prehistory to the present day.
An important part of the project is to build a database of fictional biographies, that are sampled in a way that imitates real life relative frequencies and conditional probabilities.
The database will later be used to create an art gallery of fictional obituaries. 
We try to capture the full spectrum of all humans ever born, including infant deaths or people without descendants.
We achieve a high level of statistical realism by sampling biographical variables one by one, always conditioning on the previous variables.
Most database entries contain variables such as:
- year of birth
- place of birth
- ethnic, religious and cultural identity
- socioeconomic status of parents
- cause of death
- age at death
- occupation or social role
- family structure
The exact procedure is to iteratively:
- come up with the next variable
- think about its distribution, conditioned on all previous variables
- create a list of 2 to 20 plausible values, ideally capturing >90% of probability mass
- assign relative frequencies to each value
- call the "sample" function to sample one of the values, weighted by the frequencies
Some variables with fine-grained distribution, especially "place of birth", need to be broken down into subvariables.
In this case you can use bucketed categories (e.g. subcontinent, country, region, nearest town) to sample the subvariables iteratively.
Use natural language names for the variables and their values.
Once you have sampled all variables you find relevant, you can stop, and call the "submit" function.
Focus on realism, statistical accuracy, and representativeness.
`;

async function sampleBiographyGen(max_turns: number = 16): Promise<{ bio: BiographyGen, chat: Content[] }> {
  const prompt = promptBiographyGen;
  const bio: BiographyGen = {};

  // artifical turn: birth year
  const birth_year = sampleBirthyear();
  bio["year of birth"] = {
    "preliminary thoughts": "We use a predefined distribution of birth years, based on historical population and crude birth rate data.",
    "values": ["-predefined-"],
    "weights": [100],
    "choice": birth_year > 0 ? `${birth_year} CE` : `${-birth_year} BCE`,
  };

  const config = {
    tools: [{
      functionDeclarations: [sampleFunctionDeclaration, submitFunctionDeclaration],
    }],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.ANY, // call multiple functions in parallel
      }
    },
  };

  const chat = await googleGenAI.chats.create({
    model: 'gemini-2.0-flash',
    config: config,
  });

  const firstMessage = prompt + `
  Here is the first variable we have sampled:
  ${JSON.stringify(bio, null, 2)}
  Please now proceed as outlined above to define and sample all remaining variables.
  `;

  let message: string = firstMessage;
  let submitted = false;
  let turn = 0;

  while (!submitted && turn < max_turns) {
    // send the message to the LLM
    //console.log("Turn:", turn, "Message:", message);
    console.log(`Turn ${turn + 1} of ${max_turns}`);
    let response = await throttle(() => chat.sendMessage({ message: message }));
    //console.log("Response:", response.text);
    turn += 1;
    // start building the next message
    message = "";

    // check for function calls
    for (const fn of response.functionCalls!) {
      if (fn.name === "sample") {
        const thoughts = fn.args!["preliminary thoughts"] as string;
        const variable = fn.args!["variable"] as string;
        const values = fn.args!["values"] as string[];
        const weights = fn.args!["weights"] as number[];

        const choice = sampleFunction(values, weights);
        message += `Sampled: ${variable} = ${choice}\n`;
        bio[variable] = {
          "preliminary thoughts": thoughts,
          "values": values,
          "weights": weights,
          "choice": choice,
        };
      } else if (fn.name === "submit") {
        //console.log("Submitting:", fn.args!["notes"]);
        submitted = true;
      }
    }
  }
  // check if we submitted
  //console.log("Submitted:", submitted, " Turn:", turn);
  //console.log("Biography:", JSON.stringify(bio, null, 2));

  return {
    bio, chat: chat.getHistory(true),
  };
}

type ObituaryGen = {
  notes: string;
  birth_date_modern: string;
  death_date_modern: string;
  birth_date_local: string;
  death_date_local: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  text: string;
};

const max_obituary_thoughts = 500;
const max_obituary_words = 500;
const ObituaryGenGoogleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    notes: {
      type: Type.STRING,
      description: `Use this field to recall knowledge about the person's cultural and historical context. Up to ${max_obituary_thoughts} words.`
    },
    birth_date_modern: {
      type: Type.STRING,
      description: "Their date of birth, in the Gregorian calendar, MM/DD/YYYY BCE/CE."
    },
    death_date_modern: {
      type: Type.STRING,
      description: "Their date of death, in the Gregorian calendar, MM/DD/YYYY BCE/CE."
    },
    birth_date_local: {
      type: Type.STRING,
      description: "Their date of birth, in the local calendar."
    },
    death_date_local: {
      type: Type.STRING,
      description: "Their date of death, in the local calendar."
    },
    name: {
      type: Type.STRING,
      description: "Their name as it appears in the headline of the obituary."
    },
    coordinates: {
      type: Type.OBJECT,
      properties: {
        latitude: {
          type: Type.NUMBER,
        },
        longitude: {
          type: Type.NUMBER,
        }
      },
      description: "Their place of living in degrees.",
      required: ["latitude", "longitude"],
      propertyOrdering: ["latitude", "longitude"],
    },
    text: {
      type: Type.STRING,
      description: `The full text of the obituary. Up to ${max_obituary_words} words. Structured into paragraphs with \\n\\n.`
    }
  },
  required: [
    "notes", "birth_date_modern", "death_date_modern", "birth_date_local", "death_date_local", "name", "coordinates", "text"
  ],
  propertyOrdering: [
    "notes", "birth_date_modern", "death_date_modern", "birth_date_local", "death_date_local", "name", "coordinates", "text"
  ],
};

const promptObituaryGen = (bio: BiographyGen) => `
You are an expert anthropologist and historian, with literacy in statistics and data science.
You are working on a project that aims at illustrating the full distribution of all human lives ever lived, from prehistory to the present day.
An important part of the project is a database of fictional biographies, that are sampled in a way that imitates real life relative frequencies and conditional probabilities.
We achieved a high level of statistical realism by sampling biographical variables one by one, always conditioning on the previous variables.
The database will now be used to create an art gallery of fictional obituaries. 
The viewers of the art gallery have already been informed that all obituaries are fictional, and that they merely imitate the real distribution of human lives.

Your task is to write an obituary for a fictional person, based on the provided raw biographical data.
Focus on concreteness, realism, and artistic expression. Don't use vague phrases such as "approximately" or "left behind several children".
Make up details, including names, places, events and relationships.
Write unformatted text, only use double newlines to separate paragraphs.
Flesh out the biographical data in a lifelike way. Pay attention to the dead person's time period, culture, faith and guess at their wishes for what future generations should read in their obituary.

Biographical Data:
${JSON.stringify(bio, null, 2)}

Answer in the provided JSON Schema format.
Use the field "notes" to recall useful knowledge about the person's cultural and historical context, and to plan the obituary.
`;

async function sampleObituaryGen(bio: BiographyGen): Promise<{ obituary: ObituaryGen, chat: Content[] }> {
  const prompt = promptObituaryGen(bio);
  const schema = ObituaryGenGoogleSchema;

  const response = await throttle(() => googleGenAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      maxOutputTokens: 10_000,
    }
  }));
  const result = JSON.parse(response.text!) as ObituaryGen;
  return {
    obituary: result, chat: [{
      role: "user",
      parts: [{ text: prompt }],
    }, {
      role: "model",
      parts: [{ text: response.text! }],
    }]
  };
}

const promptImageGen = (obituary: ObituaryGen) => `
You are working for a project that aims at illustrating the full distribution of all human lives ever lived, from prehistory to the present day.
We exhibit fictional obituaries in a digital art gallery, sampled in a way that imitates real life relative frequencies and conditional probabilities.
Please generate a photorealistic image which we can put next to the obituary, illustrating the person in their lifetime.
It does not matter if photographs were not invented yet during the fictional person's lifetime.
Choose a scene that feels historically fitting and culturally appropriate.

Name: ${obituary.name}
Date: ${obituary.birth_date_local} -- ${obituary.death_date_local}
      ${obituary.birth_date_modern} -- ${obituary.death_date_modern}
Geographic Coordinates: [${obituary.coordinates.latitude}, ${obituary.coordinates.longitude}]
Obituary Text: 
${obituary.text}

Please generate a photorealistic, high resolution image of the person, in a historically accurate scene, maybe with other relevant people of their life.
`;

async function generateImage(obituary: ObituaryGen): Promise<{ imageBase64: string | null, chat: Content[] }> {
  const prompt = promptImageGen(obituary);

  const response = await throttle(() => googleGenAI.models.generateContent({
    model: 'gemini-2.0-flash-exp-image-generation',
    contents: prompt,
    config: {
      responseModalities: ['Text', 'Image'],
    }
  }));

  const images = [];
  for (const part of response.candidates![0].content?.parts ?? []) {
    if (part.text) {
      //console.log("Text:", part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data!;
      // const buffer = Buffer.from(imageData, 'base64');
      images.push(imageData);
      //console.log("Image:", "...");
    }
  }

  return {
    imageBase64: images.length > 0 ? images[0] : null,
    chat: [{
      role: "user",
      parts: [{ text: prompt }],
    }, {
      role: "model",
      parts: response.candidates![0].content?.parts?.filter(part => part.text !== undefined) ?? [],
    }]
  };
}

export type Obituary = {
  uuid: string;
  name: string;
  birth_date_local: string;
  death_date_local: string;
  birth_date_modern: string;
  death_date_modern: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  text: string;

  biography_gen: BiographyGen;
  obituary_gen: ObituaryGen;

  chats: {
    biography: Content[];
    obituary: Content[];
    image: Content[];
  };
};

export async function generate(uuid: string): Promise<{ obituary: Obituary, imageBase64: string | null }> {
  const { bio: biography, chat: chatBio } = await sampleBiographyGen();
  const { obituary, chat: chatObituary } = await sampleObituaryGen(biography);
  const { imageBase64, chat: chatImage } = await generateImage(obituary).catch((error) => {
    console.error("Image generation failed:", error);
    return { imageBase64: null, chat: [] };
  });

  const obituaryFinal: Obituary = {
    uuid,
    name: obituary.name,
    birth_date_modern: obituary.birth_date_modern,
    death_date_modern: obituary.death_date_modern,
    birth_date_local: obituary.birth_date_local,
    death_date_local: obituary.death_date_local,
    coordinates: obituary.coordinates,
    text: obituary.text,
    biography_gen: biography,
    obituary_gen: obituary,

    chats: {
      biography: chatBio,
      obituary: chatObituary,
      image: chatImage,
    },
  };
  return { obituary: obituaryFinal, imageBase64: imageBase64 };
}