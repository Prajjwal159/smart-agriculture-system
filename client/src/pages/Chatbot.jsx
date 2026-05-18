import { useState } from "react";
import axios from "axios";

function Chatbot() {

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello Farmer 🌾 How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = async () => {

  if (!input) return;

  const userMessage = {
    sender: "user",
    text: input,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);

  try {

    const response = await axios.post(
      "http://localhost:5000/api/chatbot",
      {
        message: input,
      }
    );

    const botMessage = {
      sender: "bot",
      text: response.data.reply,
    };

    setMessages((prev) => [
      ...prev,
      botMessage,
    ]);

  } catch (error) {

    console.log(error);

  }

  setInput("");
};
  
  return (
    <div className="min-h-screen bg-[#f4fff7] p-10">

      <div className="max-w-4xl mx-auto bg-white rounded-[30px] shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-6">

          <h1 className="text-3xl font-bold">
            AI Farming Assistant
          </h1>

          <p className="mt-2">
            Smart agriculture support powered by AI
          </p>

        </div>

        {/* CHAT AREA */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-5 bg-[#f9fffb]">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[70%] px-5 py-4 rounded-2xl text-lg ${
                  msg.sender === "user"
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>

            </div>

          ))}

        </div>

        {/* INPUT */}
        <div className="p-6 border-t flex gap-4">

          <input
            type="text"
            placeholder="Ask farming question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border p-4 rounded-2xl"
          />

          <button
            onClick={handleSend}
            className="bg-green-700 text-white px-8 rounded-2xl font-bold"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}

export default Chatbot;