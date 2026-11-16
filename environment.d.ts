declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PWD: string;
      GOOGLE_GENAI_API_KEY: string;
    }
  }
}
export {}