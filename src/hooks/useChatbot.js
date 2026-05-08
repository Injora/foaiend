import { useState, useEffect, useCallback, useRef } from 'react';

const AI_TOKEN = import.meta.env.VITE_AI_TOKEN;
const MODEL_URL =
  'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const STORAGE_KEY = 'chatbot-messages';
const MAX_MESSAGES = 30;

export function useChatbot(issData, newsHeadlines) {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const abortRef = useRef(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  const buildSystemPrompt = useCallback(() => {
    const issInfo = issData
      ? `Current ISS Location: Latitude ${issData.position?.lat?.toFixed(4)}, Longitude ${issData.position?.lon?.toFixed(4)}. Current ISS Speed: ${issData.speed} km/h. Location: ${issData.location}.`
      : 'ISS data unavailable.';

    const newsInfo =
      newsHeadlines && newsHeadlines.length > 0
        ? `Current News Headlines:\n${newsHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
        : 'No news data available.';

    return `You are a helpful dashboard assistant. You ONLY have access to the following real-time data:

${issInfo}

${newsInfo}

RULES:
- You can ONLY answer questions about the ISS position, ISS speed, ISS location, and the news headlines listed above.
- If asked about anything outside this data, respond EXACTLY with: "I am restricted to dashboard data only."
- Be concise and helpful when answering about the available data.
- Format your responses clearly.`;
  }, [issData, newsHeadlines]);

  const sendMessage = useCallback(
    async (userMessage) => {
      const userMsg = { role: 'user', content: userMessage, timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      try {
        if (!AI_TOKEN || AI_TOKEN === 'your_huggingface_token_here') {
          // Fallback: simulate AI response based on keywords
          await new Promise(r => setTimeout(r, 1000));
          const response = generateFallbackResponse(userMessage, issData, newsHeadlines);
          const botMsg = { role: 'assistant', content: response, timestamp: Date.now() };
          setMessages(prev => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }

        const systemPrompt = buildSystemPrompt();
        const recentMessages = messages.slice(-10);

        const prompt = `<s>[INST] ${systemPrompt}\n\n${recentMessages
          .map(m => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`))
          .join('\n')}\nUser: ${userMessage} [/INST]`;

        abortRef.current = new AbortController();

        const res = await fetch(MODEL_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AI_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 300,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
            },
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API error: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        let reply = data[0]?.generated_text || 'I am restricted to dashboard data only.';
        reply = reply.trim();

        const botMsg = { role: 'assistant', content: reply, timestamp: Date.now() };
        setMessages(prev => [...prev, botMsg]);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Chatbot fetch error:', err);
        const errMsg = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, buildSystemPrompt, issData, newsHeadlines]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    messages,
    isTyping,
    isOpen,
    sendMessage,
    clearChat,
    toggleChat,
  };
}

function generateFallbackResponse(message, issData, newsHeadlines) {
  const lower = message.toLowerCase();

  if (lower.includes('iss') || lower.includes('space station') || lower.includes('position') || lower.includes('location') || lower.includes('where')) {
    if (issData?.position) {
      return `The ISS is currently at Latitude ${issData.position.lat.toFixed(4)}, Longitude ${issData.position.lon.toFixed(4)}. It's travelling at approximately ${issData.speed} km/h. Location: ${issData.location}.`;
    }
    return 'ISS data is still loading. Please try again in a moment.';
  }

  if (lower.includes('speed') || lower.includes('fast') || lower.includes('velocity')) {
    if (issData?.speed) {
      return `The ISS is currently moving at approximately ${issData.speed} km/h (about ${(issData.speed / 1.609).toFixed(0)} mph).`;
    }
    return 'Speed data is still being calculated. Please wait for the next update.';
  }

  if (lower.includes('news') || lower.includes('headline') || lower.includes('article')) {
    if (newsHeadlines && newsHeadlines.length > 0) {
      return `Here are the current headlines:\n\n${newsHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}`;
    }
    return 'News data is still loading. Please try again shortly.';
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'Hello! I can help you with information about the ISS (position, speed, location) and current news headlines. What would you like to know?';
  }

  if (lower.includes('help') || lower.includes('what can you')) {
    return 'I can answer questions about:\n\n1. **ISS Position** — Current latitude, longitude, and location\n2. **ISS Speed** — Current orbital velocity\n3. **News Headlines** — Current top news stories\n\nTry asking something like "Where is the ISS?" or "What are the latest headlines?"';
  }

  return 'I am restricted to dashboard data only.';
}
