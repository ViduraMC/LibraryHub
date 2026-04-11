import mongoose from "mongoose";
const { Schema } = mongoose;

const BookSchema = new Schema(
    {
        bookId: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        grade: { type: String, required: true, trim: true },
        type: {
            type: String,
            required: true,
            enum: ['Textbook', 'Reference', 'Novel', 'Magazine', 'Pastpaper', 'Fictional', 'Other'],
            default: 'Textbook'
        },
        img: { type: String, trim: true },
        description: { type: String, trim: true },
        librarian: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        value: { type: Number, default: 0, min: 0 },
        totalCopies: { type: Number, default: 1, min: 0 },
        availableCopies: { type: Number, default: 1, min: 0 },
        pdf: { type: String, trim: true },
        available: { type: Boolean, default: true },
        tags: [{ type: String, trim: true }]
    },
    { timestamps: true }
);

// Keep `available` consistent with `availableCopies` and ensure availableCopies <= totalCopies
BookSchema.pre('save', async function () {
    if (typeof this.totalCopies === 'number' && typeof this.availableCopies === 'number') {
        if (this.availableCopies > this.totalCopies) this.availableCopies = this.totalCopies;
    } else if (typeof this.availableCopies !== 'number') {
        // ensure availableCopies has a sensible default when missing
        this.availableCopies = this.totalCopies || 0;
    }
    this.available = this.availableCopies > 0;
});

// Optional helper: update availability when totalCopies/availableCopies changes via updateOne/findOneAndUpdate/updateMany
BookSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], async function () {
    const update = this.getUpdate();
    if (!update) return;

    const set = update.$set || update;
    const total = (set.totalCopies !== undefined) ? set.totalCopies : undefined;
    const available = (set.availableCopies !== undefined) ? set.availableCopies : undefined;

    update.$set = update.$set || {};

    if (typeof available !== 'undefined' && typeof total !== 'undefined') {
        update.$set.availableCopies = Math.min(available, total);
    } else if (typeof available !== 'undefined') {
        update.$set.availableCopies = available;
    }
    // If only totalCopies changed we don't override availableCopies here (caller can supply both when appropriate)

    if (typeof update.$set.availableCopies !== 'undefined') {
        update.$set.available = update.$set.availableCopies > 0;
    }
});

// Text index for search — enables $text queries on name, author, bookId
BookSchema.index({ name: 'text', author: 'text', bookId: 'text' });

export default mongoose.model('Book', BookSchema);