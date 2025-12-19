import { helpers, PredictionServiceClient } from '@google-cloud/aiplatform';

// Google Cloud configuration from environment variables
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '';
const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Lazy initialization
let _predictionClient: PredictionServiceClient | null = null;

// Get or create prediction client - pass credentials directly (no filesystem)
function getPredictionClient(): PredictionServiceClient {
    if (!_predictionClient) {
        _predictionClient = new PredictionServiceClient({
            apiEndpoint: `${location}-aiplatform.googleapis.com`,
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            projectId: projectId,
        });
    }
    return _predictionClient;
}

/**
 * Create vector embedding for text using Vertex AI embedding model
 */
export async function createEmbedding(text: string): Promise<number[]> {
    const client = getPredictionClient();

    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-004`;

    const instance = helpers.toValue({
        content: text,
        task_type: 'RETRIEVAL_DOCUMENT',
    });

    if (!instance) {
        throw new Error('Failed to convert text to protobuf value');
    }

    const request = {
        endpoint,
        instances: [instance],
    };

    const [response] = await Promise.resolve(client.predict(request));

    if (!response.predictions || response.predictions.length === 0) {
        throw new Error('No embedding returned from Vertex AI');
    }

    const prediction = helpers.fromValue(response.predictions[0] as any) as { embeddings?: { values?: number[] } } | null;
    if (!prediction || !prediction.embeddings || !prediction.embeddings.values) {
        throw new Error('Invalid embedding response structure from Vertex AI');
    }
    return prediction.embeddings.values;
}

// Export embeddings interface compatible with existing code
export const embeddings = {
    embedQuery: createEmbedding,
};

// Cleanup function - no-op since credentials are passed directly (no temp files)
export function cleanupCredentials() {
    // No cleanup needed - credentials are passed directly to client
}

// Export project and location for other modules
const project = projectId;
export { location, project };
