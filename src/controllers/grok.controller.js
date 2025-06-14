import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import grokService from "../services/grok.service.js";

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
}

export default new GrokController();
