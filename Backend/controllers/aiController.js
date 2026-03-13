const ChatSession = require('../models/ChatSession');
const Recipe = require('../models/Recipe');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_CHATS_PER_USER = 4;

// System prompt for Chef AI — the heart of the intelligence
const CHEF_AI_SYSTEM_PROMPT = `You are Chef AI — a world-class culinary assistant. You ONLY talk about food, cooking, recipes, nutrition, ingredients, kitchen techniques, and meal planning.

STRICT RULES — NEVER BREAK THESE:
1. ALWAYS return valid JSON: { "reply": "string", "recipe": null | {...}, "suggestions": ["string"] }
2. If the user asks ANYTHING unrelated to food/cooking/nutrition/kitchen — politely but firmly refuse. Set "recipe" to null and reply with something like: "I'm Chef AI — I only know about food and cooking! 🍳 Try asking me for a recipe instead." Then give 2-3 food suggestions.
3. If user asks for a recipe, starts with GENERATE, mentions ingredients, or uses words like "make", "cook", "recipe", "dish", "prepare", "what can I make" — you MUST generate a FULL recipe in the "recipe" field. NEVER respond with just tips when a recipe is requested.
4. If it's a cooking question (techniques, substitutions, tips, nutrition) — answer in "reply", set recipe to null.
5. "suggestions" must have 2-3 short food-related follow-up ideas (max 5 words each).
6. Strictly respect constraints: dietary restrictions, time limits, no-oil, vegan, etc.
7. Recipes must use real measurements and be logically sound.
8. ALWAYS include nutritional values in every recipe (in the "nutrition" field as an object).
9. MULTIPLE RECIPE REQUESTS: If the user asks for more than one recipe (e.g. "give me 3 meals" or "breakfast, lunch and snack"), you MUST still only return ONE recipe in the "recipe" field — pick the BEST or most interesting one to generate fully. In the "reply", briefly describe all the other requested options as plain text (name + 1-line description each). Never return an empty or partial recipe object.
10. LANGUAGE: Respond in the same language the user writes in. If the user writes in Hindi, Marathi, Tamil, etc., reply in that language.
11. SLANG & INSULTS: Understand casual slang food requests in any language. However, if the user sends clear insults, profanity, or words that are obviously NOT food-related (e.g. using an insult word as if it were a dish name), do NOT generate a recipe — politely refuse and redirect to food topics. Use context to judge intent.

TOPICS YOU REFUSE (respond with food redirect):
- Relationships, dating, romance
- Politics, news, general knowledge
- Math, coding, science (non-food)
- Anything not related to food, drink, cooking, or nutrition

Recipe format (ALWAYS include all fields, ALWAYS include nutrition):
{
  "title": "Dish Name",
  "ingredients": [{"name": "ingredient", "quantity": "amount", "note": "optional tip"}],
  "steps": ["Step 1 with detail", "Step 2..."],
  "cuisine": "Indian/Italian/etc",
  "cookTime": 30,
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"],
  "notes": "Chef's tips or variations",
  "nutrition": {
    "calories": "350 kcal",
    "protein": "18g",
    "carbs": "42g",
    "fat": "12g",
    "fiber": "5g",
    "sodium": "420mg"
  }
}`;


// --- Chat Session CRUD ---

// GET /api/ai/chats
exports.listChats = async (req, res) => {
  try {
    const chats = await ChatSession.find({ userId: req.session.userId })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt messages')
      .lean();

    // Return with last message preview
    const chatPreviews = chats.map(c => ({
      _id: c._id,
      title: c.title,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.content?.slice(0, 80) || '',
    }));

    res.json(chatPreviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

// POST /api/ai/chats — create new chat (enforces max 4)
exports.createChat = async (req, res) => {
  try {
    // Count existing chats
    const existingCount = await ChatSession.countDocuments({ userId: req.session.userId });

    if (existingCount >= MAX_CHATS_PER_USER) {
      // Delete the oldest chat to make room
      const oldest = await ChatSession.findOne({ userId: req.session.userId }).sort({ updatedAt: 1 });
      if (oldest) await oldest.deleteOne();
    }

    const chat = new ChatSession({ userId: req.session.userId, title: 'New Chat', messages: [] });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

// GET /api/ai/chats/:id — get full chat history
exports.getChat = async (req, res) => {
  try {
    const chat = await ChatSession.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chat' });
  }
};

// DELETE /api/ai/chats/:id
exports.deleteChat = async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};

// --- Core AI Interaction ---

// POST /api/ai/chat  { chatId, message }
exports.handleChat = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    if (!chatId || !message) return res.status(400).json({ message: 'chatId and message are required' });

    const chat = await ChatSession.findOne({ _id: chatId, userId: req.session.userId });
    if (!chat) return res.status(404).json({ message: 'Chat session not found' });

    // Build conversation history for Groq (last 10 messages for context window)
    const contextHistory = chat.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Add current user message to context
    contextHistory.push({ role: 'user', content: message });

    // Call Groq with the system prompt + conversation history
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: CHEF_AI_SYSTEM_PROMPT },
        ...contextHistory
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const rawContent = completion.choices[0].message.content;
    let aiResponse;
    try {
      aiResponse = JSON.parse(rawContent);
    } catch (parseErr) {
      aiResponse = { reply: rawContent, recipe: null, suggestions: [] };
    }

    // Persist user message
    chat.messages.push({ role: 'user', content: message });

    // Auto-set title from the first user message
    if (chat.messages.length === 1) {
      chat.title = message.slice(0, 50);
    }

    // Handle recipe auto-save
    let savedRecipeId = null;
    if (aiResponse.recipe && aiResponse.recipe.title) {
      try {
        const newRecipe = new Recipe({
          ...aiResponse.recipe,
          ownerId: req.session.userId,
          tags: [...(aiResponse.recipe.tags || []), 'chef-ai', 'ai-generated'],
        });
        await newRecipe.save();
        savedRecipeId = newRecipe._id;
      } catch (saveErr) {
        console.error('[Chef AI] Recipe save failed:', saveErr.message);
      }
    }

    // Persist assistant message
    chat.messages.push({
      role: 'assistant',
      content: aiResponse.reply || 'Here is your recipe!',
      recipeId: savedRecipeId,
      recipeData: aiResponse.recipe || null,
    });

    await chat.save();

    res.json({
      reply: aiResponse.reply,
      recipe: aiResponse.recipe,
      suggestions: aiResponse.suggestions || [],
      recipeId: savedRecipeId,
    });
  } catch (err) {
    console.error('[Chef AI] Chat error:', err.message);
    res.status(500).json({ message: 'AI interaction failed', details: err.message });
  }
};

// Legacy clear chat (kept for compatibility)
exports.clearChat = async (req, res) => {
  req.session.chatHistory = [];
  res.json({ message: 'Chat history cleared' });
};

// POST /api/ai/pantry-insight { ingredients: [] }
exports.getPantryInsight = async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || ingredients.length === 0) return res.json({ insight: null });

    const prompt = `You are a friendly Indian cooking expert. Given these pantry ingredients: ${ingredients.join(', ')}.
Return JSON: { "headline": "One punchy sentence about what they can make (max 12 words, mention specific dish names)", "tip": "One actionable tip or exciting idea (max 20 words)", "mood": "excited|neutral|inspiring" }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 150,
    });
    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error('[Pantry Insight]', err.message);
    res.json({ headline: 'Great ingredients!', tip: 'Add more to unlock more recipes.' });
  }
};

// POST /api/ai/vision-pantry { image: "base64..." }
exports.visionPantry = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image data is required' });

    // Clean base64 string
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = "List all the individual food ingredients and pantry items you see in this kitchen/fridge/pantry image. Return ONLY a JSON object with a single key 'ingredients' which is an array of strings. Each string should be a single ingredient name (e.g. 'Tomato', 'Chicken', 'Milk'). Be as accurate as possible.";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      model: "llama-3.2-11b-vision-preview",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error('[Vision Pantry Error]', err.message);
    res.status(500).json({ message: 'Vision scanning failed', details: err.message });
  }
};

// POST /api/ai/morph-recipe { recipe, mutation }
exports.morphRecipe = async (req, res) => {
  try {
    const { recipe, mutation } = req.body;
    if (!recipe || !mutation) return res.status(400).json({ message: 'Recipe and mutation are required' });

    const prompt = `Take the following recipe and transform it based on this instruction: "${mutation}".
STRICTLY return the updated recipe as a valid JSON object in the SAME format as the original. 
Ensure the transformations (ingredients, steps, name) are logically sound and culinary-accurate.

Original Recipe:
${JSON.stringify(recipe)}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert culinary alchemist. You only return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const morphed = JSON.parse(completion.choices[0].message.content);
    res.json(morphed);
  } catch (err) {
    console.error('[Morph Recipe Error]', err.message);
    res.status(500).json({ message: 'Recipe transformation failed' });
  }
};

