// src/routes/event.routes.js
import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { eventManager } from '../middlewares/auth.js';
import { createEvent, updateEvent, deleteEvent } from '../controllers/event.controller.js';
<<<<<<< HEAD
import { getApprovedEvents, getEventDetails } from '../controllers/event.controller.js';
=======
import { getApprovedEvents, getEventDetails, getMyEvents } from '../controllers/event.controller.js';

>>>>>>> origin/main

const router = express.Router();

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
router.get('/public', getApprovedEvents);
router.get('/public/:id', getEventDetails);
// Áp dụng middleware cho các route cần quyền Event Manager
<<<<<<< HEAD
=======
router.get('/my-events', verifyToken, eventManager, getMyEvents);
>>>>>>> origin/main
router.post('/', verifyToken, eventManager, createEvent);
router.put('/:id', verifyToken, eventManager, updateEvent);
router.delete('/:id', verifyToken, eventManager, deleteEvent);

export default router;