import connectDB from '@/lib/mongodb';
import { generateRAGResponse } from '@/lib/rag';
import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

// Google Cloud configuration from environment variables
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '';
const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Create Vertex AI provider with service account credentials
const vertex = createVertex({
    project: projectId,
    location: location,
    googleAuthOptions: {
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
    },
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
