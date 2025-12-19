import { VertexAIEmbeddings } from '@langchain/google-vertexai';

// Google Cloud configuration from environment variables
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '';
const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Lazy initialization to avoid build-time errors
let _embeddings: VertexAIEmbeddings | null = null;

// Embedding model using Vertex AI with service account credentials
export function getEmbeddings(): VertexAIEmbeddings {
    if (!_embeddings) {
        _embeddings = new VertexAIEmbeddings({
            model: 'text-embedding-004',
            location,
            authOptions: {
                projectId,
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey,
                },
            },
        });
    }
    return _embeddings;
}

// Export lazy-initialized instance for convenience
export const embeddings = {
    embedQuery: (text: string) => getEmbeddings().embedQuery(text),
};

// Export project and location for other modules
const project = projectId;
export { location, project };

