import dotenv from "dotenv";
dotenv.config();
import pineconeService from "./pinecone_service.js";
import grokService, { openai } from "./grok.service.js";
import { v4 as uuidv4 } from "uuid";

import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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
        pineconeResults = results.filter((r) => r[1] > 0.7); // Only keep high-confidence results
      }

      if (pineconeResults.length > 0) {
        console.log("Using Pinecone results.", pineconeResults);
        return { manual: false, result: pineconeResults?.[0] }; // Return the top result
      }

      console.log(`Pinecone returned ${pineconeResults.length} results.`);

      // 2. If no good Pinecone results, use Grok Service to get question
      const response = grokService.getQuestionBasedOnText(query);
      console.log("Grok Service response:", response);

      const cleanedResponse = await response;

      console.log("Manual RAG Response:\n", cleanedResponse);
      return { manual: true, ...cleanedResponse };
    } catch (error) {
      console.error("Error in search_tools:", error);
      throw error;
    }
  }

// async function conversationalChat({ problem, code, user_question, thread_id }) {
async  conversationalChat({ problem, code, user_question, thread_id }) {
  try {
    // 1️⃣ Create Chat Model
    const chatModel = new ChatOpenAI({
      model: "llama3-70b-8192", // Groq model
      apiKey: process.env.GROQ_API_KEY,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
    });

    // 2️⃣ Wrap chatModel into LangGraph node
    const callModel = async (state) => {
      const messages = state?.messages || [];
      const response = await chatModel.invoke(messages);
      return { messages: [...messages, response] };
    };

    // 3️⃣ Define workflow graph
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("model", callModel)
      .addEdge(START, "model")
      .addEdge("model", END);

    const memory = new MemorySaver();

    // 4️⃣ Compile with memory
    const app = workflow.compile({ checkpointer: memory });

    // 5️⃣ Thread ID
    const finalThreadId = thread_id || uuidv4();
    const config = { configurable: { thread_id: finalThreadId } };

    // 6️⃣ Input messages (use LangChain message objects ✅)
    const input = [
      new SystemMessage({
        content: `You are a helpful AI tutor. The user is solving:\n${problem}\nTheir code is:\n${code}`,
      }),
      new HumanMessage({ content: user_question }),
    ];

    console.log("input is", user_question)

    // 7️⃣ Invoke app
    const result = await app.invoke({ messages: input }, config);

    return {
      thread_id: finalThreadId,
      reply: result.messages[result.messages.length - 1].content,
    };
  } catch (error) {
    console.error("Error in conversationalChat:", error);
    throw error;
  }
}
}

export default new LangchainService();
