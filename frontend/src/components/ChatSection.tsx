"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { askChat } from '../lib/api';

type Source = { id: string; title: string };
type Message = { role: "user" | "ai"; content: string; sources?: Source[] };

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Tell me about 'Sapiens'.",
    "Which books talk about history?",
    "Summarize 'Sharp Objects'.",
  ];

  // --- 1. Load chat from localStorage on mount ---
  useEffect(() => {
    const savedChat = sessionStorage.getItem("document_chat_history");
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse saved chat", e);
      }
    }
  }, []);

  // --- 2. Save chat to localStorage whenever messages change ---
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("document_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll logic
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "nearest" 
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return;

    // We use a functional update to ensure we have the latest state
    setMessages((prev) => {
      const updated = [...prev, { role: "user", content: query } as Message];
      return updated;
    });
    
    setInput("");
    setIsLoading(true);

    try {
      const data = await askChat(query);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer, sources: data.sources },
      ]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I couldn't reach the AI server. Is LM Studio running?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. Optional: Clear Chat helper ---
  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem("document_chat_history");
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header with Clear button */}
      <div className="px-6 py-2 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Chat History</span>
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors uppercase font-bold"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-400 mt-20">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">How can I help with your library?</h3>
            <p className="text-sm mb-6">Ask about themes, characters, or summaries.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button key={idx} onClick={() => handleSend(q)} className="bg-white border border-zinc-200 text-zinc-600 text-xs px-4 py-2 rounded-full hover:border-blue-400 hover:text-blue-600 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-zinc-200 text-zinc-800 shadow-sm"}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 border-t border-zinc-100 pt-3">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Sources Found:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s) => (
                        <Link key={s.id} href={`/books/${s.id}`} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[10px] px-2 py-1 rounded transition-colors">
                          📖 {s.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-3 shadow-sm">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-4 bg-white border-t border-zinc-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your documents..."
            className="w-full py-3 pl-4 pr-12 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black text-sm"
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg disabled:bg-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
}
