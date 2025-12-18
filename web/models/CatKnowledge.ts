import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICatKnowledge extends Document {
    title: string;
    content: string;
    category: 'behavior' | 'health' | 'nutrition' | 'care' | 'general';
    embedding?: number[]; // Vector embedding (768 dimensions for Gemini)
    createdAt: Date;
}

const CatKnowledgeSchema: Schema<ICatKnowledge> = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Content is required"],
        },
        category: {
            type: String,
            enum: ['behavior', 'health', 'nutrition', 'care', 'general'],
            default: 'general',
        },
        embedding: {
            type: [Number],
            default: undefined,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Create text index for full-text search
CatKnowledgeSchema.index({ title: 'text', content: 'text' });

const CatKnowledge: Model<ICatKnowledge> =
    mongoose.models.CatKnowledge ||
    mongoose.model<ICatKnowledge>("CatKnowledge", CatKnowledgeSchema);

export default CatKnowledge;
