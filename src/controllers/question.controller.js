import questionService from '../service/question.service.js';

class QuestionController {
  async createQuestion(req, res) {
    try {
      const { title, question, description, difficulty, sample_input, sample_output, starter_code } = req.body;

      // Validate body data
      if (!title || !question || !description || !difficulty || !sample_input || !sample_output || !starter_code) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ message: 'Invalid difficulty level' });
      }

      const data = { title, question, description, difficulty, sample_input, sample_output, starter_code };
      const questionData = await questionService.createQuestion(data);
      res.status(201).json(questionData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllQuestions(req, res) {
    try {
        const { limit = 10, offset = 0, search=null, difficulty=null } = req.query; // Default values: limit 10, offset 0
        console.log('Fetching paginated questions with limit:', limit, 'and offset:', offset, search, difficulty);
        const paginatedQuestions = await questionService.getPaginatedQuestions(parseInt(offset, 10), parseInt(limit, 10), search, difficulty);
        const totalCount = await questionService.getTotalQuestionsCount(search, difficulty);

        res.status(200).json({
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            paginatedData: paginatedQuestions,
            totalCount,
        });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await questionService.getQuestionById(id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedQuestion = await questionService.updateQuestion(id, data);
      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      await questionService.deleteQuestion(id);
      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new QuestionController();