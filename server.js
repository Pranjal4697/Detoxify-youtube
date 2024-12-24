const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json()); // Middleware for parsing JSON bodies

// In-memory cache setup with expiration time of 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

const API_KEY='AIzaSyDRgF-7cPQGUoaV7UiLMrYuAloG79CijME';

// Rate limiter for outgoing API requests
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1-minute window
    max: 100, // Limit each IP to 100 requests per window
});

app.use('/api', apiRateLimiter);

// Endpoint to trigger batch prediction
app.post('/api/gemini', async (req, res) => {
    const {
      jobName,
      location,
      projectId,
      outputFormat,
        input
    } = req.body;
  
    // Construct the batch prediction request body
    const requestBody = JSON.stringify({
        jobName: 'batchPredictionJobs',
        location: location,
        projectId: 'gen-lang-client-0587018346',
        input: input, // Send your input data directly
        outputFormat: "json" // Specify to receive output as JSON
    });
  
    try {
      // Make the API request
      const response = await axios.post(`https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/batchPredictionJobs`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
           'Authorization': `Bearer ${API-KEY}`
        },
      });
  
      // Return the API response
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error making batch prediction request:', error.response ? error.response.data : error.message);
      res.status(500).json({
        error: 'Failed to make batch prediction request',
        details: error.response ? error.response.data : error.message,
      });
    }
  });
// YouTube API endpoint
app.get('/api/youtube', async (req, res) => {
    const query = req.query.query;
    const cacheKey = `youtube-${query}`;

    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: query,
                key: 'YOUR_YOUTUBE_API_KEY' // Replace with actual key
            }
        });
        cache.set(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from YouTube API:', error.message);
        res.status(500).json({ error: 'Error fetching from YouTube API', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
