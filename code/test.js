const API_KEY = "";
const projectId = "gen-lang-client-0587018346";
const location = "us-central1";  // Modify based on your location
const modelId = "gemini-1.5-flash-002";
const batchSize = 3; // Adjust this based on API limits and your needs

// Function to send a batch request to Vertex AI
async function sendBatchPredictionRequest(titles) {
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models/${modelId}:predict?key=${API_KEY}`;

  const instances = titles.map((title) => ({ content: title }));
  const payload = {
    instances: instances,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Batch Prediction Result:", result);
    return result;
  } catch (error) {
    console.error("Failed to get batch prediction:", error);
    return null;
  }
}

// Function to process batches of titles
async function processBatches(videoTitles) {
  const results = [];
  for (let i = 0; i < videoTitles.length; i += batchSize) {
    const batch = videoTitles.slice(i, i + batchSize);
    console.log(`Sending batch from index ${i} to ${i + batchSize}`);
    const batchResult = await sendBatchPredictionRequest(batch);

    if (batchResult) {
      results.push(batchResult);
    }

    // Optional: Pause between requests to avoid hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.log("All batch requests completed.");
  return results;
}

// Usage
const videoTitles = [
  "is the title `HTML for begineers` related to coding?",
  "is the title `HTML for begineers` related to Web Development?",
  "is the title `HTML for begineers` related to Placements?",
];

processBatches(videoTitles).then((allResults) => {
  console.log("Final Prediction Results:", allResults);
});
