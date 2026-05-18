require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testScan() {
    try {
        console.log("Loading pill1.webp...");
        const imagePath = path.join(__dirname, '..', 'pill1.webp');
        if (!fs.existsSync(imagePath)) {
            console.error("Image pill1.webp not found at path:", imagePath);
            return;
        }
        
        const fileBuffer = fs.readFileSync(imagePath);
        
        console.log("Initializing Gemini AI...");
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY not found in .env!");
            return;
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        const imagePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType: "image/webp"
            }
        };
        
        const prompt = `You are a professional medical assistant and AI vision drug scanner.
Analyze this image of a medicine container, package, blister pack, bottle, or pill.
Identify the main active medicine / pharmaceutical drug name from the image.
If there are multiple medicines or the image is unclear, identify the most prominent medicine in the image.

Provide a detailed analysis in a strictly formatted JSON response in BOTH English and Hindi. Do not include any markdown format or code blocks (like \`\`\`json). The response must be a single, valid JSON object matching exactly this schema:
{
  "name": "Common brand name or scientific name (e.g. Amoxicillin)",
  "english": {
    "uses": "Clear, patient-friendly description of what this medicine is used to treat in English.",
    "dosage": "Typical standard dosage instructions (e.g., '250mg to 500mg every 8 hours') in English. Include a disclaimer that the patient must follow their doctor's instructions.",
    "sideEffects": "Common side effects to be aware of (e.g., 'Nausea, vomiting, diarrhea, rash') in English.",
    "precautions": "Important safety precautions and warnings (e.g., 'Do not use if allergic to penicillin. Consult your doctor if you have kidney disease.') in English."
  },
  "hindi": {
    "uses": "Patient-friendly description of what this medicine is used to treat translated into natural Hindi script, but keep medicine brand/chemical names in English (e.g., Paracetamol, Amoxicillin).",
    "dosage": "Typical standard dosage instructions translated into natural Hindi script, but keep numbers and medicine names in English characters. Include a disclaimer to follow doctor's instructions.",
    "sideEffects": "Common side effects translated into natural Hindi script, keeping medicine names in English characters.",
    "precautions": "Important safety precautions and warnings translated into natural Hindi script, keeping medicine/allergen names in English characters."
  }
}

If you cannot identify any medicine from the image, please return a placeholder result with name "Unknown Medicine" and explain in both english.uses and hindi.uses that the image was not clear enough to identify a medicine, and ask the user to upload a clearer photo.`;

        console.log("Calling Gemini Vision API...");
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().trim();
        
        console.log("Raw Response received:");
        console.log(text);
        
        console.log("\nParsing JSON...");
        const parsed = JSON.parse(text);
        console.log("Successfully parsed JSON! Result:");
        console.log(JSON.stringify(parsed, null, 2));
    } catch (err) {
        console.error("Test failed with error:", err);
    }
}

testScan();
