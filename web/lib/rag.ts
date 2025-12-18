import { BowlWeight, CatBeggingLog, ContainerWeight, FeedingLog, SensorData } from '@/models';
import CatKnowledge from '@/models/CatKnowledge';
import { embeddings } from './gemini';

/**
 * Create vector embedding for text using Vertex AI embedding model
 */
export async function createEmbedding(text: string): Promise<number[]> {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
}

/**
 * Find similar knowledge documents using vector similarity
 */
export async function findSimilarKnowledge(query: string, topK: number = 5) {
    try {
        const queryEmbedding = await createEmbedding(query);

        // Get all knowledge documents with embeddings
        const results = await CatKnowledge.find({ embedding: { $exists: true, $ne: [] } })
            .lean()
            .limit(100);

        if (results.length === 0) {
            return [];
        }

        // Calculate cosine similarity scores
        const scored = results
            .map((doc) => {
                if (!doc.embedding || doc.embedding.length === 0) return null;

                // Dot product for similarity (embeddings are normalized)
                const similarity = queryEmbedding.reduce(
                    (acc, val, idx) => acc + val * (doc.embedding![idx] || 0),
                    0
                );

                return { ...doc, similarity };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);

        return scored;
    } catch (error) {
        console.error('Error in findSimilarKnowledge:', error);
        return [];
    }
}

/**
 * Get recent feeding logs from MongoDB
 */
export async function getRecentFeedingData(hoursBack: number = 24): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const feedingData = await FeedingLog.find({
        feedingTime: { $gte: cutoffTime },
    })
        .sort({ feedingTime: -1 })
        .lean();

    return feedingData;
}

/**
 * Get recent sensor data (temperature, humidity)
 */
export async function getRecentSensorData(hoursBack: number = 24): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const sensorData = await SensorData.find({
        recordedAt: { $gte: cutoffTime },
    })
        .sort({ recordedAt: -1 })
        .lean();

    return sensorData;
}

/**
 * Get recent bowl weight data
 */
export async function getRecentBowlWeight(limit: number = 10): Promise<any[]> {
    const bowlData = await BowlWeight.find()
        .sort({ recordedAt: -1 })
        .limit(limit)
        .lean();

    return bowlData;
}

/**
 * Get recent container weight data
 */
export async function getRecentContainerWeight(limit: number = 5): Promise<any[]> {
    const containerData = await ContainerWeight.find()
        .sort({ recordedAt: -1 })
        .limit(limit)
        .lean();

    return containerData;
}

/**
 * Get recent cat begging events
 */
export async function getRecentBeggingLogs(hoursBack: number = 24): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const beggingData = await CatBeggingLog.find({
        detectedAt: { $gte: cutoffTime },
    })
        .sort({ detectedAt: -1 })
        .lean();

    return beggingData;
}

/**
 * Build context prompt from knowledge base and sensor data
 */
function buildContextPrompt(
    knowledge: any[],
    feedingData: any[],
    sensorData: any[],
    bowlWeight: any[],
    containerWeight: any[],
    beggingLogs: any[]
): string {
    let context = '=== KIẾN THỨC VỀ MÈO ===\n';

    if (knowledge.length > 0) {
        knowledge.forEach((item, idx) => {
            context += `\n${idx + 1}. ${item.title} (${item.category})\n${item.content}\n`;
        });
    } else {
        context += 'Chưa có dữ liệu kiến thức.\n';
    }

    context += '\n=== DỮ LIỆU CHO ĂN GẦN ĐÂY ===\n';
    if (feedingData.length > 0) {
        feedingData.slice(0, 10).forEach((feed) => {
            context += `[${new Date(feed.feedingTime).toLocaleString('vi-VN')}] - ${feed.feedingType}: ${feed.amount}g${feed.notes ? ` - ${feed.notes}` : ''}\n`;
        });
    } else {
        context += 'Chưa có dữ liệu cho ăn.\n';
    }

    context += '\n=== DỮ LIỆU CẢM BIẾN (NHIỆT ĐỘ, ĐỘ ẨM) ===\n';
    if (sensorData.length > 0) {
        sensorData.slice(0, 5).forEach((sensor) => {
            context += `[${new Date(sensor.recordedAt).toLocaleString('vi-VN')}] - Nhiệt độ: ${sensor.temperature}°C, Độ ẩm: ${sensor.humidity}%\n`;
        });
    } else {
        context += 'Chưa có dữ liệu cảm biến.\n';
    }

    context += '\n=== TRỌNG LƯỢNG THỨC ĂN TRONG BÁT ===\n';
    if (bowlWeight.length > 0) {
        const latestBowl = bowlWeight[0];
        context += `Trọng lượng hiện tại: ${latestBowl.weight}g (cập nhật: ${new Date(latestBowl.recordedAt).toLocaleString('vi-VN')})\n`;
    } else {
        context += 'Chưa có dữ liệu trọng lượng bát.\n';
    }

    context += '\n=== TRỌNG LƯỢNG THỨC ĂN TRONG HỘP CHỨA ===\n';
    if (containerWeight.length > 0) {
        const latestContainer = containerWeight[0];
        context += `Trọng lượng hiện tại: ${latestContainer.weight}g (cập nhật: ${new Date(latestContainer.recordedAt).toLocaleString('vi-VN')})\n`;
    } else {
        context += 'Chưa có dữ liệu hộp chứa.\n';
    }

    context += '\n=== HOẠT ĐỘNG XIN ĂN CỦA MÈO ===\n';
    if (beggingLogs.length > 0) {
        context += `Số lần xin ăn trong 24h qua: ${beggingLogs.length}\n`;
        beggingLogs.slice(0, 5).forEach((beg) => {
            context += `[${new Date(beg.detectedAt).toLocaleString('vi-VN')}] - Đã cho ăn: ${beg.triggered ? 'Có' : 'Không'}\n`;
        });
    } else {
        context += 'Chưa phát hiện hoạt động xin ăn.\n';
    }

    return context;
}

/**
 * Generate RAG context response for user query
 * Returns the context string to be used with Vertex AI in the API route
 */
export async function generateRAGResponse(userQuery: string): Promise<string> {
    // 1. Try to find similar knowledge from knowledge base (may fail if no embeddings)
    let knowledgeContext: any[] = [];
    try {
        knowledgeContext = await findSimilarKnowledge(userQuery, 5);
    } catch (embeddingError) {
        console.error('Embedding search skipped:', embeddingError);
    }

    // 2. Get recent data from all collections
    const [feedingData, sensorData, bowlWeight, containerWeight, beggingLogs] = await Promise.all([
        getRecentFeedingData(24),
        getRecentSensorData(24),
        getRecentBowlWeight(10),
        getRecentContainerWeight(5),
        getRecentBeggingLogs(24),
    ]);

    // 3. Build and return context prompt
    const contextText = buildContextPrompt(
        knowledgeContext,
        feedingData,
        sensorData,
        bowlWeight,
        containerWeight,
        beggingLogs
    );

    return contextText;
}
