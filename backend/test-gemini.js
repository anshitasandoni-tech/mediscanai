import fetch from 'node-fetch';

const apiKey = "[GCP_API_KEY]";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Testing Gemini API connection...");
console.log("API URL:", url);

fetch(url)
  .then(res => {
    if (!res.ok) {
      throw new Error(`API call failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  })