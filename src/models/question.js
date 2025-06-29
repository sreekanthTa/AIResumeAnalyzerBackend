import pool from '../db/index.js';

class QuestionsModel {
  async createQuestion(data) {
    const query = `INSERT INTO public.questions (title, question, description, difficulty, sample_input, sample_output, starter_code)
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [
      data.title,
      data.question,
      data.description,
      data.difficulty,
      data.sample_input,
      data.sample_output,
      data.starter_code,
    ];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing createQuestion query:', error);
      throw new Error('Database query failed');
    }
  }

  async getAllQuestions() {
    const query = 'SELECT * FROM public.questions';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error executing getAllQuestions query:', error);
      throw new Error('Database query failed');
    }
  }

  async getQuestionById(id) {
    const query = 'SELECT * FROM public.questions WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing getQuestionById query:', error);
      throw new Error('Database query failed');
    }
  }

  async updateQuestion(id, data) {
    const query = `UPDATE public.questions SET 
                   title = $1, question = $2, description = $3, difficulty = $4, 
                   sample_input = $5, sample_output = $6, starter_code = $7, updated_at = NOW() 
                   WHERE id = $8 RETURNING *`;
    const values = [
      data.title,
      data.question,
      data.description,
      data.difficulty,
      data.sample_input,
      data.sample_output,
      data.starter_code,
      id,
    ];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing updateQuestion query:', error);
      throw new Error('Database query failed');
    }
  }

  async deleteQuestion(id) {
    const query = 'DELETE FROM public.questions WHERE id = $1';
    try {
      await pool.query(query, [id]);
      return { message: 'Question deleted successfully' };
    } catch (error) {
      console.error('Error executing deleteQuestion query:', error);
      throw new Error('Database query failed');
    }
  }

  async getPaginatedQuestions(offset, limit) {
    const query = 'SELECT * FROM public.questions LIMIT $1 OFFSET $2';
    const values = [limit, offset];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error executing getPaginatedQuestions query:', error);
      throw new Error('Database query failed');
    }
  }

  async getTotalQuestionsCount() {
    const query = 'SELECT COUNT(*) FROM public.questions';
    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error executing getTotalQuestionsCount query:', error);
      throw new Error('Database query failed');
    }
  }
}

export default new QuestionsModel();