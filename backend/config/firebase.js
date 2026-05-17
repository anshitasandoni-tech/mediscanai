const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

let db = null;
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
        console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:", e);
    }
} else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
}

if (serviceAccount) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    db = admin.firestore();
    console.log("Firebase Admin initialized successfully.");
} else {
    console.warn("⚠️ Firebase serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT env variable is not set. Running Dosage Reminders with in-memory array fallback.");
}

module.exports = { admin, db };
