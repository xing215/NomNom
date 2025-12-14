import mongoose, { Document, Model, Schema } from "mongoose";

export type FeedingType = "automatic" | "manual";

export interface IFeedingLog extends Document {
    deviceId: string;
    feedingType: FeedingType;
    amount: number; // Amount in grams
    feedingTime: Date; // Actual feeding time
    notes?: string;
}

const FeedingLogSchema: Schema<IFeedingLog> = new Schema(
    {
        deviceId: {
            type: String,
            required: [true, "Device ID is required"],
            trim: true,
            index: true,
        },
        feedingType: {
            type: String,
            enum: ["automatic", "manual"],
            required: [true, "Feeding type is required"],
        },
        amount: {
            type: Number,
            required: [true, "Feeding amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        feedingTime: {
            type: Date,
            default: Date.now,
            index: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, "Notes cannot exceed 500 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
FeedingLogSchema.index({ deviceId: 1, feedingTime: -1 });
FeedingLogSchema.index({ deviceId: 1, feedingType: 1, feedingTime: -1 });

const FeedingLog: Model<IFeedingLog> =
    mongoose.models.FeedingLog ||
    mongoose.model<IFeedingLog>("FeedingLog", FeedingLogSchema);

export default FeedingLog;
