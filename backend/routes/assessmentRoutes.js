import express from 'express';
import { getPreTest, submitPreTest } from '../controllers/assessmentController.js';

const router = express.Router();

router.get('/:sessionId/pre-test', getPreTest);
router.post('/:sessionId/pre-test/submit', submitPreTest);

export default router;

