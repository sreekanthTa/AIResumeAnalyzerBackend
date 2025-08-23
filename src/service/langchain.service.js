import dotenv from "dotenv";
dotenv.config();
import { InferenceClient } from "@huggingface/inference";
import pineconeService from "./pinecone_service.js";

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
        console.log("Pinecone raw results:", results);
        pineconeResults = results.filter(r => r[1] > 0.7); // Only keep high-confidence results
      }

      if(pineconeResults.length > 0 ){
        console.log("Using Pinecone results.", pineconeResults);
        return pineconeResults; // Return the top result
      }
      
      console.log(`Pinecone returned ${pineconeResults.length} results.`);

      // 2. Pass query + context to HuggingFace LLM
      const hf = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

     

    const prompt = `
    You are an assistant that provides LeetCode-style questions.
    If a question is not found in the database, provide it in JSON format only, without any extra text.
    Output exactly one JSON object, do NOT repeat or provide examples.

    Output JSON keys:
    {
      "question": "<the question>",
      "description": "<detailed description>",
      "input_format": "<input format>",
      "output_format": "<output format>",
      "constraints": "<constraints>",
      "sample_input": "<sample input>",
      "sample_output": "<sample output>",
      "difficulty": "<difficulty level>"
    }

    Question: ${query}

    **Important**: Do NOT include any explanation, notes, or text outside the JSON object.
    `;



      const response = await hf.textGeneration({
        // model: "meta-llama/Llama-2-70b-hf", // Changed to a verified available model
        "model":"google/gemma-2-2b-it",
        inputs: prompt,
        provider:"nebius",
        parameters: {
          max_new_tokens: 200,
          temperature: 0.6,
          return_full_text: true, // Add this to get complete response
          provider:"nebius"
        },
      });

      const cleanedResponse = response.generated_text
        .trim()
        .replace(/^Answer:\s*/i, ""); // Remove 'Answer:' prefix if present

      console.log("Manual RAG Response:\n", cleanedResponse);
      return cleanedResponse;
    } catch (error) {
      console.error("Error in search_tools:", error);
      throw error;
    }
  }
}

export default new LangchainService();

