import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBowlWeight extends Document {
    deviceId: string;
    weight: number; // Weight in grams
    recordedAt: Date;
}

const BowlWeightSchema: Schema<IBowlWeight> = new Schema(
    {
        deviceId: {
            type: String,
            required: [true, "Device ID is required"],
            trim: true,
            index: true,
        },
        weight: {
            type: Number,
            required: [true, "Weight is required"],
            min: [0, "Weight cannot be negative"],
        },
        recordedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries by device and time
BowlWeightSchema.index({ deviceId: 1, recordedAt: -1 });

const BowlWeight: Model<IBowlWeight> =
    mongoose.models.BowlWeight ||
    mongoose.model<IBowlWeight>("BowlWeight", BowlWeightSchema);

export default BowlWeight;
