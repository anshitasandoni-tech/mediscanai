const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
     const textModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => m.name);
     console.log("Text models:", textModels);
  })
  .catch(console.error);
