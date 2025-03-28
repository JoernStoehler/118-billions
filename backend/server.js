import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

// POST /generate endpoint
app.post('/generate', (req, res) => {
  // Logic for generating content
  res.status(200).send({ message: 'Content generated successfully' });
});

// POST /move endpoint
app.post('/move', (req, res) => {
  // Logic for moving content
  res.status(200).send({ message: 'Content moved successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});