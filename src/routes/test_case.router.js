import express from 'express';
import TestCaseController from '../controllers/test_case.controller.js'; // include .js if using ES modules

const router = express.Router();

// ✅ Bulk insert must come before dynamic routes like `/:questionId`
router.post('/bulk', TestCaseController.bulkCreate);

// POST /test-cases
router.post('/', TestCaseController.create);

// GET /test-cases/:questionId
router.get('/:questionId', TestCaseController.getByQuestionId);

export default router;
