const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const medicineController = require('../controllers/medicineController');
const chatController = require('../controllers/chatController');
const reminderController = require('../controllers/reminderController');

// 1. Medicine Image Recognition
router.post('/upload-image', upload.single('image'), medicineController.uploadImage);

// 2. Prescription OCR Reader
router.post('/ocr-prescription', upload.single('image'), medicineController.ocrPrescription);

// 3. Drug Interaction Checker
router.post('/check-interaction', medicineController.checkInteraction);

// 4. AI Chatbot
router.post('/chatbot', chatController.chat);

// 5. Reminders
router.post('/set-reminder', reminderController.setReminder);
router.get('/get-reminders', reminderController.getReminders);
router.delete('/delete-reminder/:id', reminderController.deleteReminder);

// 6. Get Medicine Info
router.get('/get-medicine-info', medicineController.getMedicineInfo);

module.exports = router;
