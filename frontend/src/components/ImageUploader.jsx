import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://medicinai.onrender.com');

export default function ImageUploader({ onResult }) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        setPreview(URL.createObjectURL(file));
        setLoading(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const endpoint = type === 'medicine' 
                ? `${API_URL}/api/upload-image` 
                : `${API_URL}/api/ocr-prescription`;

            const res = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                alert(data.error || "Failed to process image");
            } else {
                onResult(data, type);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="responsive-grid">
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', cursor: 'pointer' }}>
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: 0 }}>Scan Medicine</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Upload box or pill image</p>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUpload(e, 'medicine')} />
                </label>
            </div>
            
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', cursor: 'pointer' }}>
                 <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FileText size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: 0 }}>Scan Prescription</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Upload doctor's note</p>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUpload(e, 'prescription')} />
                </label>
            </div>

            {loading && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', margin: '2rem' }}>
                    <h3 className="gradient-text">Analyzing image using Claude Vision AI...</h3>
                </div>
            )}
        </div>
    );
}
