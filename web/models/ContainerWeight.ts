import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContainerWeight extends Document {
    deviceId: string;
    weight: number; // Weight in grams
    recordedAt: Date;
}

const ContainerWeightSchema: Schema<IContainerWeight> = new Schema(
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
ContainerWeightSchema.index({ deviceId: 1, recordedAt: -1 });

const ContainerWeight: Model<IContainerWeight> =
    mongoose.models.ContainerWeight ||
    mongoose.model<IContainerWeight>("ContainerWeight", ContainerWeightSchema);

export default ContainerWeight;
