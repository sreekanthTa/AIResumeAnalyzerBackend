import dotenv from 'dotenv';
dotenv.config();


import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from "@langchain/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

class PineconeService {
  constructor() {
    this.vectorStore = null;
    // ✅ Use proper HuggingFace embeddings model
    this.embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGING_FACE_API_KEY,
      model: "sentence-transformers/all-MiniLM-L6-v2", // good free embedding model
    });

    this.indexName = process.env.PINECONE_INDEX_NAME || 'default-index';
    this.dimension = parseInt(process.env.PINECONE_DIMENSION || '384', 10);
    this.metric = process.env.PINECONE_METRIC || 'cosine';
    this.pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    this.index = this.pineconeClient.Index(this.indexName);
    this.init(); // Ensure index exists on startup
    console.log('Pinecone client initialized.');

  }

  async init() {
    try {
      this.vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        {
          pineconeIndex: this.index,
          maxConcurrency: 5,
          textKey: 'text',
          namespace: process.env.PINECONE_NAMESPACE || 'default',
        }
      );
      console.log("Vector store initialized.");
    } catch (err) {
      console.error("Error initializing vector store:", err);
    }
  }

  async waitForIndex() {
    while (true) {
      const description = await this.pineconeClient.describeIndex(this.indexName);
      if (description.status?.ready) break;
      console.log('Index still initializing... waiting 5s');
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  async createIndex() {
    try {
      console.log(`Checking if Pinecone index "${this.indexName}" exists...`);
      const indexes = await this.pineconeClient.listIndexes();

      if (!indexes.includes(this.indexName)) {
        console.log(`Index "${this.indexName}" not found. Creating...`);
        await this.pineconeClient.createIndex({
          name: this.indexName,
          dimension: this.dimension,
          metric: this.metric,
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1"
            }
          }
        });

        console.log(`Index "${this.indexName}" created. Waiting for it to be ready...`);
        await this.waitForIndex();
      } else {
        console.log(`Index "${this.indexName}" already exists.`);
      }

      this.index = this.pineconeClient.Index(this.indexName);

    } catch (error) {
      console.error('Error creating Pinecone index:', error);
    }
  }

  async addTexts(texts) {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized.");
    }

    const result = await this.vectorStore.addDocuments([...texts]);
    console.log('Added texts to vector store:', result);

    return result;
  }

  async searchEmbeddings(query, topK = 5) {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized or empty');
    }
    const queryVector = await this.embeddings.embedQuery(query);
    return await this.vectorStore.similaritySearchVectorWithScore(queryVector, topK);
  }

}

export default new PineconeService();
