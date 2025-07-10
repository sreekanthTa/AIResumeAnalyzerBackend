import TestCaseService from "../service/test_cases.service.js";

class TestCaseController {
   async create(req, res) {
    try {
      const { question_id, input, expected_output, is_sample } = req.body;

      const testCase = await TestCaseService.createTestCase({
        question_id,
        input,
        expected_output,
        is_sample: is_sample || false,
      });

      return res.status(201).json(testCase);
    } catch (error) {
      console.error('TestCaseController.create error:', error);
      return res.status(500).json({ error: 'Failed to create test case' });
    }
  }

   async getByQuestionId(req, res) {
    try {
      const { questionId } = req.params;
      const includeHidden = req.query.all === 'true';

      const testCases = includeHidden
        ? await TestCaseService.getAllTestCases(questionId)
        : await TestCaseService.getVisibleTestCases(questionId);

      return res.json(testCases);
    } catch (error) {
      console.error('TestCaseController.getByQuestionId error:', error);
      return res.status(500).json({ error: 'Failed to fetch test cases' });
    }
  }
  async bulkCreate(req, res) {
    try {
      const { question_id, testCases } = req.body;

      if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(400).json({ error: 'testCases must be a non-empty array' });
      }

      const result = await TestCaseService.bulkCreateTestCases(question_id, testCases);
      return res.status(201).json(result);
    } catch (error) {
      console.error('TestCaseController.bulkCreate error:', error);
      return res.status(500).json({ error: 'Failed to insert test cases' });
    }
  }
}

export default new TestCaseController();
