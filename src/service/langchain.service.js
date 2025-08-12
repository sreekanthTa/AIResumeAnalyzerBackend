import dotenv from 'dotenv';
dotenv.config();

import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from '@pinecone-database/pinecone';
import LocalEmbeddings from './xenova.service.js';

class LangchainService {
  constructor() {
    this.indexName = process.env.PINECONE_INDEX_NAME || 'default-index';
    this.dimension = parseInt(process.env.PINECONE_DIMENSION || '384', 10);
    this.metric = process.env.PINECONE_METRIC || 'cosine';

    this.embeddings = new LocalEmbeddings(); // now using free local model
    this.pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    this.index = this.pineconeClient.Index(process.env.PINECONE_INDEX_NAME);

    this.init()
  }

  async init(){
    try{
    this.vectorStore = await PineconeStore.fromExistingIndex(
      this.embeddings,
      {
        pineconeIndex: this.index,
        maxConcurrency: 5,
        textKey: 'text',
        namespace: process.env.PINECONE_NAMESPACE || 'default',
      }
    )
    }catch(err){

    }
  }
  async waitForIndex() {
    while (true) {
      const description = await this.pinecone.describeIndex(this.indexName);
      if (description.status?.ready) break;
      console.log('Index still initializing... waiting 5s');
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  async createIndex() {
    try {
      console.log(`Checking if Pinecone index "${this.indexName}" exists...`);
      const indexes = await this.pineconeClient.listIndexes();

      if (!indexes.indexes.some(idx => idx.name === this.indexName)) {
        console.log(`Index "${this.indexName}" not found. Creating...`);
        await this.pineconeClient.createIndex({
          name: this.indexName,
          dimension: this.dimension,
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1" // pick your Pinecone serverless region
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
    // await this.createIndex();


    const result = await this.vectorStore.addDocuments([
      ...texts
    ]);
    console.log('Added texts to vector store:', result);

    return result;
  }

  async searchEmbeddings(query, topK = 5) {
    console.log("u", query, topK)
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized or empty');
    }


    return await this.vectorStore.similaritySearch(query, topK);
  }
}

export default new LangchainService();
