import { helpers, PredictionServiceClient } from '@google-cloud/aiplatform';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

// Google Cloud configuration from environment variables
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '';
const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Lazy initialization
let _predictionClient: PredictionServiceClient | null = null;
let _credentialsPath: string | null = null;

// Create temporary service account JSON file
function createServiceAccountFile(): string {
    const serviceAccountJson = {
        type: 'service_account',
        project_id: projectId,
        private_key_id: 'key-1',
        private_key: privateKey,
        client_email: clientEmail,
        client_id: '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    };

    const credPath = join(process.cwd(), '.vertex-ai-credentials.json');
    writeFileSync(credPath, JSON.stringify(serviceAccountJson, null, 2));
    return credPath;
}

// Get or create prediction client
function getPredictionClient(): PredictionServiceClient {
    if (!_predictionClient) {
        // Create service account file if not exists
        if (!_credentialsPath || !existsSync(_credentialsPath)) {
            _credentialsPath = createServiceAccountFile();
        }

        // Set GOOGLE_APPLICATION_CREDENTIALS
        process.env.GOOGLE_APPLICATION_CREDENTIALS = _credentialsPath;

        _predictionClient = new PredictionServiceClient({
            apiEndpoint: `${location}-aiplatform.googleapis.com`,
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

// Cleanup function
export function cleanupCredentials() {
    if (_credentialsPath && existsSync(_credentialsPath)) {
        try {
            unlinkSync(_credentialsPath);
            _credentialsPath = null;
        } catch (error) {
            console.warn('Failed to cleanup credentials file:', error);
        }
    }
}

// Export project and location for other modules
const project = projectId;
export { location, project };
