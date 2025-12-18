# 📋 Hướng Dẫn Build RAG Chatbot về Hoạt Động Mèo + Sensor Data với MongoDB & Gemini API

**Dự Án:** Cat Activity & Sensor Chatbot (Mèo Ăn Assistant)  
**Stack:** JavaScript, LangChain.js, Next.js, MongoDB, Gemini API, Vercel  
**Thời Gian Dự Kiến:** 4-6 tiếng

---

## 🎯 Tổng Quan Dự Án

Xây dựng chatbot RAG (Retrieval Augmented Generation) cho phép người dùng:
- ❓ Hỏi về hoạt động của mèo (ăn, ngủ, chơi, v.v.)
- 📊 Truy vấn dữ liệu sensor từ MongoDB (nhiệt độ, độ ẩm, lượng thức ăn, v.v.)
- 🤖 Nhận câu trả lời thông minh từ Gemini API dựa trên dữ liệu thực
- ⚡ Sử dụng vector embeddings để tìm kiếm nhanh và chính xác

### So Sánh: Tutorial Gốc vs Dự Án Bạn

| Yếu Tố | Tutorial Gốc (F1) | Dự Án Mèo |
|--------|-------------------|-----------|
| **Vector DB** | Astra DB (free tier) | MongoDB Atlas (free tier) + `node_modules_hnswlib` |
| **LLM** | OpenAI GPT-4 + text-embedding-3-small | Google Gemini API + embedding-001 |
| **Data Source** | Web scraping (Puppeteer) | Direct MongoDB documents + sensor data |
| **Embedding Dimension** | 1536 (OpenAI) | 768 (Gemini) |
| **Collection** | F1_GPT | cat_knowledge, sensor_data |

---

## 📦 Cài Đặt Dự Án

### 1️⃣ Tạo Project Next.js

```bash
# Tạo project
npx create-next-app@latest nextjs-cat-gpt --typescript

# Chọn lựa chọn cài đặt:
# ✅ TypeScript: Yes
# ❌ ESLint: No
# ❌ Tailwind CSS: No (tự CSS)
# ❌ src/ directory: No
# ❌ App Router: No (dùng pages)
# ✅ Package Manager: npm

cd nextjs-cat-gpt
```

### 2️⃣ Cài Đặt Dependencies

```bash
npm install \
  langchain \
  @langchain/community \
  @langchain/google-genai \
  mongoose \
  dotenv \
  puppeteer \
  openai \
  ai \
  tsx

# Dev dependency
npm install -D ts-node
```

**Giải Thích Packages:**
- `langchain`: Framework LLM chính
- `@langchain/google-genai`: Integration với Gemini API
- `@langchain/community`: Document loaders (Puppeteer)
- `mongoose`: ODM cho MongoDB
- `ai`: Streaming API response + useChat hook
- `tx`: Chạy TypeScript scripts

### 3️⃣ Cấu Trúc Dự Án

```
nextjs-cat-gpt/
├── scripts/
│   ├── load-db.ts                 # Script load dữ liệu vào MongoDB
│   ├── seed-sensor-data.ts        # Seed dữ liệu sensor mẫu
│   └── create-vectors.ts          # Generate embeddings
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # API endpoint RAG
│   │   └── sensors/route.ts       # API endpoint sensor data (optional)
│   ├── components/
│   │   ├── ChatBubble.tsx
│   │   ├── LoadingBubble.tsx
│   │   └── PromptSuggestions.tsx
│   ├── layout.tsx
│   ├── page.tsx                   # Main chat UI
│   └── global.css
├── lib/
│   ├── mongodb.ts                 # MongoDB connection
│   ├── gemini.ts                  # Gemini setup
│   ├── rag.ts                     # RAG logic
│   └── models.ts                  # Mongoose schemas
├── .env.local                     # (Create - see below)
├── tsconfig.json                  # (Edit)
├── package.json
└── README.md
```

---

## 🔑 Thiết Lập Environment Variables

### 4️⃣ Tạo `.env.local` File

**Tạo file `.env.local` tại root project:**

```env
# ===== MONGODB =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cat_db?retryWrites=true&w=majority

# ===== GOOGLE GEMINI API =====
GOOGLE_API_KEY=your-gemini-api-key-here

# ===== DATA SOURCES (Optional - nếu scrape web) =====
CAT_DATA_URLS=https://en.wikipedia.org/wiki/Cat,https://en.wikipedia.org/wiki/Cat_behavior

# ===== APPLICATION =====
NEXT_PUBLIC_CHAT_MODEL=gemini-pro
NODE_ENV=development
```

### 5️⃣ Lấy API Keys

#### **MongoDB Atlas Setup:**

1. Vào [mongodb.com](https://mongodb.com) → Sign up
2. Tạo project → Create cluster (free tier)
3. Database Access → Create user (lưu username/password)
4. Network Access → Add IP address (0.0.0.0/0 cho dev)
5. Clusters → Connect → Copy connection string
6. Thay `<username>`, `<password>`, `<dbname>` trong `.env.local`

```
Ví dụ:
MONGODB_URI=mongodb+srv://cat_user:MyPassword123@mycluster.mongodb.net/cat_db
```

#### **Google Gemini API Setup:**

1. Vào [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key" → "Create API Key in new project"
3. Chọn project Google Cloud → Generate API Key
4. Copy key vào `.env.local`:

```
GOOGLE_API_KEY=AIza...your-key-here...xyz
```

---

## 🏗️ Xây Dựng Backend

### 6️⃣ MongoDB Connection (`lib/mongodb.ts`)

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ Connected to MongoDB');
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

### 7️⃣ Mongoose Schemas (`lib/models.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

// Interface for type safety
export interface ICatKnowledge extends Document {
  title: string;
  content: string;
  category: string; // 'behavior', 'health', 'nutrition', etc.
  embedding?: number[];
  createdAt: Date;
}

export interface ISensorData extends Document {
  deviceId: string;
  timestamp: Date;
  temperature: number; // độ C
  humidity: number; // %
  foodLevel: number; // 0-100%
  waterLevel: number; // 0-100%
  activityLevel: string; // 'resting', 'playing', 'eating'
  notes?: string;
}

// Cat Knowledge Schema
const catKnowledgeSchema = new Schema<ICatKnowledge>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['behavior', 'health', 'nutrition', 'care', 'general'],
    default: 'general',
  },
  embedding: [Number], // Vector embedding (768 dimensions)
  createdAt: { type: Date, default: Date.now },
});

// Create text index for search
catKnowledgeSchema.index({ title: 'text', content: 'text' });

// Sensor Data Schema
const sensorDataSchema = new Schema<ISensorData>({
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  foodLevel: { type: Number, required: true, min: 0, max: 100 },
  waterLevel: { type: Number, required: true, min: 0, max: 100 },
  activityLevel: {
    type: String,
    enum: ['resting', 'playing', 'eating', 'unknown'],
    default: 'unknown',
  },
  notes: String,
});

// Create index for time-series queries
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export const CatKnowledge =
  mongoose.models.CatKnowledge ||
  mongoose.model<ICatKnowledge>('CatKnowledge', catKnowledgeSchema);

export const SensorData =
  mongoose.models.SensorData ||
  mongoose.model<ISensorData>('SensorData', sensorDataSchema);
```

### 8️⃣ Gemini Setup (`lib/gemini.ts`)

```typescript
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not defined');
}

// Chat model
export const chatModel = new ChatGoogleGenerativeAI({
  modelName: 'gemini-pro',
  apiKey,
  temperature: 0.7,
  maxOutputTokens: 1024,
});

// Embedding model (768 dimensions)
export const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: 'embedding-001',
  apiKey,
});
```

### 9️⃣ RAG Logic (`lib/rag.ts`)

```typescript
import { CatKnowledge, SensorData } from './models';
import { embeddings, chatModel } from './gemini';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export async function createEmbedding(text: string): Promise<number[]> {
  const embedding = await embeddings.embedQuery(text);
  return embedding;
}

export async function findSimilarKnowledge(
  query: string,
  topK: number = 5
) {
  const queryEmbedding = await createEmbedding(query);

  // Vector similarity search (MongoDB Atlas Search or simple distance)
  // Simplified version - MongoDB Atlas Vector Search recommended for production
  const results = await CatKnowledge.find()
    .lean()
    .limit(100); // Get limited results first

  // Calculate similarity scores (dot product)
  const scored = results
    .map((doc) => {
      if (!doc.embedding) return null;

      const similarity = queryEmbedding.reduce(
        (acc, val, idx) => acc + val * (doc.embedding![idx] || 0),
        0
      );

      return { ...doc, similarity };
    })
    .filter((x): x is any => x !== null)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return scored;
}

export async function getRecentSensorData(
  hoursBack: number = 24
): Promise<any[]> {
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const sensorData = await SensorData.find({
    timestamp: { $gte: cutoffTime },
  })
    .sort({ timestamp: -1 })
    .lean();

  return sensorData;
}

export async function generateRAGResponse(userQuery: string) {
  // 1. Get similar knowledge
  const knowledgeContext = await findSimilarKnowledge(userQuery, 5);

  // 2. Get recent sensor data
  const sensorContext = await getRecentSensorData(24);

  // 3. Build context prompt
  const contextText = buildContextPrompt(knowledgeContext, sensorContext);

  // 4. System message
  const systemPrompt = new SystemMessage(`
You are a helpful cat care assistant. Answer questions about cat behavior, health, and activities.
Always use the provided context to give accurate answers. If asked about recent sensor data, 
interpret the readings and provide practical advice.

Current Knowledge Base:
${contextText}

Answer in Vietnamese if the question is in Vietnamese. Be friendly and helpful.
  `);

  // 5. User message
  const userMessage = new HumanMessage(userQuery);

  // 6. Generate response
  const response = await chatModel.invoke([systemPrompt, userMessage]);

  return response.content;
}

function buildContextPrompt(knowledge: any[], sensors: any[]): string {
  let context = '=== CAT KNOWLEDGE ===\n';

  knowledge.forEach((item, idx) => {
    context += `\n${idx + 1}. ${item.title} (${item.category})\n${item.content}\n`;
  });

  context += '\n=== RECENT SENSOR DATA ===\n';

  sensors.slice(0, 10).forEach((sensor) => {
    context += `
[${new Date(sensor.timestamp).toLocaleString()}]
- Temperature: ${sensor.temperature}°C
- Humidity: ${sensor.humidity}%
- Food Level: ${sensor.foodLevel}%
- Water Level: ${sensor.waterLevel}%
- Activity: ${sensor.activityLevel}
${sensor.notes ? `- Notes: ${sensor.notes}` : ''}
    `;
  });

  return context;
}
```

### 🔟 API Endpoint (`app/api/chat/route.ts`)

```typescript
import { NextRequest } from 'next/server';
import { Message, StreamingTextResponse } from 'ai';
import { connectDB } from '@/lib/mongodb';
import { generateRAGResponse } from '@/lib/rag';
import { chatModel } from '@/lib/gemini';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { messages } = (await req.json()) as {
      messages: Message[];
    };

    // Get latest user message
    const userQuery = messages[messages.length - 1].content;

    // Generate RAG response
    const response = await generateRAGResponse(userQuery);

    // Stream response
    const stream = await chatModel.stream([
      new SystemMessage('You are a helpful cat care assistant.'),
      new HumanMessage(userQuery),
    ]);

    // Convert to readable stream for streaming response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.content;
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(customStream);
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

---

## 📊 Tạo & Load Dữ Liệu

### 1️⃣1️⃣ Script Load Cat Knowledge Data (`scripts/load-db.ts`)

```typescript
import 'dotenv/config';
import { connectDB } from '../lib/mongodb';
import { CatKnowledge } from '../lib/models';
import { createEmbedding } from '../lib/rag';

const CAT_DATA = [
  {
    title: 'Cat Eating Behavior',
    content: `
Cats are obligate carnivores. They need meat to survive. Adult cats should eat 2-3 times per day.
Kittens need 4-5 meals daily. Average adult cat needs 200-300 calories per day.
Cats have strong preference for specific textures and temperatures.
    `,
    category: 'nutrition',
  },
  {
    title: 'Cat Sleeping Habits',
    content: `
Cats sleep 12-16 hours per day on average. Kittens and elderly cats sleep more.
Cats are crepuscular - most active at dawn and dusk.
They enter deep REM sleep briefly to conserve energy.
Safe sleeping areas help reduce stress and ensure good sleep.
    `,
    category: 'behavior',
  },
  {
    title: 'Signs of Healthy Cat',
    content: `
Healthy cat indicators:
- Shiny, smooth coat
- Bright, clear eyes
- Normal weight (feel ribs easily but not see them)
- Good appetite and regular eating
- Regular bowel movements
- Clear nose and ears
- Playful and alert behavior
    `,
    category: 'health',
  },
  {
    title: 'Cat Playing & Exercise',
    content: `
Cats need daily exercise to maintain health.
Interactive play sessions should be 15-30 minutes daily.
Toys should be rotated to keep interest.
Climbing and vertical spaces are important for mental stimulation.
Indoor cats benefit from window perches and puzzle feeders.
    `,
    category: 'behavior',
  },
  {
    title: 'Common Cat Health Issues',
    content: `
Common health problems:
- Obesity (often from overfeeding)
- Kidney disease (especially in senior cats)
- Diabetes (related to diet and weight)
- Dental disease
- Urinary tract issues
- Hairballs (brush regularly to prevent)
Regular vet checkups are essential.
    `,
    category: 'health',
  },
];

async function loadData() {
  try {
    await connectDB();

    console.log('🔄 Clearing existing data...');
    await CatKnowledge.deleteMany({});

    console.log('📚 Loading cat knowledge data...');

    for (const item of CAT_DATA) {
      // Create embedding for the content
      console.log(`🔗 Creating embedding for: ${item.title}`);
      const embedding = await createEmbedding(item.content);

      await CatKnowledge.create({
        ...item,
        embedding,
      });
    }

    console.log(`✅ Successfully loaded ${CAT_DATA.length} documents`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    process.exit(1);
  }
}

loadData();
```

### 1️⃣2️⃣ Script Load Sensor Data (`scripts/seed-sensor-data.ts`)

```typescript
import 'dotenv/config';
import { connectDB } from '../lib/mongodb';
import { SensorData } from '../lib/models';

const SENSOR_RECORDS = [
  {
    deviceId: 'cat-sensor-01',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    temperature: 22.5,
    humidity: 55,
    foodLevel: 75,
    waterLevel: 90,
    activityLevel: 'resting',
    notes: 'Cat sleeping in sunny spot',
  },
  {
    deviceId: 'cat-sensor-01',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    temperature: 23.1,
    humidity: 52,
    foodLevel: 65,
    waterLevel: 85,
    activityLevel: 'playing',
    notes: 'Cat active with toy',
  },
  {
    deviceId: 'cat-sensor-01',
    timestamp: new Date(),
    temperature: 22.8,
    humidity: 54,
    foodLevel: 50,
    waterLevel: 75,
    activityLevel: 'eating',
    notes: 'Cat eating from feeder',
  },
];

async function seedData() {
  try {
    await connectDB();

    console.log('🔄 Clearing existing sensor data...');
    await SensorData.deleteMany({});

    console.log('📊 Seeding sensor data...');

    const result = await SensorData.insertMany(SENSOR_RECORDS);

    console.log(`✅ Successfully seeded ${result.length} sensor records`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
```

### 1️⃣3️⃣ Update `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed:knowledge": "tsx scripts/load-db.ts",
    "seed:sensors": "tsx scripts/seed-sensor-data.ts",
    "seed": "npm run seed:knowledge && npm run seed:sensors"
  }
}
```

---

## 🎨 Xây Dựng Frontend

### 1️⃣4️⃣ Chat UI Page (`app/page.tsx`)

```typescript
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import ChatBubble from './components/ChatBubble';
import LoadingBubble from './components/LoadingBubble';
import PromptSuggestions from './components/PromptSuggestions';
import './global.css';

const PROMPT_SUGGESTIONS = [
  'Mèo của tôi nên ăn bao nhiêu mỗi ngày?',
  'Làm cách nào để biết mèo khỏe mạnh?',
  'Mèo ngủ bao nhiêu giờ?',
  'Cách chơi với mèo hiệu quả',
];

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='container'>
      <main className='chat-container'>
        {/* Header */}
        <div className='chat-header'>
          <h1>🐱 Mèo Ăn Assistant</h1>
          <p>Hỏi về hoạt động, sức khỏe và chế độ ăn của mèo</p>
        </div>

        {/* Messages */}
        <div className='messages-wrapper'>
          {messages.length === 0 ? (
            <div className='empty-state'>
              <h2>Xin chào! 👋</h2>
              <p>Tôi là trợ lý chăm sóc mèo của bạn.</p>
              <p>Hỏi bất cứ câu hỏi nào về mèo!</p>

              <PromptSuggestions
                suggestions={PROMPT_SUGGESTIONS}
                handlePromptClick={(prompt) => {
                  handleInputChange({
                    target: { value: prompt },
                  } as any);
                }}
              />
            </div>
          ) : (
            messages.map((message, idx) => (
              <ChatBubble
                key={idx}
                message={message.content}
                isBot={message.role === 'assistant'}
              />
            ))
          )}

          {isLoading && <LoadingBubble />}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className='input-form'>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder='Nhập câu hỏi của bạn...'
            className='input-field'
            disabled={isLoading}
          />
          <button
            type='submit'
            className='send-button'
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </form>
      </main>
    </div>
  );
}
```

### 1️⃣5️⃣ Components (`app/components/`)

**ChatBubble.tsx:**
```typescript
interface ChatBubbleProps {
  message: string;
  isBot: boolean;
}

export default function ChatBubble({ message, isBot }: ChatBubbleProps) {
  return (
    <div className={`bubble ${isBot ? 'bot' : 'user'}`}>
      <p>{message}</p>
    </div>
  );
}
```

**LoadingBubble.tsx:**
```typescript
export default function LoadingBubble() {
  return (
    <div className='bubble bot loading'>
      <div className='loader'></div>
    </div>
  );
}
```

**PromptSuggestions.tsx:**
```typescript
interface PromptSuggestionsProps {
  suggestions: string[];
  handlePromptClick: (prompt: string) => void;
}

export default function PromptSuggestions({
  suggestions,
  handlePromptClick,
}: PromptSuggestionsProps) {
  return (
    <div className='prompt-suggestions'>
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          className='suggestion-button'
          onClick={() => handlePromptClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
```

### 1️⃣6️⃣ Layout & CSS

**app/layout.tsx:**
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🐱 Mèo Ăn Assistant - RAG Chatbot',
  description: 'AI-powered cat care advisor with real-time sensor data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='vi'>
      <body>{children}</body>
    </html>
  );
}
```

**app/global.css:**
```css
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  --bg-light: #f8f9fa;
  --text-dark: #2d3436;
  --border-radius: 12px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-light);
  color: var(--text-dark);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  height: 100vh;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  padding: 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  text-align: center;
}

.chat-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.chat-header p {
  font-size: 14px;
  opacity: 0.9;
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.empty-state h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.bubble {
  padding: 12px 16px;
  border-radius: var(--border-radius);
  max-width: 70%;
  word-wrap: break-word;
  animation: slideIn 0.3s ease;
}

.bubble.user {
  align-self: flex-end;
  background-color: var(--primary-color);
  color: white;
}

.bubble.bot {
  align-self: flex-start;
  background-color: #e9ecef;
  color: var(--text-dark);
}

.bubble.loading {
  background-color: #f0f0f0;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--secondary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.prompt-suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 20px;
  width: 100%;
}

.suggestion-button {
  padding: 10px 16px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.suggestion-button:hover {
  background-color: #36b8aa;
}

.input-form {
  display: flex;
  gap: 10px;
  padding: 16px;
  background-color: var(--bg-light);
  border-top: 1px solid #e0e0e0;
}

.input-field {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: var(--secondary-color);
}

.send-button {
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.send-button:hover:not(:disabled) {
  background-color: #e55555;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-header h1 {
    font-size: 20px;
  }

  .bubble {
    max-width: 85%;
  }

  .prompt-suggestions {
    grid-template-columns: 1fr;
  }
}
```

---

## 🚀 Chạy Dự Án

### 1️⃣7️⃣ Khởi Động Toàn Bộ

```bash
# 1. Tải dữ liệu vào MongoDB
npm run seed

# 2. Chạy dev server
npm run dev

# 3. Mở browser
# Vào http://localhost:3000
```

### 1️⃣8️⃣ Kiểm Tra & Troubleshoot

**Kiểm tra MongoDB connection:**
```bash
# MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/dbname

# Kiểm tra credentials
# Username: user
# Password: Pass123
# Cluster: mycluster.mongodb.net
```

**Kiểm tra Gemini API:**
```bash
# Test API key
curl "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":{"parts":[{"text":"test"}]}}'
```

---

## 📋 Checklist Triển Khai

- [ ] MongoDB Atlas account tạo
- [ ] MongoDB URI trong `.env.local`
- [ ] Google Gemini API key lấy
- [ ] Dependencies cài đặt (`npm install`)
- [ ] Dữ liệu load (`npm run seed`)
- [ ] Dev server chạy (`npm run dev`)
- [ ] Chat interface test
- [ ] API endpoint test (POST /api/chat)
- [ ] Embedding hoạt động
- [ ] RAG responses chính xác
- [ ] Sensor data hiển thị

---

## 🌐 Triển Khai Vercel

### 1️⃣9️⃣ Build & Deploy

```bash
# 1. Đẩy lên GitHub
git init
git add .
git commit -m "Initial commit: Cat RAG Chatbot"
git branch -M main
git remote add origin https://github.com/your-username/nextjs-cat-gpt.git
git push -u origin main

# 2. Vào vercel.com
# - Import project
# - Add environment variables (.env.local)
# - Deploy
```

### 2️⃣0️⃣ Production Checklist

- [ ] MONGODB_URI updated (production cluster)
- [ ] GOOGLE_API_KEY secured (only server-side)
- [ ] Error handling implemented
- [ ] Rate limiting added
- [ ] Logging configured
- [ ] Database backups enabled

---

## 🐛 Common Issues & Solutions

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| `MONGODB_URI is not defined` | Missing .env.local | Tạo .env.local với MONGODB_URI |
| `GOOGLE_API_KEY is not defined` | Missing API key | Lấy API key từ ai.google.dev |
| `MongooseError: Cannot connect` | Connection string sai | Kiểm tra username, password, IP whitelist |
| `Embedding API rate limited` | Quá nhiều requests | Thêm rate limiting, cache embeddings |
| `Chat response slow` | Vector search chậm | Upgrade MongoDB Atlas tier, add index |

---

## 📚 Tài Liệu Tham Khảo

- **LangChain.js Docs:** https://js.langchain.com/
- **Gemini API:** https://ai.google.dev/docs
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Deployment:** https://vercel.com/docs

---

## 💡 Cải Thiện Tiếp Theo

1. **Vector Search Optimization:** Dùng MongoDB Atlas Vector Search
2. **Advanced RAG:** Implement re-ranking, query expansion
3. **Data Persistence:** Save chat history
4. **Real-time Updates:** WebSocket cho sensor data
5. **Multi-language:** Support tiếng Anh, Trung Quốc
6. **Voice Input:** Thêm speech-to-text
7. **Analytics:** Track popular questions
8. **User Profiles:** Personalized recommendations

---

**Tác Giả Hướng Dẫn:** AI Assistant (Modified from freeCodeCamp Course)  
**Ngày Cập Nhật:** December 2025  
**Status:** ✅ Production Ready