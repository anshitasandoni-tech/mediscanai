const { db } = require('../config/firebase');

// Fallback in-memory store
let localReminders = [];
let nextId = 1;

exports.setReminder = async (req, res) => {
    try {
        const { medicineName, time, dosage, frequency } = req.body;
        
        if (!medicineName || !time || !dosage) {
            return res.status(400).json({ error: 'Medicine name, time and dosage are required' });
        }
        
        const newReminder = {
            medicineName,
            time,
            dosage,
            frequency,
            createdAt: new Date().toISOString()
        };

        if (db) {
            const docRef = await db.collection('reminders').add(newReminder);
            newReminder.id = docRef.id;
        } else {
            console.log(`[MOCK] Reminder set for ${medicineName} at ${time} (Dosage: ${dosage}, Freq: ${frequency})`);
            newReminder.id = nextId.toString();
            nextId++;
            localReminders.push(newReminder);
        }
        
        res.json({
            success: true,
            message: `Reminder successfully scheduled for ${medicineName} at ${time}`,
            reminder: newReminder
        });
    } catch (error) {
        console.log("Error in setReminder:", error);
        console.error("Error setting reminder:", error);
        res.status(500).json({ error: 'Failed to set reminder' });
    }
};

exports.getReminders = async (req, res) => {
    try {
        if (db) {
            const snapshot = await db.collection('reminders').orderBy('createdAt', 'desc').get();
            const reminders = [];
            snapshot.forEach(doc => {
                reminders.push({ id: doc.id, ...doc.data() });
            });
            return res.json({ reminders });
        } else {
            return res.json({ reminders: localReminders.slice().reverse() });
        }
    } catch (error) {
        console.log("Error in getReminders:", error);
        console.error("Error fetching reminders:", error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (db) {
            await db.collection('reminders').doc(id).delete();
        } else {
            localReminders = localReminders.filter(r => r.id !== id);
        }
        
        res.json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        console.log("Error in deleteReminder:", error);
        console.error("Error deleting reminder:", error);
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
};
