// services/embeddingsService.js
import { pipeline } from '@xenova/transformers';

class LocalEmbeddings {
  constructor() {
    this.model = null;
    this.ready = this.loadModel();
  }

  async loadModel() {
    console.log("Loading local embeddings model (all-MiniLM-L6-v2)...");
    this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("Model loaded!");
  }

  // LangChain expects an embedQuery function
  async embedQuery(text) {
    await this.ready;
    const result = await this.model(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  }

  // LangChain expects an embedDocuments function
  async embedDocuments(texts) {
    console.log("Embedding documents with local model...", texts);
    await this.ready;
    const tensor = await this.model(texts, { pooling: 'mean', normalize: true });

    const embeddings = [];
    const numDocs = tensor.dims[0];   // number of documents
    const vectorSize = tensor.dims[1]; // embedding size

    for (let i = 0; i < numDocs; i++) {
      const start = i * vectorSize;
      const end = start + vectorSize;
      embeddings.push(Array.from(tensor.data.slice(start, end)));
    }

    console.log("Documents embedded successfully!");
    console.log("Embeddings:", embeddings?.length);
    return embeddings;
  }
}

export default LocalEmbeddings;
