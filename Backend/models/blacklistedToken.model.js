import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

// TTL index — MongoDB auto-deletes documents when expiresAt passes
// This keeps the collection clean without manual cleanup
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);

export default BlacklistedToken;
