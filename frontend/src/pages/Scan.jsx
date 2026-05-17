import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import { Volume2 } from 'lucide-react';

export default function Scan() {
    const [result, setResult] = useState(null);
    const [type, setType] = useState(null);

    const handleResult = (data, pType) => {
        setResult(data);
        setType(pType);
    };

    const playAudio = () => {
        // Mock TTS functionality
        const utterance = new SpeechSynthesisUtterance();
        if(type === 'medicine') {
             utterance.text = `${result.name}. Uses: ${result.uses}. ${result.precautions}`;
        } else {
             utterance.text = result.extractedText;
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>
                            {type === 'medicine' ? result.name : "Prescription Details"}
                        </h2>
                        <button className="btn" onClick={playAudio}>
                            <Volume2 size={20} /> Listen
                        </button>
                    </div>
                    
                    <div style={{ marginTop: '2rem', lineHeight: '1.6' }}>
                        {type === 'medicine' ? (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>USES</h4>
                                    <div>{result.uses}</div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>DOSAGE</h4>
                                    <div>{result.dosage}</div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--danger)' }}>SIDE EFFECTS</h4>
                                    <div>{result.sideEffects}</div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fbbf24' }}>PRECAUTIONS</h4>
                                    <div>{result.precautions}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <div>
                                     <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>EXTRACTED TEXT</h4>
                                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>{result.extractedText}</div>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>IDENTIFIED MEDICINES</h4>
                                    {result.medicines.map((med, idx) => (
                                        <div key={idx} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{med.name}</h5>
                                            <div style={{ color: 'var(--text-muted)' }}>{med.uses} <br/> Dosage: {med.dosage}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="btn" style={{ marginTop: '2rem', background: 'transparent', border: '1px solid var(--text-muted)' }} onClick={() => setResult(null)}>
                        Scan Another
                    </button>
                </div>
            )}
        </div>
    );
}
