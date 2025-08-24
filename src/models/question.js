import pool from '../db/index.js';

class QuestionsModel {
  async createQuestion(data) {
    const query = `INSERT INTO public.questions (title, question, description, difficulty, sample_input, sample_output, starter_code, solution)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [
      data.title,
      data.question,
      data.description,
      data.difficulty,
      data.sample_input,
      data.sample_output,
      data.starter_code,
      data.solution
    ];
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing createQuestion query:', error);
      throw new Error('Database query failed');
    }
  }

  async getAllQuestions(search = null) {
    let query = 'SELECT * FROM public.questions';
    const values = [];
    if(search){
      query+= ` WHERE title ILIKE $1 OR question ILIKE $1`;
      values.push(`%${search}%`);
    }
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error executing getAllQuestions query:', error);
      throw new Error('Database query failed');
    }
  }

  async getQuestionById(id) {
    const query = `
    SELECT 
      qs.id,
      qs.title,
      qs.description,
      qs.difficulty,
      qs.created_at,
      qs.updated_at,
      qs.sample_input,
      qs.sample_output,
      qs.question
     
       starter_code
    FROM public.questions qs
    WHERE qs.id = $1
    GROUP BY qs.id;
  `;
  
    try {
      const result = await pool.query(query, [id]);
      console.log("result is", result)
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

  async getPaginatedQuestions(offset, limit, search, difficulty, category) {
    let query = `SELECT  * 
                FROM questions 
                 
                ` ;
                 
    const values = [];
    const conditions = [];

    if(category){
      values.push(category)
      conditions.push(` question_type = $${values.length}`)
     }
    
    if(difficulty){
      values.push(difficulty)
      conditions.push( ` difficulty = $${values.length}`);
    }

    if(search){
      values.push(`%${search}%`);
      conditions.push(` title ILIKE $${values.length}`);
    }
    
    if(conditions.length > 0){
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY questions.id`;

    if(limit){
      values.push(limit);
      query += ` LIMIT $${values.length}` ;
    }
    if(offset){
      values.push(offset);
      query += ` OFFSET $${values.length}`;
    }
 
    console.log("query is", query, values)
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error executing getPaginatedQuestions query:', error);
      throw new Error('Database query failed');
    }
  }

  async getTotalQuestionsCount(search, difficulty) {
    let query = 'SELECT COUNT(*) FROM public.questions';
    const values = [];
    const conditions = [];
    
    if(difficulty){
      values.push(difficulty)
      conditions.push( ` difficulty = $${values.length}`);
    }

    if(search){
      values.push(`%${search}%`);
      conditions.push( ` title ILIKE $${values.length}`);
    }

    if(conditions.length > 0){
      query += ' WHERE ' + conditions.join(' AND ');  
    }

    
    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error executing getTotalQuestionsCount query:', error);
      throw new Error('Database query failed');
    }
  }

  async updateEmbeddings(id, embeddings) {
    const query = `UPDATE public.questions SET embedding = $1 WHERE id = $2 RETURNING *`;
    try {
      const result = await pool.query(query, [embeddings, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing updateEmbeddings query:', error);
      throw new Error('Database query failed');
    }
  }
}

export default new QuestionsModel();