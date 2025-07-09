import QuestionsModel from '../models/question.js';

class QuestionService {
  async createQuestion(data) {
    try {
      return await QuestionsModel.createQuestion(data);
    } catch (error) {
      console.error('Error in createQuestion service:', error);
      throw new Error('Service error: Unable to create question');
    }
  }

  async getAllQuestions() {
    try {
      return await QuestionsModel.getAllQuestions();
    } catch (error) {
      console.error('Error in getAllQuestions service:', error);
      throw new Error('Service error: Unable to fetch questions');
    }
  }

  async getQuestionById(id) {
    try {
      return await QuestionsModel.getQuestionById(id);
    } catch (error) {
      console.error('Error in getQuestionById service:', error);
      throw new Error('Service error: Unable to fetch question by ID');
    }
  }

  async updateQuestion(id, data) {
    try {
      return await QuestionsModel.updateQuestion(id, data);
    } catch (error) {
      console.error('Error in updateQuestion service:', error);
      throw new Error('Service error: Unable to update question');
    }
  }

  async deleteQuestion(id) {
    try {
      return await QuestionsModel.deleteQuestion(id);
    } catch (error) {
      console.error('Error in deleteQuestion service:', error);
      throw new Error('Service error: Unable to delete question');
    }
  }

  async getPaginatedQuestions(offset, limit, search, difficulty) {
    try {
      return await QuestionsModel.getPaginatedQuestions(offset, limit, search, difficulty);
    } catch (error) {
      console.error('Error in getPaginatedQuestions service:', error);
      throw new Error('Service error: Unable to fetch paginated questions');
    }
  }

  async getTotalQuestionsCount(search, difficulty) {
    try {
      return await QuestionsModel.getTotalQuestionsCount(search, difficulty);
    } catch (error) {
      console.error('Error in getTotalQuestionsCount service:', error);
      throw new Error('Service error: Unable to fetch total questions count');
    }
  }
}

export default new QuestionService();