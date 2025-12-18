import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import path from 'path';

// Set Google Application Credentials for Vertex AI
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), 'chrome-courage-480502-a2-cab2530ea221.json');
}

const project = process.env.GOOGLE_CLOUD_PROJECT || 'chrome-courage-480502-a2';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Lazy initialization to avoid build-time errors
let _embeddings: VertexAIEmbeddings | null = null;

// Embedding model using Vertex AI (no API key required, uses service account)
export function getEmbeddings(): VertexAIEmbeddings {
    if (!_embeddings) {
        _embeddings = new VertexAIEmbeddings({
            model: 'text-embedding-004',
            location,
        });
    }
    return _embeddings;
}

// Export lazy-initialized instance for convenience
export const embeddings = {
    embedQuery: (text: string) => getEmbeddings().embedQuery(text),
};

// Export project and location for other modules
export { location, project };

