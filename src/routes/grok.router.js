import {Router} from 'express';
import  grokController from '../controllers/grok.controller.js';
import multer from 'multer';


const grokRouter = Router();

const upload = multer({ dest: 'uploads/' });

grokRouter.post('/analyze',upload.single('resume'), grokController.analyzeResume);
grokRouter.post('/rewrite', upload.single('resume'), grokController.rewriteResume);


grokRouter.get('/', (req, res) => {
    res.send('Welcome to the Grok Resume Analysis API');
});

export default grokRouter