import React, { useState, useEffect } from 'react';
import { Bell, Clock, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://mediscan-ai-backend.onrender.com');

export default function Reminders() {
    const [formData, setFormData] = useState({
        medicineName: '',
        time: '',
        dosage: '',
        frequency: 'Daily'
    });
    const [success, setSuccess] = useState('');
    const [reminders, setReminders] = useState([]);

    const fetchReminders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/get-reminders`);
            const data = await res.json();
            if (data.reminders) setReminders(data.reminders);
        } catch (err) {
            console.log("Error fetching reminders:", err);
            console.error("Failed to fetch reminders", err);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/set-reminder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if(data.success) {
                setSuccess(data.message);
                setFormData({ medicineName: '', time: '', dosage: '', frequency: 'Daily' });
                fetchReminders();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch(err) {
            console.log("Error setting reminder:", err);
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/delete-reminder/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                fetchReminders();
            }
        } catch (err) {
            console.log("Error deleting reminder:", err);
            console.error("Failed to delete reminder", err);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Bell size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                <h1 style={{ margin: '0 0 0.5rem 0' }}>Dosage Reminders</h1>
                <p style={{ color: 'var(--text-muted)' }}>Never miss a pill again.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                {success && (
                    <div style={{ background: 'var(--success)', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                        {success}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Medicine Name</label>
                        <input className="input-field" required value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})} placeholder="e.g. Lisinopril" />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Time</label>
                            <input className="input-field" type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Dosage</label>
                            <input className="input-field" required value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="e.g. 1 Tablet" />
                        </div>
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Frequency</label>
                        <select className="input-field select-gold" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                            <option>Once</option>
                            <option>Daily</option>
                            <option>Twice a Day</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    
                    <button type="submit" className="btn" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        <Clock size={20} /> Set Reminder
                    </button>
                </form>
            </div>

            {reminders.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Reminders</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {reminders.map(reminder => (
                            <div key={reminder.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '1.2rem' }}>{reminder.medicineName}</h3>
                                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={16} /> {reminder.time}
                                        </span>
                                        <span>•</span>
                                        <span>{reminder.dosage}</span>
                                        <span>•</span>
                                        <span>{reminder.frequency}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(reminder.id)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}
                                    title="Delete Reminder"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
