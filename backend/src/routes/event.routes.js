// src/routes/event.routes.js
import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { eventManager } from '../middlewares/auth.js';
import { createEvent, updateEvent, deleteEvent } from '../controllers/event.controller.js';

const router = express.Router();

// Áp dụng middleware cho các route cần quyền Event Manager
router.post('/', verifyToken, eventManager, createEvent);
router.put('/:id', verifyToken, eventManager, updateEvent);
router.delete('/:id', verifyToken, eventManager, deleteEvent);

export default router;