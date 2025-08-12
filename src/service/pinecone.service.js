import pineconePkg from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const { Pinecone } = pineconePkg;  // Extract Pinecone class from the package

class PineconeService {
  constructor() {
    this.index = null;
    this.pineconeClient = new Pinecone();  // Use Pinecone, NOT PineconeClient
  }

  async init() {
    await this.pineconeClient.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    });
    this.index = this.pineconeClient.Index(process.env.PINECONE_INDEX_NAME);
  }

  async upsertVectors(vectors) {
    if (!this.index) {
      throw new Error('Pinecone index is not initialized');
    }
    return await this.index.upsert({ vectors });  // Correct upsert call
  }
}

export default new PineconeService();
