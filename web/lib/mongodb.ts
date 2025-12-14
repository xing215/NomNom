import mongoose from "mongoose";

// Type definitions
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Declare global type for mongoose cache
// to prevent multiple connections in development
declare global {
    var mongoose: MongooseCache | undefined;
}

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env"
    );
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
    // Return cached connection if exists
    if (cached.conn) {
        console.log("📦 Using cached MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log("🔄 Initiating MongoDB connection...");
        console.log(`📍 Connecting to: ${MONGODB_URI!.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`);

        cached.promise = mongoose
            .connect(MONGODB_URI!, opts)
            .then((mongoose) => {
                console.log("✅ MongoDB connected successfully");
                console.log(`📊 Database: ${mongoose.connection.name}`);
                console.log(`🔗 Host: ${mongoose.connection.host}`);
                console.log(`🚀 Ready state: ${mongoose.connection.readyState}`);
                return mongoose;
            })
            .catch((error) => {
                console.error("❌ MongoDB connection error:", error.message);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("❌ Failed to establish MongoDB connection");
        throw e;
    }

    return cached.conn;
}

// Log connection events
mongoose.connection.on("connected", () => {
    console.log("🟢 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("🔴 Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("🟡 Mongoose disconnected from MongoDB");
});

// Handle process termination
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("⚪ MongoDB connection closed due to app termination");
    process.exit(0);
});

export default connectDB;

