import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateWelcomeEmailContent,
  formatWelcomeEmailHtml,
  formatWelcomeEmailText,
} from "./welcomeEmail";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";

describe("Welcome Email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateWelcomeEmailContent", () => {
    it("should generate personalized content using LLM", async () => {
      const mockLLMResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                greeting: "Welcome to the Recyclish family!",
                intro: "Thank you for joining our community.",
                tips: [
                  "Rinse containers before recycling",
                  "Check local guidelines",
                  "Flatten cardboard boxes",
                ],
                localInfo: "California has great recycling programs.",
                closing: "Happy recycling!",
              }),
            },
          },
        ],
      };

      vi.mocked(invokeLLM).mockResolvedValue(mockLLMResponse as any);

      const result = await generateWelcomeEmailContent(
        "test@example.com",
        "90210"
      );

      expect(result.subject).toContain("California");
      expect(result.greeting).toBe("Welcome to the Recyclish family!");
      expect(result.tips).toHaveLength(3);
      expect(invokeLLM).toHaveBeenCalledTimes(1);
    });

    it("should return fallback content when LLM fails", async () => {
      vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM error"));

      const result = await generateWelcomeEmailContent(
        "test@example.com",
        "10001"
      );

      expect(result.subject).toContain("New York");
      expect(result.greeting).toBe("Welcome to the Recyclish community!");
      expect(result.tips).toHaveLength(4);
    });

    it("should identify state from zip code prefix", async () => {
      vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM error"));

      // Test Texas zip code
      const texasResult = await generateWelcomeEmailContent(
        "test@example.com",
        "75001"
      );
      expect(texasResult.subject).toContain("Texas");

      // Test Florida zip code
      const floridaResult = await generateWelcomeEmailContent(
        "test@example.com",
        "33101"
      );
      expect(floridaResult.subject).toContain("Florida");

      // Test unknown zip code
      const unknownResult = await generateWelcomeEmailContent(
        "test@example.com",
        "00000"
      );
      expect(unknownResult.subject).toContain("your area");
    });
  });

  describe("formatWelcomeEmailHtml", () => {
    it("should generate valid HTML with all content sections", () => {
      const content = {
        subject: "Welcome to Recyclish!",
        greeting: "Hello there!",
        intro: "Thanks for subscribing.",
        tips: ["Tip 1", "Tip 2", "Tip 3"],
        localInfo: "Local info here.",
        closing: "Best regards!",
      };

      const html = formatWelcomeEmailHtml(content);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Hello there!");
      expect(html).toContain("Thanks for subscribing.");
      expect(html).toContain("<li");
      expect(html).toContain("Tip 1");
      expect(html).toContain("Tip 2");
      expect(html).toContain("Tip 3");
      expect(html).toContain("Local info here.");
      expect(html).toContain("Best regards!");
      expect(html).toContain("recyclish.com");
    });

    it("should include the Recyclish logo", () => {
      const content = {
        subject: "Test",
        greeting: "Hi",
        intro: "Intro",
        tips: ["Tip"],
        localInfo: "Info",
        closing: "Bye",
      };

      const html = formatWelcomeEmailHtml(content);
      expect(html).toContain("img");
      expect(html).toContain("Recyclish");
    });
  });

  describe("formatWelcomeEmailText", () => {
    it("should generate plain text with all content sections", () => {
      const content = {
        subject: "Welcome to Recyclish!",
        greeting: "Hello there!",
        intro: "Thanks for subscribing.",
        tips: ["Tip 1", "Tip 2", "Tip 3"],
        localInfo: "Local info here.",
        closing: "Best regards!",
      };

      const text = formatWelcomeEmailText(content);

      expect(text).toContain("Welcome to Recyclish!");
      expect(text).toContain("Hello there!");
      expect(text).toContain("Thanks for subscribing.");
      expect(text).toContain("1. Tip 1");
      expect(text).toContain("2. Tip 2");
      expect(text).toContain("3. Tip 3");
      expect(text).toContain("Local info here.");
      expect(text).toContain("Best regards!");
      expect(text).toContain("recyclish.com");
    });

    it("should number tips correctly", () => {
      const content = {
        subject: "Test",
        greeting: "Hi",
        intro: "Intro",
        tips: ["First", "Second", "Third", "Fourth"],
        localInfo: "Info",
        closing: "Bye",
      };

      const text = formatWelcomeEmailText(content);
      expect(text).toContain("1. First");
      expect(text).toContain("2. Second");
      expect(text).toContain("3. Third");
      expect(text).toContain("4. Fourth");
    });
  });
});
