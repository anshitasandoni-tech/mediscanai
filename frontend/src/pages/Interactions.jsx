import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Search, RotateCcw, Clock, Globe } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://mediscan-ai-backend.onrender.com');

export default function Interactions() {
    const [medicines, setMedicines] = useState(['', '']);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('english');

    const checkInteractions = async () => {
        const validMeds = medicines.filter(m => m.trim() !== '');
        if (validMeds.length < 2) return alert("Enter at least 2 medicines");

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/check-interaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicines: validMeds })
            });
            if (res.status === 429) {
                setResult({
                    interaction_level: 'Busy',
                    explanation: 'AI is currently busy. Please wait 10 seconds and try again.'
                });
                return;
            }
            const data = await res.json();
            console.log("Interaction checker result:", data);

            if (!res.ok || data.error) {
                setResult({
                    interaction_level: 'Error',
                    explanation: data.error || 'Server error occurred during the check.'
                });
            } else {
                setResult(data);
            }
        } catch (error) {
            console.log("Error checking interactions:", error);
            console.error(error);
            setResult({
                interaction_level: 'Error',
                explanation: 'A network error occurred while reaching the database.'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateMed = (index, value) => {
        const newMeds = [...medicines];
        newMeds[index] = value;
        setMedicines(newMeds);
    };

    const getLevelColor = (level) => {
        if (level === 'Safe') return 'var(--success)';
        if (level === 'Caution') return '#eab308';
        if (level === 'Busy') return '#3b82f6';
        if (level === 'Error') return 'var(--danger)';
        return 'var(--danger)';
    };

    const resetForm = () => {
        setMedicines(['', '']);
        setResult(null);
    };

    const getExplanationText = () => {
        if (!result) return '';
        if (result.error) return `Error: ${result.error}`;
        if (!result.explanation) return 'No details found.';
        if (typeof result.explanation === 'string') return result.explanation;
        return result.explanation[language] || result.explanation['english'] || 'No details found.';
    };

    const renderHighlightedText = (text, medicinesToHighlight) => {
        if (!text) return null;
        const validMeds = medicinesToHighlight.filter(m => m.trim() !== '');
        if (validMeds.length === 0) return text;

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(${validMeds.map(escapeRegExp).join('|')})`, 'gi');
        
        const parts = text.split(pattern);
        
        return parts.map((part, index) => {
            if (validMeds.some(m => m.toLowerCase() === part.toLowerCase())) {
                return (
                    <span key={index} style={{ 
                        fontWeight: 'bold', 
                        color: '#eab308', 
                        textShadow: '0 0 8px rgba(234, 179, 8, 0.3)' 
                    }}>
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0' }}>Drug Interaction <span className="gradient-text">Checker</span></h1>
                <p style={{ color: 'var(--text-muted)' }}>Ensure your drug combinations are safe to consume.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                {medicines.map((med, idx) => (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                        <input
                            className="input-field"
                            type="text"
                            placeholder={`Medicine ${idx + 1}`}
                            value={med}
                            onChange={(e) => updateMed(idx, e.target.value)}
                        />
                    </div>
                ))}

                <button
                    style={{ background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer', marginBottom: '1rem', padding: '0.5rem 0' }}
                    onClick={() => setMedicines([...medicines, ''])}
                >
                    + Add Another Medicine
                </button>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '12px' }}>
                    <button
                        className="btn"
                        onClick={checkInteractions}
                        disabled={loading}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            minHeight: '48px',
                            fontWeight: '600',
                            background: loading ? 'rgba(59, 130, 246, 0.2)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: loading ? '#60a5fa' : '#1e293b',
                            border: loading ? '1px solid rgba(59, 130, 246, 0.5)' : 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        {loading ? (
                            <div className="ring-spinner" title="Consulting FDA Records..."></div>
                        ) : (
                            <><Search size={20} /> Check Interactions</>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={resetForm}
                        className="reset-btn-3d"
                        disabled={loading}
                        title="Clear Inputs"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {result && (
                <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', borderLeft: `4px solid ${getLevelColor(result.interaction_level || result.status || 'Unknown')}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {(result.interaction_level || result.status) === 'Safe' ? <CheckCircle color="var(--success)" size={32} /> : 
                             (result.interaction_level || result.status) === 'Busy' ? <Clock color="#3b82f6" size={32} /> : 
                             <ShieldAlert color={getLevelColor(result.interaction_level || result.status || 'Unknown')} size={32} />}
                            <h2 style={{ margin: 0, color: getLevelColor(result.interaction_level || result.status || 'Unknown') }}>
                                {result.interaction_level || result.status || 'Status Unknown'}
                            </h2>
                        </div>
                        
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Globe size={16} style={{ position: 'absolute', left: '10px', pointerEvents: 'none', color: 'var(--accent)' }} />
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '0.5rem 2rem 0.5rem 2.2rem',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <option value="english">English</option>
                                <option value="hindi">Hindi (हिंदी)</option>
                                <option value="marathi">Marathi (मराठी)</option>
                            </select>
                            <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap', minHeight: '120px' }}>
                        {renderHighlightedText(getExplanationText(), medicines)}
                    </p>
                </div>
            )}
        </div>
    );
}
