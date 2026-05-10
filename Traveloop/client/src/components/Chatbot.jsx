import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { getSmartFallbackResponse } from '../utils/chatbotLogic';

// Safely initialize Gemini
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
if (GEMINI_KEY && GEMINI_KEY !== 'undefined') {
  genAI = new GoogleGenerativeAI(GEMINI_KEY);
}

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your Traveloop AI assistant. How can I help you plan your next adventure today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'aiChats'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'asc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const history = querySnapshot.docs.map(doc => doc.data().message);
        setMessages(history);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history from Firestore when opening
  useEffect(() => {
    if (isOpen && user) {
      const timer = setTimeout(() => loadChatHistory(), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user, loadChatHistory]);

  const saveMessageToFirestore = async (msg) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'aiChats'), {
        userId: user.uid,
        message: msg,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    saveMessageToFirestore(userMessage);
    
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      let botResponse;
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a helpful travel assistant for the Traveloop app. Answer the following travel question: ${currentInput}. Focus on routes, budgets in INR, and destination tips.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        botResponse = response.text();
      } else {
        // No API Key, use fallback
        botResponse = getSmartFallbackResponse(currentInput);
      }
      
      const botMsg = { role: 'bot', content: botResponse };
      setMessages(prev => [...prev, botMsg]);
      saveMessageToFirestore(botMsg);
    } catch (error) {
      console.error("Chatbot API error:", error);
      const botMsg = { role: 'bot', content: getSmartFallbackResponse(currentInput) };
      setMessages(prev => [...prev, botMsg]);
      saveMessageToFirestore(botMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] h-[550px] glass overflow-hidden flex flex-col border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-primary-600 to-primary-500 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm uppercase tracking-widest">Traveloop AI</h3>
                  <p className="text-[10px] text-white/70 font-bold">Smart Travel Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-500 shadow-lg shadow-primary-500/20' : 'bg-white/10 border border-white/10'}`}>
                      {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-primary-400" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-none shadow-lg' : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                      <Bot size={16} className="text-primary-400" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-1 items-center h-10">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/2 backdrop-blur-xl">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about destinations, budgets..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 outline-none focus:border-primary-500/50 transition-all text-sm text-white placeholder:text-slate-500"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-2 p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-400 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:shadow-primary-500/40 hover:shadow-2xl'}`}
      >
        {isOpen ? <X className="text-white" size={28} /> : <MessageSquare className="text-white" size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-[#020617] animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
