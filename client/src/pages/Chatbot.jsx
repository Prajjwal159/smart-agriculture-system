import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../api";
import {
  FaRobot, FaUser, FaPaperPlane, FaLeaf,
  FaSpinner, FaTrashAlt, FaSeedling,
} from "react-icons/fa";

const QUICK_PROMPTS = [
  "What fertilizer is best for wheat?",
  "How to improve soil nitrogen levels?",
  "When should I irrigate my crops?",
  "How to prevent fungal diseases?",
  "Best practices for cotton farming?",
];

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello Farmer! 🌾 I'm your AI Agriculture Assistant. Ask me anything about fertilizers, crop management, soil health, or irrigation.",
      time: new Date(),
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  // auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMessage = { sender: "user", text: msg, time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/chatbot`, { message: msg });
      setMessages(prev => [...prev, {
        sender: "bot",
        text: res.data.reply,
        time: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please check that the server is running.",
        time: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      sender: "bot",
      text: "Chat cleared. Hello again! 🌾 Ask me anything about smart farming.",
      time: new Date(),
    }]);
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

          {/* ── CHAT PANEL ── */}
          <div className="xl:col-span-3 flex flex-col h-[70vh] sm:h-[75vh] xl:h-[calc(100vh-160px)]">
            <div className="bg-white rounded-2xl shadow border border-gray-50 flex flex-col h-full overflow-hidden">

              {/* CHAT HEADER */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-400 rounded-xl flex items-center justify-center shadow">
                    <FaRobot size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-green-900">AI Farming Assistant</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-400">Online · Powered by GPT-3.5</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearChat}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-xl transition-all font-medium"
                >
                  <FaTrashAlt size={11} /> Clear
                </button>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {/* BOT AVATAR */}
                      {msg.sender === "bot" && (
                        <div className="w-7 h-7 bg-gradient-to-br from-green-600 to-emerald-400 rounded-full flex items-center justify-center shrink-0 mb-1">
                          <FaRobot size={12} className="text-white" />
                        </div>
                      )}

                      <div className={`max-w-[75%] space-y-1`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-6 shadow-sm
                          ${msg.sender === "user"
                            ? "bg-gradient-to-r from-green-700 to-emerald-500 text-white rounded-br-sm"
                            : msg.isError
                              ? "bg-red-50 text-red-700 border border-red-100 rounded-bl-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <p className={`text-xs text-gray-400 ${msg.sender === "user" ? "text-right" : ""}`}>
                          {formatTime(msg.time)}
                        </p>
                      </div>

                      {/* USER AVATAR */}
                      {msg.sender === "user" && (
                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center shrink-0 mb-1">
                          <FaUser size={11} className="text-green-700" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* TYPING INDICATOR */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-end gap-2.5"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-green-600 to-emerald-400 rounded-full flex items-center justify-center shrink-0">
                        <FaRobot size={12} className="text-white" />
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* INPUT BAR */}
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-green-300 focus-within:border-green-300 transition-all">
                  <FaLeaf size={14} className="text-green-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask about fertilizers, crops, soil, irrigation..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 disabled:opacity-50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    className="w-8 h-8 bg-gradient-to-r from-green-700 to-emerald-500 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all shrink-0"
                  >
                    {loading
                      ? <FaSpinner size={12} className="animate-spin" />
                      : <FaPaperPlane size={12} />
                    }
                  </motion.button>
                </div>
                <p className="text-xs text-gray-300 mt-1.5 text-center">Press Enter to send</p>
              </div>

            </div>
          </div>

          {/* ── SIDE PANEL — hidden on mobile, shown from sm upward ── */}
          <div className="hidden sm:block space-y-5">

            {/* QUICK PROMPTS */}
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
              <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                <FaSeedling size={13} className="text-green-600" /> Quick Questions
              </h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((q, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 3 }}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="w-full text-left text-xs text-gray-600 bg-green-50 hover:bg-green-100 hover:text-green-800 px-3 py-2.5 rounded-xl transition-all border border-green-100 disabled:opacity-50"
                  >
                    💬 {q}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ABOUT */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-500 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <FaRobot size={16} />
                <h3 className="text-sm font-bold">About This Assistant</h3>
              </div>
              <ul className="space-y-2 text-xs text-green-100 leading-5">
                <li>🌱 Expert in crop nutrition & fertilizers</li>
                <li>💧 Irrigation and water management</li>
                <li>🐛 Pest and disease identification</li>
                <li>🌤️ Weather-based farming advice</li>
                <li>📊 Soil health recommendations</li>
              </ul>
            </div>

            {/* CHAT STATS */}
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
              <h3 className="text-sm font-bold text-green-900 mb-3">Session Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {messages.filter(m => m.sender === "user").length}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Questions</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {messages.filter(m => m.sender === "bot").length}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Responses</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
