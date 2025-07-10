import TestCaseModel from "../models/test_cases.js";

class TestCaseService {
   async createTestCase(data) {
    try {
      return await TestCaseModel.create(data);
    } catch (error) {
      console.error('TestCaseService.createTestCase error:', error);
      throw new Error('Failed to create test case');
    }
  }

   async getVisibleTestCases(questionId) {
    try {
      return await TestCaseModel.findByQuestionId(questionId, false);
    } catch (error) {
      console.error('TestCaseService.getVisibleTestCases error:', error);
      throw new Error('Failed to get visible test cases');
    }
  }

   async getAllTestCases(questionId) {
    try {
      return await TestCaseModel.findByQuestionId(questionId, true);
    } catch (error) {
      console.error('TestCaseService.getAllTestCases error:', error);
      throw new Error('Failed to get all test cases');
    }
  }
  async bulkCreateTestCases(question_id, testCases) {
    try {
      return await TestCaseModel.bulkInsert(question_id, testCases);
    } catch (error) {
      console.error('TestCaseService.bulkCreateTestCases error:', error);
      throw new Error('Failed to insert test cases');
    }
  }

}

export default new TestCaseService();
