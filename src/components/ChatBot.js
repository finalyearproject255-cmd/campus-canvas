import React, { useState, useRef, useEffect } from 'react';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm CampusBot 🤖. Ask me about uploading, approval, or errors!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2. Simulate AI "Thinking"
    setTimeout(() => {
      const botResponse = getBotResponse(input);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 800);
  };

  // 🧠 THE BRAIN: Keyword Matching
  const getBotResponse = (text) => {
    const lower = text.toLowerCase();

    // ERROR FIXING & SUPPORT
    if (lower.includes('error') || lower.includes('bug')) return "If you see an error, try refreshing the page. If it persists, check if your image is under 1MB.";
    if (lower.includes('upload') || lower.includes('add')) return "To upload, click the '+' button top-right. You can add up to 4 images (Max 1MB total).";
    if (lower.includes('delete') || lower.includes('remove')) return "Only the Project Owner or an Admin can delete a project. Go to the Project Details page to find the delete button.";
    if (lower.includes('admin')) return "Admins can approve/reject projects from the Dashboard. Do you need the admin login credentials?";
    if (lower.includes('password') || lower.includes('login')) return "For this prototype, use '23bsccs01' for Student and 'admin' for Admin.";
    if (lower.includes('image') || lower.includes('photo')) return "We use Base64 encoding for images to keep the database free. Please keep files small!";
    if (lower.includes('hello') || lower.includes('hi')) return "Hello! 👋 I am here to help you navigate CampusCanvas.";
    
    // Fallback
    return "I'm just a demo AI 😅. Try asking about 'uploading', 'errors', or 'admin'.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white text-gray-800 w-80 h-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 mb-4 animate-fadeIn transform transition-all">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl bg-white/20 rounded-full p-1">🤖</span>
              <div>
                <span className="font-bold block text-sm">CampusBot</span>
                <span className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white font-bold text-xl">&times;</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for help..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button type="submit" className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-md disabled:opacity-50" disabled={!input.trim()}>
              ➜
            </button>
          </form>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-3xl transition duration-300 ${isOpen ? 'bg-gray-600 rotate-90' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-110 animate-bounce'}`}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
}

export default ChatBot;