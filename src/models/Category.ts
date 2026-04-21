import mongoose, { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
}, { timestamps: true });

// Prevent Mongoose model recompilation error in development
if (mongoose.models.Category) {
    delete mongoose.models.Category;
}

const Category = models.Category || model('Category', CategorySchema);

export default Category;
