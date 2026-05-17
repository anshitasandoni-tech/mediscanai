// Mock implementations for medicine-related features

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        // Mock processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock Vision + FDA response
        const mockResponse = {
            name: "Amoxicillin",
            uses: "Treat bacterial infections like pneumonia, bronchitis, and infections of the ear, nose, throat, skin, or urinary tract.",
            dosage: "250mg to 500mg taken every 8 hours, or 500mg to 875mg every 12 hours.",
            sideEffects: "Nausea, vomiting, diarrhea, rash.",
            precautions: "Do not use if allergic to penicillin. Tell your doctor about kidney disease."
        };
        
        res.json(mockResponse);
    } catch (error) {
        console.log("Error in uploadImage:", error);
        console.error(error);
        res.status(500).json({ error: 'Failed to process image' });
    }
};

exports.ocrPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No prescription image uploaded' });
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResponse = {
            extractedText: "Rx: Paracetamol 500mg, 1 tablet twice a day after meals. Ibuprofen 400mg, 1 tablet if pain occurs.",
            medicines: [
                {
                    name: "Paracetamol",
                    uses: "Fever and mild to moderate pain relief.",
                    dosage: "500mg, 1 tablet twice a day after meals."
                },
                {
                    name: "Ibuprofen",
                    uses: "Anti-inflammatory, pain and fever reduction.",
                    dosage: "400mg, 1 tablet if pain occurs."
                }
            ]
        };
        
        res.json(mockResponse);
    } catch (error) {
        console.log("Error in ocrPrescription:", error);
        console.error(error);
        res.status(500).json({ error: 'Failed to extract text from prescription' });
    }
};

exports.checkInteraction = async (req, res) => {
    try {
        const { medicines } = req.body;
        if (!medicines || medicines.length < 2) {
            return res.status(400).json({ error: 'Please provide at least 2 medicines to check' });
        }
        
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'put_your_gemini_api_key_here' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            const axios = require('axios');
            let fdaReport = "";
            let eventCount = 0;
            
            if (medicines.length === 2) {
                try {
                    const drug1 = encodeURIComponent(medicines[0].toLowerCase());
                    const drug2 = encodeURIComponent(medicines[1].toLowerCase());
                    let fdaUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${drug1}"+AND+patient.drug.medicinalproduct:"${drug2}"&limit=1`;
                    if (process.env.OPENFDA_API_KEY) fdaUrl += `&api_key=${process.env.OPENFDA_API_KEY}`;
                    
                    const fdaRes = await axios.get(fdaUrl);
                    if (fdaRes.data && fdaRes.data.meta && fdaRes.data.meta.results) {
                        eventCount = fdaRes.data.meta.results.total;
                        fdaReport = `Found ${eventCount} reported adverse events on OpenFDA where patients took both ${medicines[0]} and ${medicines[1]}.`;
                    }
                } catch (err) {
                    console.log("OpenFDA error:", err);
                    if (err.response && err.response.status === 404) {
                        fdaReport = `Checked OpenFDA for ${medicines[0]} and ${medicines[1]}. 0 reported adverse events found for this specific combination.`;
                        eventCount = 0;
                    } else {
                        console.error('OpenFDA error:', err.message);
                        fdaReport = `Could not fetch specific OpenFDA interactive event data at this time.`;
                    }
                }
            } else {
                fdaReport = "OpenFDA query skipped (multi-drug combinations). Please rely on general medical database knowledge.";
            }

            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const prompt = `You are a medical drug interaction analyst.
            
I am providing you a list of drugs to analyze for interactions.
Drugs to check: ${JSON.stringify(medicines)}

OpenFDA Database findings for this combination:
"${fdaReport}"

🔹 YOUR TASK:
Classify the interaction between these drugs. If OpenFDA reported 0 events, perform a cross-reference check utilizing your own general medical database knowledge to determine if there are known theoretical or documented interactions. Provide a specific explanation about that drug combination.

🔹 EXPLANATION FORMATTING RULES:
Language: Use simple, non-medical language (like you're talking to a friend).
Paragraph 1 (Medicine A): Explain what the first medicine is and what it does simply.
Paragraph 2 (Medicine B): Explain what the second medicine is and what it does simply.
Paragraph 3 (The Interaction): Explain clearly why they shouldn't be taken together and what the user should do (e.g., 'Contact your doctor').
Output Format: Use double line breaks (\\n\\n) between paragraphs so it looks clean on the screen.
IMPORTANT: Always keep the exact medicine names in English characters (do not translate or transliterate the medicine names into Hindi/Marathi script), so they can be highlighted in the UI.

🔹 CLASSIFICATION RULE:
You MUST classify the interaction strictly as exactly one of the following three words:
- "Safe" (No significant or known interaction, or generally considered safe to combine)
- "Caution" (Use with caution, possible mild/moderate interaction)
- "Dangerous" (Potentially severe interaction or unsafe to combine)

🔹 RESPONSE FORMAT:
Return structured JSON literally exactly matching this structure (no markdown tags):
{
  "interaction_level": "Safe | Caution | Dangerous",
  "explanation": {
    "english": "Your explanation following the EXACT formatting rules above in English.",
    "hindi": "The exact same explanation translated to Hindi, but keep medicine names in English.",
    "marathi": "The exact same explanation translated to Marathi, but keep medicine names in English."
  }
}`;
            
            let result;
            try {
                result = await model.generateContent(prompt);
            } catch (err) {
                console.log("Gemini generation error:", err);
                if (err.status === 429 || err.status === 503) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    result = await model.generateContent(prompt);
                } else {
                    throw err;
                }
            }
            let text = result.response.text().trim();
            
            // Strictly strip out any markdown formatting or backticks
            text = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
            
            try {
                const parsedResult = JSON.parse(text);
                return res.json({
                    interaction_level: parsedResult.interaction_level || "Unknown",
                    explanation: parsedResult.explanation || "No explanation provided."
                });
            } catch (e) {
                console.log("Error parsing JSON:", e);
                console.error("Failed to parse Gemini response exactly as JSON:", text);
                return res.json({
                    interaction_level: "Unknown",
                    explanation: "The AI provided an explanation, but we couldn't format it properly. Here is the raw response:\n\n" + text
                });
            }
        }

        // Mock fallback if no API key
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (medicines.some(m => m.toLowerCase().includes('ibuprofen')) && 
            medicines.some(m => m.toLowerCase().includes('aspirin'))) {
            return res.json({
                interaction_level: "Dangerous",
                explanation: {
                    english: "[MOCK] Taking Ibuprofen and Aspirin together can increase the risk of stomach bleeding and ulcers.",
                    hindi: "[MOCK] Ibuprofen और Aspirin को एक साथ लेने से पेट से खून बहने और अल्सर का खतरा बढ़ सकता है।",
                    marathi: "[MOCK] Ibuprofen आणि Aspirin एकत्र घेतल्यास पोटातील रक्तस्त्राव आणि अल्सरचा धोका वाढू शकतो."
                }
            });
        }
        
        res.json({
            interaction_level: "Safe",
            explanation: {
                english: "[MOCK] No major interactions found between these medicines. Please add your Gemini API key in backend/.env for real results.",
                hindi: "[MOCK] इन दवाओं के बीच कोई बड़ा इंटरैक्शन नहीं पाया गया। वास्तविक परिणामों के लिए कृपया अपनी Gemini API कुंजी जोड़ें।",
                marathi: "[MOCK] या औषधांमध्ये कोणताही मोठा संवाद आढळला नाही. खऱ्या परिणामांसाठी कृपया तुमची Gemini API की जोडा."
            }
        });
    } catch (error) {
        console.log("Error in checkInteraction:", error);
        console.error(error);
        if (error.status === 429 || error.status === 503 || (error.message && (error.message.includes('429') || error.message.includes('503')))) {
             return res.status(error.status === 503 ? 503 : 429).json({ error: error.status === 503 ? 'Service temporarily unavailable' : 'Too many requests' });
        }
        if (error.status === 400 || error.message?.toLowerCase().includes("api key")) {
             return res.json({
                 interaction_level: "Dangerous",
                 explanation: "⚠️ API Key Error: Your Gemini API key is expired or invalid. Please update it in backend/.env."
             });
        }
        res.status(500).json({ error: 'Interaction check failed' });
    }
};

exports.getMedicineInfo = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Missing medicine query' });
        }
        
        res.json({
            name: query.toUpperCase(),
            uses: "Mock usage description for " + query,
            sideEffects: "Mock side effects",
            precautions: "Mock precautions list"
        });
    } catch (error) {
        console.log("Error in getMedicineInfo:", error);
        console.error("Error getting medicine info:", error);
        res.status(500).json({ error: 'Failed to get medicine info' });
    }
};
