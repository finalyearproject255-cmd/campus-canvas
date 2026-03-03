import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collegeData } from '../data/collegeData'; 
import { Bot, Send, X, Sparkles } from 'lucide-react'; // 🆕 Upgraded to premium icons

// 🔑 Your API Key
const API_KEY = "AIzaSyBA3WcmWZskhy8Wxqkz6aXTkmmgLbNLe38"; 

function ChatBot({ isOpen, onClose, onOpen }) {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm CampusBot. I can help you with CampusCanvas, tell you about NIMIT, or even help you write code! Ask me anything.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to the latest message
  useEffect(() => {
    if (isOpen) {
       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen]);

  // --- AI LOGIC (100% UNCHANGED) ---
  const generateResponse = async (userQuestion) => {
    try {
      if (!API_KEY) return "⚠️ Error: API Key Missing.";
      
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      // Using the Next-Gen 2.5 Flash model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 🧠 THE DYNAMIC BRAIN: College Data + General AI Mentor Permission
      const systemContext = `
        You are "CampusBot", the official AI assistant for ${collegeData.collegeInfo.name}, but you are also a highly advanced, general-purpose AI programming mentor.
        
        NIMIT KNOWLEDGE BASE:
        - Departments: ${collegeData.collegeInfo.departments.join(", ")}
        - Placements: ${collegeData.collegeInfo.placements.highlights}
        - Campus Events: ${collegeData.collegeInfo.campusLife.majorEvents.join(", ")}
        
        CAMPUSCANVAS APP MANUAL & HELP DESK:
        - Purpose: ${collegeData.appManual.purpose}
        - Developers: ${collegeData.appManual.team}
        - How to Add a Project: ${collegeData.appManual.userGuide.howToAddProject}
        
        BUTTON EXPLANATIONS:
        - '+' Button: ${collegeData.appManual.uiGuide.plusButton}
        - Launch App Button: ${collegeData.appManual.uiGuide.launchAppButton}
        
        CRITICAL INSTRUCTIONS:
        1. IF the user asks about the college, the app, or uploads, use the knowledge base above to answer accurately.
        2. IF the user asks a general question (e.g., "Write a Python script", "Explain React hooks", "Tell me a joke", or general chatting), YOU MUST ANSWER IT fully and naturally using your broad AI knowledge. Do not restrict yourself to just the college data.
        3. Format code blocks beautifully if asked to write code.
        4. Be professional, friendly, and act as a highly intelligent mentor.
      `;

      const result = await model.generateContent(`${systemContext}\n\nUser Question: ${userQuestion}\nAnswer:`);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error("AI Error:", error);
      return `⚠️ Debug Error: ${error.message}`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add User Message
    const userMsg = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);
    
    // Get AI Response
    const aiText = await generateResponse(input);
    
    // Add AI Message
    setIsThinking(false);
    setMessages((prev) => [...prev, { text: aiText, isBot: true }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* 🔴 THE FLOATING BUTTON (Dark Theme) */}
      {!isOpen && (
        <button 
          onClick={onOpen}
          className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-110 transition-all duration-300 border border-white/20"
        >
          <Bot className="w-6 h-6 text-white" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#0a0a0a] rounded-full animate-pulse"></span>
        </button>
      )}

      {/* 🟢 THE CHAT WINDOW (Wider, Taller, Premium Dark Glassmorphism) */}
      {isOpen && (
        <div className="w-[380px] h-[600px] max-h-[80vh] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between relative overflow-hidden shrink-0">
            {/* Soft Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wide flex items-center gap-1.5">
                  CampusBot <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </h3>
                <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-widest">NIMIT AI Assistant</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="relative z-10 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                
                {msg.isBot && (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                )}

                <div 
                  className={`max-w-[80%] p-3.5 text-sm leading-relaxed shadow-lg ${
                    !msg.isBot 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white/10 text-gray-200 border border-white/5 rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {/* Your exact Markdown Logic, styled for dark mode! */}
                  {msg.text.split('```').map((part, i) => 
                    i % 2 === 1 ? (
                      <code key={i} className="block bg-[#050505] text-green-400 p-3 rounded-lg border border-white/10 text-xs my-2 overflow-x-auto font-mono shadow-inner">
                        {part}
                      </code>
                    ) : (
                      <span key={i} className="whitespace-pre-wrap">{part}</span>
                    )
                  )}
                </div>

              </div>
            ))}

            {/* Bouncing Loader Animation */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 w-16">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/40 border-t border-white/10 shrink-0">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder-gray-500"
              />
              <button 
                onClick={handleSend} 
                disabled={isThinking || !input.trim()} 
                className={`absolute right-2 p-2 rounded-lg transition-colors ${
                  isThinking || !input.trim() 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">
                AI can make mistakes. Verify code.
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default ChatBot;