import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { generate, Obituary } from './generate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const devDir = path.join(__dirname, '..', 'public', 'development');

const app = express();
const PORT = 3001;

app.use(express.json());

async function saveObituary(obituary: Obituary, imageBase64: string | null) {
  const uuid = obituary.uuid;


  const jsonPath = path.join(devDir, 'obituaries', `${uuid}.json`);
  const pngPath = path.join(devDir, 'obituaries', `${uuid}.png`);
  const navPath = path.join(devDir, 'navigation.json');

  fs.writeFileSync(jsonPath, JSON.stringify(obituary, null, 2));
  if (imageBase64) {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(pngPath, imageBuffer);
  }

  if (fs.existsSync(navPath)) {
    const navData = JSON.parse(fs.readFileSync(navPath, 'utf-8'));
    navData.order.push(uuid);
    fs.writeFileSync(navPath, JSON.stringify(navData, null, 2));
  }
}

async function generateOne(uuid: string | null) {
  if (!uuid) {
    uuid = crypto.randomUUID();
  }
  try {
    const { obituary, imageBase64 } = await generate(uuid);
    if (imageBase64 === null) {
      console.warn("Generated obituary has no image.");
    }
    await saveObituary(obituary, imageBase64);
    return { uuid };
  } catch (error) {
    console.error("generateOne error", error);
    return { uuid: null };
  }
}

app.post('/generate', async (req: Request, res: Response) => {
  let { batch_size }: { batch_size: number } = req.body;
  if (!batch_size || typeof batch_size !== 'number') {
    batch_size = 1;
  }
  // run in parallel
  const promises = [];
  for (let i = 0; i < batch_size; i++) {
    promises.push(generateOne(null));
  }
  try {
    const results = await Promise.all(promises);
    const nonNull = results.find((result) => result !== null);
    if (nonNull) {
      const { uuid } = nonNull;
      res.status(200).send({ uuid });
    }
    else {
      res.status(500).send({ message: 'Error generating obituary' });
    }
  } catch (error) {
    console.error("generate error", error);
    res.status(500).send({ message: 'Error generating obituary' });
  }
});

app.post('/move', (req: Request, res: Response) => {
  const { uuid, liked } = req.body;
  if (!uuid || typeof liked !== 'boolean') {
    return res.status(400).send({ message: 'Invalid request body' });
  }

  const sourceJson = path.join(__dirname, '../public/development/obituaries', `${uuid}.json`);
  const sourcePng = path.join(__dirname, '../public/development/obituaries', `${uuid}.png`);
  const targetDir = liked ? '../public/production/obituaries' : '../public/discarded/obituaries';
  const targetJson = path.join(__dirname, targetDir, `${uuid}.json`);
  const targetPng = path.join(__dirname, targetDir, `${uuid}.png`);

  try {
    fs.renameSync(sourceJson, targetJson);
    if (fs.existsSync(sourcePng)) {
      fs.renameSync(sourcePng, targetPng);
    } else {
      console.warn(`PNG file not found for UUID: ${uuid}`);
    }

    const navDirs = ['../public/production', '../public/development', '../public/discarded'];
    navDirs.forEach((dir) => {
      const navFile = path.join(__dirname, dir, 'navigation.json');
      if (fs.existsSync(navFile)) {
        const navData = JSON.parse(fs.readFileSync(navFile, 'utf-8'));

        if (liked && dir.includes('production')) {
          navData.order.push(uuid);
        } else if (!liked && dir.includes('discarded')) {
          navData.order.push(uuid);
        } else if (dir.includes('development')) {
          const index = navData.order.indexOf(uuid);
          if (index !== -1) {
            navData.order.splice(index, 1);
          }
        }
        fs.writeFileSync(navFile, JSON.stringify(navData, null, 2));
      }
    });

    res.status(200).send({ message: 'Content moved successfully' });
  } catch (error) {
    console.error("move error", error);
    res.status(500).send({ message: 'Error moving content' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});