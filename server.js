import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const tools = {
  writer: "Write or improve the user's text. Be clear, natural and professional.",
  summarizer: "Summarize the user's text into concise key points.",
  translator: "Translate the user's text accurately while preserving meaning and tone.",
  marketer: "Create persuasive marketing copy without making deceptive claims.",
  seo: "Create SEO-friendly title, meta description, keywords and content outline.",
  ideas: "Generate useful content ideas based on the user's topic.",
  code: "Explain, debug or generate code. Prefer secure, maintainable solutions.",
  email: "Draft a polished professional email based on the user's request.",
  social: "Create engaging social media copy with optional hashtags.",
  resume: "Improve resume/profile content using concise, achievement-focused language.",
  chatbot: "Answer the user's question helpfully and safely."
};

app.post("/api/ai", async (req, res) => {
  try {
    const { tool = "chatbot", prompt = "" } = req.body || {};
    if (!prompt.trim()) return res.status(400).json({ error: "Please enter a prompt." });
    if (!process.env.AI_API_KEY || !process.env.AI_API_URL || !process.env.AI_MODEL) {
      return res.status(503).json({
        error: "AI is not connected yet. Add AI_API_URL, AI_API_KEY and AI_MODEL to your .env file."
      });
    }

    const system = tools[tool] || tools.chatbot;
    const response = await fetch(process.env.AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "AI provider request failed."
      });
    }

    const text = data?.choices?.[0]?.message?.content || "No response returned.";
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: "Server error. Check your AI provider configuration." });
  }
});

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI Studio Pro running on http://localhost:${port}`));
