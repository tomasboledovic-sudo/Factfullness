import express from 'express';
import { createSession, getSession } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', createSession);
router.get('/:sessionId', getSession);

export default router;

