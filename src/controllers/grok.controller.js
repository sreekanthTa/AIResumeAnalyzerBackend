import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import grokService from "../service/grok.service.js";

class GrokController {
  async analyzeResume(req, res) {
    try {
      const file = req.file;
      const jobDescription = req.body.description;

      if (!file || !jobDescription) {
        return res
          .status(400)
          .json({ error: "Resume file and job description are required" });
      }

      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdf(dataBuffer);
      const resumeText = pdfData.text;

      const result = await grokService.analyzeResume(
        resumeText,
        jobDescription
      );
      res.json({ result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to analyze resume" });
    }finally
    {
      // Clean up uploaded file
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Failed to delete uploaded file:", err);
        }); 
    }
    }
  }

  async rewriteResume(req, res) {
    try {
      const file = req.file;
      const jobDescription = req.body.description;

      if (!file || !jobDescription) {
        return res
          .status(400)
          .json({ error: "Resume file and job description are required" });
      }

      const dataBuffer = fs.readFileSync(file.path); // ✅ read from file
      const pdfData = await pdf(dataBuffer);
      const resumeText = pdfData.text;

      const rewritten = await grokService.rewriteResume(
        resumeText,
        jobDescription
      );
      res.json({ rewrittenResume: rewritten });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to rewrite resume", details: error.message });
    } finally {
      // Clean up uploaded file
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Failed to delete uploaded file:", err);
        });
      }
    }
  }

  async questionsBasedOnJobDescription(req, res) {
    try {

      const { description = null } = req.body;

      if (!description ) {
        return res
          .status(400)
          .json({ error: "Job description is required" });
      }

      const questions = await grokService.getQuestionsBasedOnJobDescriptionAndCompany(
        description
      );

      res.json({ questions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get questions" });
    }
  }

  async chat(req, res){
    try{
        const messages = req.body.messages;
        const description = req.body.description;
    
        if (!messages || !description) {
            return res
            .status(400)
            .json({ error: "messages file and  description are required" });
        }
    
        const result = await grokService.chat(
            messages,
            description,
            res
        );
        // res.json({ result });
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to chat" });
    }
  }
}

export default new GrokController();
