import grokService from "../service/grok.service.js";
import langchainService from "../service/langchain.service.js";
import pinecone_service from "../service/pinecone_service.js";
import pineconeService from "../service/pinecone_service.js";
import questionService from "../service/question.service.js";

class QuestionController {
  async createQuestion(req, res) {
    try {
      const {
        title,
        question,
        description,
        difficulty,
        sample_input,
        sample_output,
        starter_code,
        solution
      } = req.body;

      // Validate body data
      if (
        !title ||
        !question ||
        !description ||
        !difficulty ||
        !sample_input ||
        !sample_output ||
        !starter_code || 
        !solution
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const validDifficulties = ["Easy", "Medium", "Hard"];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }

      const data = {
        title,
        question,
        description,
        difficulty,
        sample_input,
        sample_output,
        starter_code,
        solution

      };
      const questionData = await questionService.createQuestion(data);
      res.status(201).json(questionData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllQuestions(req, res) {
    try {
      const {
        limit = 10,
        offset = 0,
        search = null,
        difficulty = null,
        category = null,
      } = req.query; // Default values: limit 10, offset 0
      console.log(
        "Fetching paginated questions with limit:",
        limit,
        "and offset:",
        offset,
        search,
        difficulty,
        category
      );
      const paginatedQuestions = await questionService.getPaginatedQuestions(
        parseInt(offset, 10),
        parseInt(limit, 10),
        search,
        difficulty,
        category
      );
      const totalCount = await questionService.getTotalQuestionsCount(
        search,
        difficulty,
        category
      );

      res.status(200).json({
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        paginatedData: paginatedQuestions,
        totalCount,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await questionService.getQuestionById(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedQuestion = await questionService.updateQuestion(id, data);
      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      await questionService.deleteQuestion(id);
      res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async createEmbeddingsForAllQuestions(req, res) {
    try {
      const questions = await questionService.getAllQuestions();
      if (!questions || questions.length === 0) {
        return res.status(404).json({ message: "No questions found" });
      }

      const batchSize = 50; // tune as needed
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);

        // Prepare texts for embedding: combine title + description, etc.
        const texts = batch.map((q) => ({
          pageContent: `${q.title}\n${q.description}`,
          metadata: { id: q.id.toString(), title: q.title },
        }));

        // Call your Grok/OpenAI embedding service once per batch
        const embeddings = await langchainService.addTexts(texts);
        console.log("Embeddings", embeddings);

        // Prepare vectors for Pinecone upsert
        // const vectors = batch.map((q, idx) => ({
        //   id: q.id.toString(),
        //   values: embeddings[idx],
        //   metadata: { title: q.title },
        // }));

        // // Upsert batch into Pinecone
        // await pineconeService.upsertVectors(vectors);

        // Optionally update your DB with just a flag or embedding summary (not full Pinecone response)
        for (const q of batch) {
          await questionService.updateEmbeddings({
            id: q.id,
            embeddingsCreated: true,
          });
        }

        console.log(`Processed batch ${i / batchSize + 1}`);
      }

      res
        .status(200)
        .json({ message: "Embeddings created successfully for all questions" });
    } catch (error) {
      console.error("Error creating embeddings for all questions:", error);
      res
        .status(500)
        .json({
          message: "Failed to create embeddings for all questions",
          error: error.message,
        });
    }
  }

  async searchEmbeddings(req, res) {
    try {
      const { question } = req.query;

      const result = await langchainService.search_tools(question);
      // const result = await langchainService.searchEmbeddings(question,1)

      return res.status(200).json({ message: "Successfully Searched", result });
    } catch (error) {
      console.error("Error creating embeddings for all questions:", error);
      res
        .status(500)
        .json({
          message: "Failed to create embeddings for all questions",
          error: error.message,
        });
    }
  }

  async searchQuestionInWeb(req, res) {
    try {
      const { question } = req.query;

      const newQuestion = await grokService.getQuestionsByTextFromWeb(question);
      const newQuestionResponse = await newQuestion;
      console.log("response is", newQuestionResponse);
      return res
        .status(200)
        .json({
          message: "Successfully Searched",
          results: [newQuestionResponse],
        });
    } catch (error) {
      console.error("Error creating embeddings for all questions:", error);
      res
        .status(500)
        .json({
          message: "Failed to create embeddings for all questions",
          error: error.message,
        });
    }
  }

  async createNewWebQuestion(req, res) {
    try {

      const {  question, is_duplicate = false  } = req.body;

      const newQuestion = await grokService.getQuestionBasedOnText(question);
      const newQuestionResponse = await newQuestion;
      console.log("response is", newQuestionResponse);

      if (!is_duplicate) {
        const searchEmbeddings = await pinecone_service.searchEmbeddings(
          newQuestionResponse.title,
          1
        );
        console.log("searchEmbeddings is", searchEmbeddings);

        if (searchEmbeddings && searchEmbeddings.length > 0) {
          return res
            .status(200)
            .json({
              message: "Question Already Exists",
              is_duplicate: true,
              result: searchEmbeddings,
            });
        }
      }

        const result = await questionService.createQuestion({
        ...newQuestionResponse,
      });

      console.log("result is",result)

      const embedding_result = await pineconeService.addTexts([
        {
          pageContent: `${newQuestionResponse.title}\n${newQuestionResponse.description}`,
          metadata: {
            id: result.id.toString(),
            title: newQuestionResponse.title,
          },
        },
      ]);
      console.log("embedding_result is", embedding_result);

      if (!embedding_result) {
        return res
          .status(500)
          .json({ message: "Failed to create embeddings for the question" });
      }

    

      return res.status(200).json({ message: "Successfully Searched", result });
    } catch (error) {
      console.error("Error creating embeddings for all questions:", error);
      res
        .status(500)
        .json({
          message: "Failed to create embeddings for all questions",
          error: error.message,
        });
    }
  }

  //   async chatWithUserAboutProblem(req, res) {
  //   try {

  //     const {  problem, code, user_question } = req.body;

  //     const aiSuggestion = await grokService.getChatWithUserAboutProblem({
  //       problem,
  //       code,
  //       user_question
  //     });
  //     const parsedSuggestion = await aiSuggestion;
  //     console.log("response is", parsedSuggestion);

  //     return res.status(200).json({ message: "Successfully Searched", result:parsedSuggestion });
  //   } catch (error) {
  //     console.error("Error creating embeddings for all questions:", error);
  //     res
  //       .status(500)
  //       .json({
  //         message: "Failed to create embeddings for all questions",
  //         error: error.message,
  //       });
  //   }
  // }
  async chatWithUserAboutProblem(req, res) {
    try {

      const {  problem, code, user_question , thread_id } = req.body;

      const aiSuggestion = await langchainService.conversationalChat({
        problem, code, user_question , thread_id 
      });
      
      const parsedSuggestion = await aiSuggestion;
      console.log("response is", parsedSuggestion);

      return res.status(200).json({ message: "Successfully Searched", result:parsedSuggestion });
    } catch (error) {
      console.error("Error creating embeddings for all questions:", error);
      res
        .status(500)
        .json({
          message: "Failed to create embeddings for all questions",
          error: error.message,
        });
    }
  }

}

export default new QuestionController();
