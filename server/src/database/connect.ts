import mongoose from "mongoose";
import cluster from "cluster";

export async function connectDatabase() {
    const first = cluster.worker?.id == 1;

    try {
        await mongoose.connect(
            process.env.DATABASE_URI || "mongodb://database/civchess"
        );
        
        if (first) console.log("database connected successfully.");
    } catch (err) {
        if (!first) return;

        console.log("database connection failed:");
        console.log(err);
    }
}