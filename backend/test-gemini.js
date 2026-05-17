const apiKey = "AIzaSyAbrG7LJzRTdIQGPSco5kpY5V5JlSkPccI";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
     const textModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => m.name);
     console.log("Text models:", textModels);
  })
  .catch(console.error);
