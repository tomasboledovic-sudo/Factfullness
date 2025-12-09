import express from 'express';
import { getContent } from '../controllers/contentController.js';

const router = express.Router();

router.get('/:sessionId/content', getContent);

export default router;

