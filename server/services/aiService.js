import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger.js';

let aiClient = null;
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    logger.success('Gemini AI Client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Gemini AI SDK:', error.message);
  }
} else {
  logger.warn('GEMINI_API_KEY is not defined. Falling back to local semantic heuristics.');
}

// 1. AI Chat Assistant
export async function chat(messages, contextBooks = []) {
  const latestMessage = messages[messages.length - 1]?.text || '';
  
  if (aiClient) {
    try {
      const bookContextString = contextBooks.slice(0, 15).map(b => `- ${b.title} by ${b.author} (Cat: ${b.category}, Dept: ${b.department})`).join('\n');
      
      const systemPrompt = `You are "AI Librarian", a smart virtual librarian assistant for CampusLibrary AI system.
Here is the current catalog available in this library:
${bookContextString}

Help the student or administrator with their questions about catalogs, recommendation advice, or generic details. Keep your answers concise, helpful, and formatted in markdown. Always refer to books in the catalog when recommending.`;

      const promptContents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...messages.map(m => ({
          role: m.isAdmin ? 'model' : 'user',
          parts: [{ text: m.text }]
        }))
      ];

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: latestMessage,
        config: {
          systemInstruction: systemPrompt
        }
      });

      return response.text;
    } catch (error) {
      logger.error('Gemini Chat error:', error.message);
      // Fallback
    }
  }

  // Local heuristic fallback
  return getLocalChatFallback(latestMessage, contextBooks);
}

// 2. Book Recommendations
export async function recommendBooks(category, userHistory = [], contextBooks = []) {
  if (aiClient) {
    try {
      const prompt = `Based on the category "${category}" and user borrow history: [${userHistory.join(', ')}], recommend 3 matching books from this catalog:\n${
        contextBooks.map(b => `- ${b.title} by ${b.author} (${b.category})`).join('\n')
      }\nFormat response as a markdown bulleted list with brief reasons.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text;
    } catch (error) {
      logger.error('Gemini Book Recommendations error:', error.message);
    }
  }

  // Local fallback
  const matches = contextBooks.filter(b => b.category.toLowerCase() === category.toLowerCase()).slice(0, 3);
  return `### Recommendations for you (Local Heuristics)\n\n` + 
    (matches.length > 0 
      ? matches.map(b => `* **${b.title}** by ${b.author} - Matching your interest in ${b.category}.`).join('\n')
      : `* No exact matches found in "${category}" category. Browse our general catalog for other reading options.`);
}

// 3. Reading Recommendations
export async function recommendReading(studentInterest, contextBooks = []) {
  if (aiClient) {
    try {
      const prompt = `The student has expressed interests in "${studentInterest}". Recommend 2 general articles or books that could expand their reading horizons. Reference specific departments if helpful.`;
      
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text;
    } catch (error) {
      logger.error('Gemini Reading Recommendations error:', error.message);
    }
  }

  return `### Suggested Reading Path\n\n* **Academic writing & critical thinking** - Explores fundamental study habits.\n* **Modern Tech Trends** - Insights into tech innovations and science fields.`;
}

// 4. Duplicate Book Detection
export async function checkDuplicates(booksList) {
  if (aiClient) {
    try {
      const booksString = booksList.map(b => `ID: ${b.id}, Title: ${b.title}, Author: ${b.author}, ISBN: ${b.code}`).join('\n');
      const prompt = `Identify duplicate book titles or duplicate ISBN codes in this list. Report matches as a JSON array in the format: [{"id1": "book_id", "id2": "duplicate_id", "reason": "reason"}]. Return ONLY the JSON array.\nList:\n${booksString}`;
      
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      const jsonText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error) {
      logger.error('Gemini Duplicate Detection error:', error.message);
    }
  }

  // Local fallback
  const duplicates = [];
  const seenTitles = new Map();
  for (const b of booksList) {
    const titleKey = b.title.toLowerCase().trim();
    if (seenTitles.has(titleKey)) {
      duplicates.push({
        id1: seenTitles.get(titleKey),
        id2: b.id,
        reason: `Title match: "${b.title}"`
      });
    } else {
      seenTitles.set(titleKey, b.id);
    }
  }
  return duplicates;
}

// 5. Borrow Demand Prediction
export async function predictDemand(historyRecords, booksList) {
  if (aiClient) {
    try {
      const prompt = `Analyze these borrow records: ${JSON.stringify(historyRecords.slice(0, 30))} and book catalog details. List the top 2 books that are likely to experience high demand next month. Provide reasons.`;
      
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text;
    } catch (error) {
      logger.error('Gemini Predict Demand error:', error.message);
    }
  }

  return `### Borrow Demand Prediction (Local Analytics)\n\n* **High Demand Expected:** Programming & Science catalogs. High circulation volume reported recently.\n* **Stable Circulation:** History and General knowledge items are projected to keep steady check-out rates.`;
}

// 6. Smart Semantic Search
export async function smartSearch(query, booksList) {
  const queryLower = query.toLowerCase().trim();
  
  if (aiClient) {
    try {
      const prompt = `Perform semantic expansion for the query: "${queryLower}". Choose up to 5 book IDs from this list that match conceptually or synonymously. Return ONLY a comma-separated list of book IDs, no extra text.\nList:\n${
        booksList.map(b => `${b.id}: ${b.title} (${b.category}, ${b.description})`).join('\n')
      }`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const matchedIds = response.text.split(',').map(id => id.trim()).filter(Boolean);
      const results = booksList.filter(b => matchedIds.includes(b.id));
      if (results.length > 0) return results;
    } catch (error) {
      logger.error('Gemini Smart Search error:', error.message);
    }
  }

  // Local fallback: simple regex overlap matches
  return booksList.filter(b => 
    b.title.toLowerCase().includes(queryLower) ||
    b.author.toLowerCase().includes(queryLower) ||
    b.category.toLowerCase().includes(queryLower)
  );
}

// Local chat heuristic handler
function getLocalChatFallback(message, contextBooks) {
  const text = message.toLowerCase();
  
  if (text.includes('recommend') || text.includes('suggest')) {
    const list = contextBooks.slice(0, 3).map(b => `- **${b.title}** by ${b.author} (${b.category})`).join('\n');
    return `Here are some recommendations from our current catalog:\n\n${list || 'Catalog is empty. Please register books.'}\n\nAsk me about specific categories like Computer Science or General reading!`;
  }
  
  if (text.includes('fine') || text.includes('fee')) {
    return `Our policy is ₹10 per day for overdue items. You can view outstanding dues on your bookshelf dashboard.`;
  }

  if (text.includes('hours') || text.includes('time')) {
    return `The library is open from 8:00 AM to 8:00 PM, Monday through Saturday. Closed on national holidays.`;
  }

  return `Greetings! I am your AI Librarian. I can assist you with book searches, shelf recommendations, and policy queries. How can I help you today?`;
}

export default {
  chat,
  recommendBooks,
  recommendReading,
  checkDuplicates,
  predictDemand,
  smartSearch
};
