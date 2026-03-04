import React, { useState, useRef, useEffect } from 'react';
import { collegeData } from '../data/collegeData'; 
import { Bot, Send, X } from 'lucide-react';

function ChatBot({ isOpen, onClose, onOpen }) {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm CampusBot. Ask me anything!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      // 2. 🛡️ GET KEY FROM ENV FILE
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("API Key is missing! Check your .env file.");
      }

      // 3. 🧠 SYSTEM CONTEXT
      const systemContext = `
        You are "CampusBot", the AI assistant for ${collegeData?.collegeInfo?.name || "Naipunnya Institute (NIMIT)"}.
        
        --- 🏫 COLLEGE DATA ---
        - Location: Pongam, Koratty East, Thrissur, Kerala.
        - Principal: Rev. Fr. Dr. Paulachan K.J.
        - Departments: ${collegeData?.collegeInfo?.departments?.join(", ") || "CS, Commerce, Management, HM"}
        - Events: ${collegeData?.collegeInfo?.campusLife?.majorEvents?.join(", ") || "Arts Day, Sports Day, Food Fest"}
        
        INSTRUCTIONS:
        1. If asked "Where is the college?", use the Location data above.
        2. Use your own knowledge for Coding/Math.
        3. Be concise.
      `;

      // 4. 🚨 REQUEST (Using Gemini 2.5 Flash)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: systemContext + "\n\nUser Question: " + userMsg.text }]
            }]
          }),
        }
      );

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiResponse) throw new Error("No response from AI.");

      setIsThinking(false);
      setMessages((prev) => [...prev, { text: aiResponse, isBot: true }]);

    } catch (error) {
      console.error("Chat Error:", error);
      setIsThinking(false);
      setMessages((prev) => [...prev, { text: `⚠️ Error: ${error.message}`, isBot: true }]);
    }
  };

  // --- UI RENDER (Same as before) ---
  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button onClick={onOpen} className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center border border-white/20 animate-bounce text-white">
          <Bot size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] md:w-[380px] h-[500px] bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-indigo-900/50 border-b border-white/10 p-4 flex items-center justify-between">
            <span className="text-white font-bold flex gap-2"><Bot size={20}/> CampusBot</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 text-sm rounded-xl ${!msg.isBot ? 'bg-indigo-600 text-white' : 'bg-[#1a1a1a] text-gray-200 border border-white/10'}`}>
                  {msg.text.split('```').map((part, i) => i % 2 === 1 ? <code key={i} className="block bg-black/50 p-2 text-xs my-1">{part}</code> : <span key={i}>{part}</span>)}
                </div>
              </div>
            ))}
            {isThinking && <div className="text-indigo-400 text-xs p-2 animate-pulse">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-black border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..." 
              className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button onClick={handleSend} disabled={isThinking} className="bg-indigo-600 p-2 rounded-lg text-white disabled:opacity-50"><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;