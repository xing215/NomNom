import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISensorData extends Document {
    deviceId: string;
    temperature: number;
    humidity: number;
    recordedAt: Date;
}

const SensorDataSchema: Schema<ISensorData> = new Schema(
    {
        deviceId: {
            type: String,
            required: [true, "Device ID is required"],
            trim: true,
            index: true,
        },
        temperature: {
            type: Number,
            required: [true, "Temperature is required"],
        },
        humidity: {
            type: Number,
            required: [true, "Humidity is required"],
            min: [0, "Humidity cannot be negative"],
            max: [100, "Humidity cannot exceed 100%"],
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
SensorDataSchema.index({ deviceId: 1, recordedAt: -1 });

const SensorData: Model<ISensorData> =
    mongoose.models.SensorData ||
    mongoose.model<ISensorData>("SensorData", SensorDataSchema);

export default SensorData;
