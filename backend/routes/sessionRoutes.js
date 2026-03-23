import express from 'express';
import { createSession, getSession } from '../controllers/sessionController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createSession);
router.get('/:sessionId', getSession);

export default router;

