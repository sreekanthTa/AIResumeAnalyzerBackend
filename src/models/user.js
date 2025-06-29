import pool from '../db/index.js';

class UserModel {
   async createUser(name, email, password) {
    try {
        const query = 'INSERT INTO public.users (name, email, password) VALUES ($1, $2, $3)';
        const result = await pool.query(query, [name, email, password]);
        return result;
    } catch (error) {
      console.error('Error checking for existing user:', error);    
        throw new Error('Database query failed');
    }
 
  }

   async findUserByEmail(email) {
    try{
        const query = 'SELECT * FROM public.users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    }catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database query failed');
    }
   
  }
}

export default new UserModel();
