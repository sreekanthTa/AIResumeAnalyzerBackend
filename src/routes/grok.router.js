import {Router} from 'express';
import  grokController from '../controllers/grok.controller.js';
import multer from 'multer';


const grokRouter = Router();

grokRouter.post('/questions', grokController.questionsBasedOnJobDescription);


const upload = multer({ dest: 'uploads/' });

grokRouter.post('/analyze',upload.single('resume'), grokController.analyzeResume);
grokRouter.post('/rewrite', upload.single('resume'), grokController.rewriteResume);
grokRouter.post('/chat',  grokController.chat);



export default grokRouter