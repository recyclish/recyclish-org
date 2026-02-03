import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateChatResponse } from "./chatbot";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
const mockInvokeLLM = vi.mocked(invokeLLM);

describe("chatbot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateChatResponse", () => {
    it("should generate a response for a simple question", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "test-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "You can dispose of GLP-1 needles at pharmacies like CVS or Walgreens.",
            },
            finish_reason: "stop",
          },
        ],
      });

      const response = await generateChatResponse("How do I dispose of GLP-1 needles?");
      
      expect(response).toBe("You can dispose of GLP-1 needles at pharmacies like CVS or Walgreens.");
      expect(mockInvokeLLM).toHaveBeenCalledTimes(1);
    });

    it("should include conversation history in the request", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "test-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Based on our previous discussion, here are more details...",
            },
            finish_reason: "stop",
          },
        ],
      });

      const history = [
        { role: "user" as const, content: "What can I recycle?" },
        { role: "assistant" as const, content: "You can recycle many materials including..." },
      ];

      await generateChatResponse("Tell me more about plastics", history);
      
      expect(mockInvokeLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "system" }),
            expect.objectContaining({ role: "user", content: "What can I recycle?" }),
            expect.objectContaining({ role: "assistant", content: "You can recycle many materials including..." }),
            expect.objectContaining({ role: "user", content: "Tell me more about plastics" }),
          ]),
        })
      );
    });

    it("should handle array content responses", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "test-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: [
                { type: "text", text: "Here is your answer about recycling." },
              ],
            },
            finish_reason: "stop",
          },
        ],
      });

      const response = await generateChatResponse("What plastics can be recycled?");
      
      expect(response).toBe("Here is your answer about recycling.");
    });

    it("should return fallback message when no content is available", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "test-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: [],
            },
            finish_reason: "stop",
          },
        ],
      });

      const response = await generateChatResponse("Test question");
      
      expect(response).toBe("I apologize, but I couldn't generate a response. Please try again.");
    });

    it("should throw error when LLM fails", async () => {
      mockInvokeLLM.mockRejectedValueOnce(new Error("LLM service unavailable"));

      await expect(generateChatResponse("Test question")).rejects.toThrow(
        "Failed to generate chat response"
      );
    });

    it("should include system prompt with recycling knowledge", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        id: "test-id",
        created: Date.now(),
        model: "test-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Response",
            },
            finish_reason: "stop",
          },
        ],
      });

      await generateChatResponse("Hello");
      
      const callArgs = mockInvokeLLM.mock.calls[0][0];
      const systemMessage = callArgs.messages.find((m: any) => m.role === "system");
      
      expect(systemMessage).toBeDefined();
      expect(systemMessage?.content).toContain("RecycleBot");
      expect(systemMessage?.content).toContain("Sharps Disposal");
      expect(systemMessage?.content).toContain("GLP-1");
    });
  });
});
