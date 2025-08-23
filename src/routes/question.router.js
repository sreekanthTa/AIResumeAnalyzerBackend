import express from 'express';
import questionController from '../controllers/question.controller.js';

const router = express.Router();

router.post('/', questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/create_embeddings', questionController.createEmbeddingsForAllQuestions);
router.get('/search_embeddings', questionController.searchEmbeddings)
router.get('/create_new_question', questionController.createNewQuestion)
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

export default router;