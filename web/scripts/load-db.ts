import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import 'dotenv/config';
import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
}

if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not defined');
}

// Cat Knowledge Schema (inline for script)
const catKnowledgeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['behavior', 'health', 'nutrition', 'care', 'general'],
        default: 'general',
    },
    embedding: [Number],
    createdAt: { type: Date, default: Date.now },
});

const CatKnowledge = mongoose.models.CatKnowledge || mongoose.model('CatKnowledge', catKnowledgeSchema);

// Embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: 'embedding-001',
    apiKey: GOOGLE_API_KEY,
});

// Cat knowledge data
const CAT_DATA = [
    {
        title: 'Chế độ ăn của mèo',
        content: `
Mèo là động vật ăn thịt bắt buộc, cần protein động vật để tồn tại.
Mèo trưởng thành nên ăn 2-3 bữa mỗi ngày.
Mèo con cần 4-5 bữa nhỏ mỗi ngày.
Lượng calo trung bình: 200-300 calo/ngày cho mèo trưởng thành.
Mèo thích thức ăn có nhiệt độ vừa phải (không quá lạnh hoặc quá nóng).
Không nên cho mèo ăn quá nhiều một lúc để tránh béo phì.
        `,
        category: 'nutrition',
    },
    {
        title: 'Thói quen ngủ của mèo',
        content: `
Mèo ngủ trung bình 12-16 giờ mỗi ngày.
Mèo con và mèo già ngủ nhiều hơn.
Mèo hoạt động nhiều nhất vào lúc bình minh và hoàng hôn.
Giấc ngủ REM của mèo thường ngắn để bảo toàn năng lượng.
Nơi ngủ an toàn giúp mèo giảm căng thẳng.
Mèo thường thay đổi vị trí ngủ nhiều lần trong ngày.
        `,
        category: 'behavior',
    },
    {
        title: 'Dấu hiệu mèo khỏe mạnh',
        content: `
Các dấu hiệu mèo khỏe mạnh:
- Lông mượt, bóng
- Mắt sáng, trong
- Cân nặng bình thường (có thể sờ thấy xương sườn nhưng không nhìn thấy)
- Ăn uống đều đặn
- Đi vệ sinh đều đặn
- Mũi và tai sạch
- Hoạt bát, vui vẻ
- Hơi thở không hôi
        `,
        category: 'health',
    },
    {
        title: 'Hoạt động chơi đùa của mèo',
        content: `
Mèo cần vận động hàng ngày để duy trì sức khỏe.
Thời gian chơi tương tác: 15-30 phút mỗi ngày.
Nên thay đổi đồ chơi thường xuyên để mèo không chán.
Không gian leo trèo quan trọng cho sự kích thích tinh thần.
Mèo trong nhà cần được cung cấp các hoạt động giải trí như đồ chơi câu, bóng, v.v.
Puzzle feeder giúp kích thích trí não của mèo.
        `,
        category: 'behavior',
    },
    {
        title: 'Các vấn đề sức khỏe thường gặp',
        content: `
Các bệnh thường gặp ở mèo:
- Béo phì (do cho ăn quá nhiều)
- Bệnh thận (đặc biệt ở mèo già)
- Tiểu đường (liên quan đến chế độ ăn và cân nặng)
- Bệnh răng miệng
- Vấn đề đường tiết niệu
- Búi lông (chải lông thường xuyên để phòng ngừa)
Kiểm tra sức khỏe định kỳ rất quan trọng.
        `,
        category: 'health',
    },
    {
        title: 'Hành vi xin ăn của mèo',
        content: `
Mèo xin ăn là hành vi bình thường nhưng cần kiểm soát.
Nguyên nhân xin ăn:
- Đói thực sự
- Thói quen được nuông chiều
- Thiếu kích thích tinh thần
- Muốn sự chú ý của chủ
Giải pháp:
- Cho ăn theo lịch cố định
- Sử dụng máy cho ăn tự động như NomNom
- Tăng thời gian chơi với mèo
- Không đáp ứng khi mèo xin ăn ngoài giờ
        `,
        category: 'behavior',
    },
    {
        title: 'Nhiệt độ và độ ẩm phù hợp cho mèo',
        content: `
Nhiệt độ lý tưởng cho mèo: 20-25°C.
Mèo thích nơi ấm áp và có thể khó chịu khi nhiệt độ dưới 15°C.
Độ ẩm lý tưởng: 50-70%.
Độ ẩm quá thấp có thể gây khô da và lông.
Độ ẩm quá cao có thể gây các vấn đề về hô hấp.
Cần theo dõi nhiệt độ và độ ẩm trong nhà để đảm bảo môi trường thoải mái cho mèo.
        `,
        category: 'care',
    },
    {
        title: 'Máy cho mèo ăn tự động NomNom',
        content: `
NomNom là máy cho mèo ăn tự động thông minh:
- Kết nối IoT để theo dõi từ xa
- Cảm biến trọng lượng bát để biết mèo ăn bao nhiêu
- Cảm biến trọng lượng hộp chứa để biết còn bao nhiêu thức ăn
- Cảm biến nhiệt độ và độ ẩm
- Phát hiện mèo xin ăn bằng nhận diện hình ảnh
- Cho ăn tự động theo lịch hoặc theo yêu cầu
- Ứng dụng web để quản lý và theo dõi
Giúp chủ nuôi chăm sóc mèo dễ dàng hơn ngay cả khi vắng nhà.
        `,
        category: 'general',
    },
];

async function createEmbedding(text: string): Promise<number[]> {
    return await embeddings.embedQuery(text);
}

async function loadData() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('✅ Connected to MongoDB');

        console.log('🔄 Clearing existing cat knowledge data...');
        await CatKnowledge.deleteMany({});

        console.log('📚 Loading cat knowledge data...');

        for (const item of CAT_DATA) {
            console.log(`🔗 Creating embedding for: ${item.title}`);
            const embedding = await createEmbedding(item.content);

            await CatKnowledge.create({
                ...item,
                embedding,
            });
            console.log(`   ✓ Added: ${item.title}`);
        }

        console.log(`\n✅ Successfully loaded ${CAT_DATA.length} documents with embeddings`);

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error loading data:', error);
        process.exit(1);
    }
}

loadData();
