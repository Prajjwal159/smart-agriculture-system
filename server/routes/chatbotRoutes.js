const express = require("express");

const router = express.Router();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// AI CHATBOT
router.post("/", async (req, res) => {

  try {

    const { message } = req.body;

    const completion =
      await client.chat.completions.create({

        model: "gpt-3.5-turbo",

        messages: [
          {
            role: "system",
            content:
              "You are an AI agriculture expert helping farmers with fertilizer recommendations, irrigation, diseases, and crop management.",
          },

          {
            role: "user",
            content: message,
          },
        ],

      });

    res.json({
      reply:
        completion.choices[0].message.content,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "AI Chatbot Error",
    });

  }
});


module.exports = router;