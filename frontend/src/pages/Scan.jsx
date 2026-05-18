import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import { Volume2 } from 'lucide-react';

export default function Scan() {
    const [result, setResult] = useState(null);
    const [type, setType] = useState(null);
    const [language, setLanguage] = useState('english'); // 'english' or 'hindi'

    const handleResult = (data, pType) => {
        setResult(data);
        setType(pType);
        setLanguage('english'); // Reset to English on new scan
    };

    const playAudio = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance();
        
        if (language === 'hindi') {
            utterance.lang = 'hi-IN';
            if (type === 'medicine') {
                const info = result.hindi || result;
                utterance.text = `${result.name || ''}. उपयोग: ${info.uses || ''}. सावधानियां: ${info.precautions || ''}`;
            } else {
                utterance.text = result.hindiExtractedText || result.extractedText || '';
            }
        } else {
            utterance.lang = 'en-US';
            if (type === 'medicine') {
                const info = result.english || result;
                utterance.text = `${result.name || ''}. Uses: ${info.uses || ''}. Precautions: ${info.precautions || ''}`;
            } else {
                utterance.text = result.extractedText || '';
            }
        }
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div>
            <div style={{ textAlign: 'center' }}>
                <h1>Intelligent <span className="gradient-text">Medical Scanner</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Instantly understand your medicines and prescriptions using Vision AI</p>
            </div>
            
            {!result ? (
                <ImageUploader onResult={handleResult} />
            ) : (
                <div className="glass-panel" style={{ padding: '2rem', marginTop: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>
                            {type === 'medicine' ? result.name : (language === 'hindi' ? "प्रिस्क्रिप्शन विवरण" : "Prescription Details")}
                        </h2>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ 
                                    background: 'rgba(255, 255, 255, 0.1)', 
                                    color: 'white', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px', 
                                    padding: '0.5rem 1rem', 
                                    fontSize: '1rem',
                                    outline: 'none',
                                    cursor: 'pointer' 
                                }}
                            >
                                <option value="english" style={{ background: '#1e293b' }}>English</option>
                                <option value="hindi" style={{ background: '#1e293b' }}>हिंदी (Hindi)</option>
                            </select>
                            
                            <button className="btn" onClick={playAudio} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Volume2 size={20} /> {language === 'hindi' ? "सुनें" : "Listen"}
                            </button>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '2rem', lineHeight: '1.6' }}>
                        {type === 'medicine' ? (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>
                                        {language === 'hindi' ? 'उपयोग (USES)' : 'USES'}
                                    </h4>
                                    <div>{(result[language] || result).uses}</div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>
                                        {language === 'hindi' ? 'खुराक (DOSAGE)' : 'DOSAGE'}
                                    </h4>
                                    <div>{(result[language] || result).dosage}</div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--danger)' }}>
                                        {language === 'hindi' ? 'दुष्प्रभाव (SIDE EFFECTS)' : 'SIDE EFFECTS'}
                                    </h4>
                                    <div>{(result[language] || result).sideEffects}</div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fbbf24' }}>
                                        {language === 'hindi' ? 'सावधानियां (PRECAUTIONS)' : 'PRECAUTIONS'}
                                    </h4>
                                    <div>{(result[language] || result).precautions}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <div>
                                     <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>
                                         {language === 'hindi' ? 'निकाला गया टेक्स्ट (EXTRACTED TEXT)' : 'EXTRACTED TEXT'}
                                     </h4>
                                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                                         {language === 'hindi' ? (result.hindiExtractedText || result.extractedText) : result.extractedText}
                                     </div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>
                                        {language === 'hindi' ? 'पहचानी गई दवाएं (IDENTIFIED MEDICINES)' : 'IDENTIFIED MEDICINES'}
                                    </h4>
                                    {result.medicines && result.medicines.map((med, idx) => {
                                        const info = med[language] || med;
                                        return (
                                            <div key={idx} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{med.name}</h5>
                                                <div style={{ color: 'var(--text-muted)' }}>
                                                    {info.uses} <br/> 
                                                    <strong>{language === 'hindi' ? 'खुराक: ' : 'Dosage: '}</strong> {info.dosage}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="btn" style={{ marginTop: '2rem', background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setResult(null)}>
                        {language === 'hindi' ? "दूसरा स्कैन करें" : "Scan Another"}
                    </button>
                </div>
            )}
        </div>
    );
}
