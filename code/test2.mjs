import express from 'express';
import natural from 'natural';
import PQueue from 'p-queue';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
// app.use(express.json()); // Middleware for parsing JSON bodies
const port = 3000;


// Configure Google Generative AI with your API key
const genAI = new GoogleGenerativeAI("AIzaSyDRgF-7cPQGUoaV7UiLMrYuAloG79CijME");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configure the queue to limit Gemini API requests to 15 per minute
const queue = new PQueue({ interval: 60000, intervalCap: 15 });

// Simple keyword matching function using Natural library
function keywordMatch(title, keywords) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(title.toLowerCase());
  return keywords.some(keyword => tokens.includes(keyword.toLowerCase()));
}

// Store cached results for repeated video titles
const cache = new Map();

// Helper function to send a request to the Gemini API
async function sendGeminiRequest(title, keyword) {
  try {
    const result = await model.generateContent(`is the title "${title}" related to "${keyword}"? Say yes or no.`);
    //console.log(result.response.text());
    // Assume relevance is determined by the response text (adjust logic as needed)
    return result.response.text().toLowerCase().includes("yes") ? "yes" : "no";
  } catch (error) {
    console.error("Error in Gemini API request:", error);
    return "ambiguous"; // Fallback in case of error
  }
}

// Endpoint to handle video filtering
app.post('/filter-videos', express.json(), async (req, res) => {
  console.log(req.body);
  const { titles, keywords } = req.body;
  const results = [];
  console.log(`Received video titles: ${titles}`);

  for (const title of titles) {
    // First check cache to avoid redundant API calls
    if (cache.has(title)) {
      results.push({ title, relevance: cache.get(title) });
      continue;
    }

    // Perform keyword matching
    const isRelevant = keywordMatch(title, keywords);

    if (isRelevant) {
      // Directly mark as relevant if keyword match is positive
      results.push({ title, relevance: 'yes' });
      cache.set(title, 'yes'); // Cache the result
    } else {
      // For ambiguous titles, queue the API request
      queue.add(async () => {
        const relevance = await sendGeminiRequest(title, keywords[0]);
        console.log(`Gemini API response for "${title}": ${relevance}`);
        results.push({ title, relevance });
        cache.set(title, relevance); // Cache the result for future
      });
    }
  }

  // Process the queue and return the results once complete
  await queue.onIdle();
  res.json(results);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
