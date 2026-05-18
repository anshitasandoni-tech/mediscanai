require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.chat = async (req, res) => {
    console.log('API Key Loaded:', !!process.env.GEMINI_API_KEY);
    
    try {
        const { message, history, language = 'English' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let reply = "";

        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'put_your_gemini_api_key_here') {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            console.log('Attempting Gemini connection with model: gemini-2.5-flash-lite');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            
            const contextualMessage = `You are MediScan AI. You must respond in ${language}. Your reply must be strictly between 4 to 5 lines long. Use simple, easy-to-understand terms.

User message: ${message}`;
            
            let result;
            try {
                result = await model.generateContent(contextualMessage);
            } catch (err) {
                console.log("Error in chat content generation:", err);
                if (err.status === 429 || err.status === 503 || (err.message && (err.message.includes('429') || err.message.includes('503')))) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    result = await model.generateContent(contextualMessage);
                } else {
                    throw err;
                }
            }
            reply = result.response.text();
        } else {
            // Mock fallback logic
            await new Promise(resolve => setTimeout(resolve, 1000));
            const msg = message.toLowerCase();
            if (msg.includes("headache")) {
                reply = "For a headache, over-the-counter options like Paracetamol or Ibuprofen are commonly used. However, remember to stay hydrated and consult a doctor if the pain persists.";
            } else if (msg.includes("fever")) {
                reply = "For a mild fever, Paracetamol (Acetaminophen) is commonly recommended to reduce temperature. Be sure to drink plenty of fluids and rest. If the fever is high (above 103°F or 39.4°C) or lasts more than 3 days, please see a doctor immediately.";
            } else if (msg.includes("cough") || msg.includes("cold")) {
                reply = "For a common cold or cough, over-the-counter cough syrups can help. Drink warm tea with honey and get plenty of rest.";
            } else if (msg.includes("side effects") && msg.includes("amoxicillin")) {
                reply = "Common side effects of Amoxicillin include nausea, vomiting, diarrhea, and mild skin rash. If you experience severe reactions like difficulty breathing, seek immediate medical attention.";
            } else {
                reply = `You sent: "${message}".\n\n[MOCK MODE ACTIVE] You have not configured a valid 'GEMINI_API_KEY' in your backend/.env file. Please add your real key to use the AI chatbot.`;
            }
        }

        return res.json({ reply });

    } catch (error) {
        console.log("Error in chat endpoint:", error);
        console.error("Gemini API Error details:", error.message ? error.message : error);
        
        const status = error.status || 500;
        const msg = error.message || "";
        
        if (status === 429 || status === 503 || msg.includes('429') || msg.includes('503')) {
            return res.status(status === 503 ? 503 : 429).json({ error: 'AI is temporarily busy or unavailable. Please try again in a moment.' });
        }
        
        if ([400, 401, 403, 404].includes(status) || msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("unauthorized")) {
            return res.json({ reply: "⚠️ **API Error**: The Gemini API key you provided in `.env` is either invalid, expired, or unauthorized. Please generate a new key at Google AI Studio and update your `.env` file." });
        }
        
        return res.json({ reply: 'AI is currently unavailable, please try again later.' });
    }
};
