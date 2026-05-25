const { OpenAI } = require("openai");
require("dotenv").config({ path: "../backend/.env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log("Testing OpenAI API Key:", process.env.OPENAI_API_KEY ? "Found" : "Not Found");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello! Say hi." }],
      max_tokens: 10,
    });
    console.log("Success! Response:", completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API test failed:", error.message);
  }
}

testOpenAI();
