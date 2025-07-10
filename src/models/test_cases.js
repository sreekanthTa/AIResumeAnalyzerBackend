import pool from '../db/index.js';

class TestCaseModel {
   async create({ question_id, input, expected_output, is_sample }) {
    try {
      const checkQuery = `
        SELECT 1 FROM test_cases
        WHERE question_id = $1 AND input = $2 AND expected_output = $3 AND is_sample = $4
      `;

      const checkResult = await pool.query(checkQuery, [question_id, input, expected_output, is_sample]);
    
      if (checkResult.rows.length > 0) {
        // Already exists
        return { message: 'Test case already exists' };
      }

      const query = `
        INSERT INTO test_cases (question_id, input, expected_output, is_sample)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const values = [question_id, input, expected_output, is_sample];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('TestCaseModel.create error:', error);
      throw error;
    }
  }

   async findByQuestionId(question_id, includeHidden = false) {
    try {
      const query = `
        SELECT * FROM test_cases
        WHERE question_id = $1 ${includeHidden ? '' : 'AND is_sample = false'}
      `;
      const result = await pool.query(query, [question_id]);
      return result.rows;
    } catch (error) {
      console.error('TestCaseModel.findByQuestionId error:', error);
      throw error;
    }
  }

  async bulkInsert(question_id, testCases){
    try {
        const values = [];
        const placeholders = [];
  
        testCases.forEach((tc, index) => {
          const idx = index * 4;
          placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`);
          values.push(question_id, tc.input, tc.expected_output, tc.is_sample || false);
        });
  
        const query = `
          INSERT INTO test_cases (question_id, input, expected_output, is_sample)
          VALUES ${placeholders.join(', ')}
          ON CONFLICT (question_id, input, expected_output, is_sample) DO NOTHING
          RETURNING *
        `;
  
        const result = await pool.query(query, values);
        return result.rows;
      } catch (error) {
        console.error('TestCaseModel.bulkInsert error:', error);
        throw error;
      }
  }
}

export default new TestCaseModel();
