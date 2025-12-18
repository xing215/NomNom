import connectDB from '@/lib/mongodb';
import { generateRAGResponse } from '@/lib/rag';
import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const maxDuration = 30;

// Set Google Application Credentials for Vertex AI
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), 'chrome-courage-480502-a2-cab2530ea221.json');
}

// Create Vertex AI provider with project and location from env
const vertex = createVertex({
    project: process.env.GOOGLE_CLOUD_PROJECT || 'chrome-courage-480502-a2',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function POST(req: NextRequest) {
    try {
        // Connect to MongoDB
        await connectDB();

        const { messages } = (await req.json()) as {
            messages: ChatMessage[];
        };

        // Get latest user message
        const userQuery = messages[messages.length - 1].content;

        // Generate RAG context-aware response
        let ragResponse: string;
        try {
            ragResponse = await generateRAGResponse(userQuery);
        } catch (ragError) {
            console.error('RAG Error (continuing without context):', ragError);
            ragResponse = 'Không có dữ liệu ngữ cảnh.';
        }

        // Use AI SDK with Google Vertex AI for streaming response
        const result = streamText({
            model: vertex('gemini-2.0-flash'),
            messages: [
                {
                    role: 'system',
                    content: `Bạn là trợ lý chăm sóc mèo thông minh của máy cho mèo ăn tự động NomNom. 
Dựa trên thông tin đã phân tích sau đây, hãy trả lời câu hỏi của người dùng một cách thân thiện và hữu ích.

=== THÔNG TIN ĐÃ PHÂN TÍCH ===
${ragResponse}
===

Trả lời bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin.`,
                },
                {
                    role: 'user',
                    content: userQuery,
                },
            ],
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
