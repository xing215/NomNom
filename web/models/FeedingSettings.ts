import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFeedingSettings extends Document {
    deviceId: string;
    feedingInterval: number; // Interval in minutes between automatic feedings
    amountPerFeeding: number; // Amount in grams per feeding
    maxBowlCapacity: number; // Maximum weight in grams allowed in bowl
    isAutoFeedingEnabled: boolean;
    defaultTreatAmount: number; // Default treat amount in grams for manual feeding
    updatedAt: Date;
}

const FeedingSettingsSchema: Schema<IFeedingSettings> = new Schema(
    {
        deviceId: {
            type: String,
            required: [true, "Device ID is required"],
            unique: true,
            trim: true,
        },
        feedingInterval: {
            type: Number,
            required: [true, "Feeding interval is required"],
            min: [1, "Feeding interval must be at least 1 minute"],
            default: 360, // Default 6 hours (360 minutes)
        },
        amountPerFeeding: {
            type: Number,
            required: [true, "Amount per feeding is required"],
            min: [1, "Amount must be at least 1 gram"],
            default: 50, // Default 50 grams
        },
        maxBowlCapacity: {
            type: Number,
            required: [true, "Max bowl capacity is required"],
            min: [1, "Max capacity must be at least 1 gram"],
            default: 100, // Default 100 grams
        },
        isAutoFeedingEnabled: {
            type: Boolean,
            default: true,
        },
        defaultTreatAmount: {
            type: Number,
            required: [true, "Default treat amount is required"],
            min: [1, "Treat amount must be at least 1 gram"],
            default: 25, // Default 25 grams for treats
        },
    },
    {
        timestamps: true,
    }
);

const FeedingSettings: Model<IFeedingSettings> =
    mongoose.models.FeedingSettings ||
    mongoose.model<IFeedingSettings>("FeedingSettings", FeedingSettingsSchema);

export default FeedingSettings;
