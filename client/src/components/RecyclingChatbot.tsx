import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { MessageCircle, X, Recycle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SYSTEM_MESSAGE: Message = {
  role: "system",
  content: "You are RecycleBot, a helpful AI assistant for the National Recycling Directory.",
};

const SUGGESTED_PROMPTS = [
  "How do I dispose of GLP-1 needles?",
  "Where can I recycle electronics?",
  "What plastics can be recycled?",
  "How do I find recycling near me?",
];

export function RecyclingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);

  const chatMutation = trpc.chatbot.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
    onError: (error) => {
      console.error("[Chatbot] Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again or use the search feature to find recycling locations.",
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    // Add user message to the chat
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);

    // Build conversation history (excluding system message)
    const history = newMessages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    // Send to API (exclude the current message from history)
    chatMutation.mutate({
      message: content,
      history: history.slice(0, -1),
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={handleOpen}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Open RecycleBot chat</span>
            </Button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap">
              <div className="bg-card text-card-foreground text-sm px-3 py-1.5 rounded-lg shadow-md border">
                <div className="flex items-center gap-2">
                  <Recycle className="h-4 w-4 text-primary" />
                  <span>Ask RecycleBot</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
          >
            <div className="bg-card rounded-xl shadow-2xl border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Recycle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">RecycleBot</h3>
                    <p className="text-xs opacity-80">AI Recycling Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close chat</span>
                </Button>
              </div>

              {/* Chat Box */}
              <AIChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={chatMutation.isPending}
                placeholder="Ask about recycling or sharps disposal..."
                height="400px"
                emptyStateMessage="Hi! I'm RecycleBot. Ask me about recycling, sharps disposal, or finding local facilities."
                suggestedPrompts={SUGGESTED_PROMPTS}
                className="border-0 rounded-none shadow-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
