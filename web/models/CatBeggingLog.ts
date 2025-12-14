import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICatBeggingLog extends Document {
    deviceId: string;
    detectedAt: Date;
    triggered: boolean; // Whether feeding was triggered
}

const CatBeggingLogSchema: Schema<ICatBeggingLog> = new Schema(
    {
        deviceId: {
            type: String,
            required: [true, "Device ID is required"],
            trim: true,
            index: true,
        },
        detectedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        triggered: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries by device and time
CatBeggingLogSchema.index({ deviceId: 1, detectedAt: -1 });

const CatBeggingLog: Model<ICatBeggingLog> =
    mongoose.models.CatBeggingLog ||
    mongoose.model<ICatBeggingLog>("CatBeggingLog", CatBeggingLogSchema);

export default CatBeggingLog;
