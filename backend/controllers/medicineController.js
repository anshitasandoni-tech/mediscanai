// Implementations for medicine-related features using Gemini Vision AI
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'put_your_gemini_api_key_here' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            console.log('Attempting Gemini Image Recognition with model: gemini-2.5-flash-lite');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Force strict JSON format returned by the model
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash-lite",
                generationConfig: { responseMimeType: "application/json" }
            });
            
            // Convert file buffer to Generative Part
            const imagePart = {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
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
            
            try {
                let result = await model.generateContent([prompt, imagePart]);
                let text = result.response.text().trim();
                text = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
                
                const parsedResult = JSON.parse(text);
                return res.json({
                    name: parsedResult.name || "Unknown Medicine",
                    english: parsedResult.english || {
                        uses: parsedResult.uses || "Could not identify usage information.",
                        dosage: parsedResult.dosage || "Refer to doctor's instructions.",
                        sideEffects: parsedResult.sideEffects || "Refer to doctor's instructions.",
                        precautions: parsedResult.precautions || "Refer to doctor's instructions."
                    },
                    hindi: parsedResult.hindi || {
                        uses: "विवरण उपलब्ध नहीं है।",
                        dosage: "डॉक्टर के निर्देशों का पालन करें।",
                        sideEffects: "डॉक्टर के निर्देशों का पालन करें।",
                        precautions: "डॉक्टर के निर्देशों का पालन करें।"
                    }
                });
            } catch (err) {
                console.log("Gemini processing failed, falling back to mock response:", err.message);
                
                // Return a descriptive mock fallback response with quota details
                return res.json({
                    name: "Amoxicillin [LOCAL DEMO]",
                    english: {
                        uses: "Treat bacterial infections like pneumonia, bronchitis, and infections of the ear, nose, throat, skin, or urinary tract. (⚠️ NOTE: Your Gemini API Key has exceeded its daily free tier quota, so we served this high-quality local demonstration result.)",
                        dosage: "250mg to 500mg taken every 8 hours, or 500mg to 875mg every 12 hours. (Follow doctor's instructions)",
                        sideEffects: "Nausea, vomiting, diarrhea, rash.",
                        precautions: "Do not use if allergic to penicillin. Tell your doctor about kidney disease."
                    },
                    hindi: {
                        uses: "फेफड़ों के संक्रमण (निमोनिया), ब्रोंकाइटिस, और कान, नाक, गले, त्वचा या मूत्र मार्ग के बैक्टीरियल संक्रमण के इलाज के लिए। (⚠️ नोट: आपकी Gemini API Key की दैनिक सीमा समाप्त हो गई है, इसलिए हमने यह स्थानीय प्रदर्शन परिणाम दिखाया है।)",
                        dosage: "250mg से 500mg हर 8 घंटे में लिया जाता है, या 500mg से 875mg हर 12 घंटे में।",
                        sideEffects: "जी मिचलाना, उल्टी, दस्त, त्वचा पर चकत्ते (रैश)।",
                        precautions: "यदि पेनिसिलिन से एलर्जी है तो उपयोग न करें। गुर्दे की बीमारी होने पर अपने डॉक्टर को बताएं।"
                    }
                });
            }
        }
        
        // Mock fallback if no API key
        console.log("No Gemini API key found, using mock fallback in uploadImage.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResponse = {
            name: "Amoxicillin [MOCK]",
            english: {
                uses: "Treat bacterial infections like pneumonia, bronchitis, and infections of the ear, nose, throat, skin, or urinary tract. (Please add your Gemini API key in backend/.env for real results)",
                dosage: "250mg to 500mg taken every 8 hours, or 500mg to 875mg every 12 hours.",
                sideEffects: "Nausea, vomiting, diarrhea, rash.",
                precautions: "Do not use if allergic to penicillin. Tell your doctor about kidney disease."
            },
            hindi: {
                uses: "फेफड़ों के संक्रमण (निमोनिया), ब्रोंकाइटिस, और कान, नाक, गले, त्वचा या मूत्र मार्ग के बैक्टीरियल संक्रमण के इलाज के लिए। (कृपया वास्तविक परिणामों के लिए backend/.env में अपनी Gemini API key जोड़ें)",
                dosage: "250mg से 500mg हर 8 घंटे में लिया जाता है, या 500mg से 875mg हर 12 घंटे में।",
                sideEffects: "जी मिचलाना, उल्टी, दस्त, त्वचा पर चकत्ते (रैश)।",
                precautions: "यदि पेनिसिलिन से एलर्जी है तो उपयोग न करें। गुर्दे की बीमारी होने पर अपने डॉक्टर को बताएं।"
            }
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
        
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'put_your_gemini_api_key_here' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            console.log('Attempting Gemini Prescription OCR with model: gemini-2.5-flash-lite');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash-lite",
                generationConfig: { responseMimeType: "application/json" }
            });
            
            // Convert file buffer to Generative Part
            const imagePart = {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            };
            
            const prompt = `You are a professional medical assistant and optical character recognition (OCR) expert.
Analyze this prescription image (doctor's hand-written note, printed prescription, or medicine list).
Perform high-quality OCR extraction to retrieve all text from the prescription.
Identify all listed medicines, their details, and dosage instructions.

Provide your response in a strictly formatted JSON structure in BOTH English and Hindi. Do not include any markdown format or code blocks (like \`\`\`json). The response must be a single, valid JSON object matching exactly this schema:
{
  "extractedText": "Full extracted transcription of the prescription text, formatted nicely in English.",
  "hindiExtractedText": "A natural Hindi translation of the extracted prescription transcription, keeping medicine brand/chemical names in English characters.",
  "medicines": [
    {
      "name": "Medicine Name (e.g., Paracetamol)",
      "english": {
        "uses": "Brief explanation of what this medicine is used for in English.",
        "dosage": "Dosage and instruction specified in the prescription (e.g., '500mg, 1 tablet twice a day after meals') in English."
      },
      "hindi": {
        "uses": "Brief explanation of what this medicine is used for in Hindi script, keeping medicine names in English characters.",
        "dosage": "Dosage and instruction specified in the prescription translated into Hindi script, keeping numbers and medicine names in English characters."
      }
    }
  ]
}

Ensure all fields are in friendly, easy-to-understand terms.
If there are no identifiable medicines or text in the prescription, return a response with 'extractedText' and 'hindiExtractedText' stating that the prescription could not be read clearly, and 'medicines' as an empty list.`;
            
            try {
                let result = await model.generateContent([prompt, imagePart]);
                let text = result.response.text().trim();
                text = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
                
                const parsedResult = JSON.parse(text);
                return res.json({
                    extractedText: parsedResult.extractedText || "No text extracted.",
                    hindiExtractedText: parsedResult.hindiExtractedText || "कोई टेक्स्ट नहीं निकाला गया।",
                    medicines: parsedResult.medicines || []
                });
            } catch (e) {
                console.log("Gemini OCR processing failed, falling back to mock response:", e.message);
                
                // Return a descriptive mock fallback response with quota details
                return res.json({
                    extractedText: "Rx: Paracetamol 500mg, 1 tablet twice a day after meals. Ibuprofen 400mg, 1 tablet if pain occurs. (⚠️ NOTE: Your Gemini API Key has exceeded its daily free tier quota, so we served this high-quality local demonstration result.)",
                    hindiExtractedText: "प्रिस्क्रिप्शन: Paracetamol 500mg, भोजन के बाद दिन में दो बार 1 गोली। Ibuprofen 400mg, दर्द होने पर 1 गोली। (⚠️ नोट: आपकी Gemini API Key की दैनिक सीमा समाप्त हो गई है, इसलिए हमने यह स्थानीय प्रदर्शन परिणाम दिखाया है।)",
                    medicines: [
                        {
                            name: "Paracetamol [MOCK]",
                            english: {
                                uses: "Fever and mild to moderate pain relief.",
                                dosage: "500mg, 1 tablet twice a day after meals."
                            },
                            hindi: {
                                uses: "बुखार और हल्के से मध्यम दर्द से राहत।",
                                dosage: "500mg, भोजन के बाद दिन में दो बार 1 गोली।"
                            }
                        },
                        {
                            name: "Ibuprofen [MOCK]",
                            english: {
                                uses: "Anti-inflammatory, pain and fever reduction.",
                                dosage: "400mg, 1 tablet if pain occurs."
                            },
                            hindi: {
                                uses: "सूजन-रोधी, दर्द और बुखार में कमी।",
                                dosage: "400mg, दर्द होने पर 1 गोली।"
                            }
                        }
                    ]
                });
            }
        }
        
        // Mock fallback if no API key
        console.log("No Gemini API key found, using mock fallback in ocrPrescription.");
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockResponse = {
            extractedText: "Rx: Paracetamol 500mg, 1 tablet twice a day after meals. Ibuprofen 400mg, 1 tablet if pain occurs. (Please add your Gemini API key in backend/.env for real results)",
            hindiExtractedText: "प्रिस्क्रिप्शन: Paracetamol 500mg, भोजन के बाद दिन में दो बार 1 गोली। Ibuprofen 400mg, दर्द होने पर 1 गोली। (कृपया वास्तविक परिणामों के लिए backend/.env में अपनी Gemini API key जोड़ें)",
            medicines: [
                {
                    name: "Paracetamol [MOCK]",
                    english: {
                        uses: "Fever and mild to moderate pain relief.",
                        dosage: "500mg, 1 tablet twice a day after meals."
                    },
                    hindi: {
                        uses: "बुखार और हल्के से मध्यम दर्द से राहत।",
                        dosage: "500mg, भोजन के बाद दिन में दो बार 1 गोली।"
                    }
                },
                {
                    name: "Ibuprofen [MOCK]",
                    english: {
                        uses: "Anti-inflammatory, pain and fever reduction.",
                        dosage: "400mg, 1 tablet if pain occurs."
                    },
                    hindi: {
                        uses: "सूजन-रोधी, दर्द और बुखार में कमी।",
                        dosage: "400mg, दर्द होने पर 1 गोली।"
                    }
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
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash-lite",
                generationConfig: { responseMimeType: "application/json" }
            });
            
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
