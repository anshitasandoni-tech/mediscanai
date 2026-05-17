import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Mic, Volume2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://mediscan-ai-backend.onrender.com');

export default function Chat() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am MediScan AI. How can I help you regarding your health or medications today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('English');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    const clearChat = () => {
        setMessages([{ role: 'bot', text: 'Hello! I am MediScan AI. How can I help you regarding your health or medications today?' }]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textToSubmit) => {
        if (!textToSubmit.trim()) return;

        const userMsg = textToSubmit.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, history: messages, language })
            });
            const data = await res.json();

            // Handle cases where data.reply is undefined (e.g., server returned { error: '...' })
            const botResponse = data.reply || data.error || "Sorry, I couldn't understand that.";
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        } catch (error) {
            console.log("Error during chat send:", error);
            console.error(error);
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I am having trouble connecting to the network right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        handleSend(input);
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Marathi' ? 'mr-IN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const speakText = (text) => {
        if (!window.speechSynthesis) {
            alert("Your browser does not support Text-to-Speech.");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'Hindi' ? 'hi-IN' : language === 'Marathi' ? 'mr-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="glass-panel" style={{ height: '70vh', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot color="var(--primary)" /> AI Medical Assistant
                </h2>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: '#1a1a1a',
                        border: '1px solid var(--glass-border)',
                        color: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option style={{ background: '#1a1a1a', color: '#ffffff' }} value="English">English</option>
                    <option style={{ background: '#1a1a1a', color: '#ffffff' }} value="Hindi">Hindi</option>
                    <option style={{ background: '#1a1a1a', color: '#ffffff' }} value="Marathi">Marathi</option>
                </select>
            </div>

            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        padding: '1rem',
                        borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        display: 'flex',
                        gap: '12px'
                    }}>
                        {msg.role === 'bot' && <Bot size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
                        <div style={{ lineHeight: '1.5', width: '100%', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {msg.text}
                            {msg.role === 'bot' && (
                                <button
                                    onClick={() => speakText(msg.text)}
                                    title="Read out loud"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.7)',
                                        cursor: 'pointer',
                                        marginTop: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.8rem',
                                        padding: 0
                                    }}
                                >
                                    <Volume2 size={16} /> Listen
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '16px 16px 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bot size={20} /> <span style={{ opacity: 0.7 }}>Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Ask about side effects, dosages..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="button" onClick={clearChat} className="btn" disabled={loading} style={{ padding: '12px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '50%' }} title="Reset Chat">
                    <RefreshCw size={20} />
                </button>
                <button
                    type="button"
                    onClick={startListening}
                    className="btn"
                    disabled={loading || isListening}
                    style={{
                        padding: '12px',
                        background: isListening ? 'var(--danger)' : 'transparent',
                        border: `1px solid ${isListening ? 'var(--danger)' : 'var(--primary)'}`,
                        color: isListening ? '#ffffff' : 'var(--primary)',
                        borderRadius: '50%',
                        animation: isListening ? 'pulse 1.5s infinite' : 'none'
                    }}
                    title="Speak"
                >
                    <Mic size={20} />
                </button>
                <button type="submit" className="btn" disabled={loading} style={{ padding: '12px', borderRadius: '50%' }}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
