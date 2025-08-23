import dotenv from "dotenv";
dotenv.config();
import { InferenceClient } from "@huggingface/inference";
import pineconeService from "./pinecone_service.js";
import grokService from "./grok.service.js";

class LangchainService {
  constructor() {
    console.log(
      "HuggingFace API key:",
      process.env.HUGGING_FACE_API_KEY ? "found" : "missing"
    );
  }

  // ✅ Manual RAG pipeline
  async search_tools(query) {
    try {
      console.log("RAG Prompt:\n", query);

      // 1. Try Pinecone first
      let pineconeResults = [];
      if (pineconeService.vectorStore) {
        const results = await pineconeService.searchEmbeddings(query, 2);
        console.log("Pinecone raw results:", JSON.stringify(results));
        pineconeResults = results.filter(r => r[1] > 0.7); // Only keep high-confidence results
      }

      if(pineconeResults.length > 0 ){
        console.log("Using Pinecone results.", pineconeResults);
        return {manual:false,result:pineconeResults?.[0]}; // Return the top result
      }
      
      console.log(`Pinecone returned ${pineconeResults.length} results.`);

      // 2. If no good Pinecone results, use Grok Service to get question
      const response = grokService.getQuestionBasedOnText(query);
      console.log("Grok Service response:", response);

      const cleanedResponse = await response;
 
      console.log("Manual RAG Response:\n", cleanedResponse);
      return {manual:true, ...cleanedResponse};
    } catch (error) {
      console.error("Error in search_tools:", error);
      throw error;
    }
  }
}

export default new LangchainService();

