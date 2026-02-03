import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dateTime: { type: Date, required: true },
  venueName: String,
  venueAddress: String,
  city: { type: String, default: 'Sydney, Australia' },
  description: String,
  category: [String],
  imageUrl: String,
  sourceWebsite: String,
  originalUrl: { type: String, required: true },
  lastScrapedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['new', 'updated', 'inactive', 'imported'],
    default: 'new'
  },
  // for imported events
  importedAt: Date,
  importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  importNotes: String
}, { timestamps: true });

eventSchema.index({ city: 1 });
eventSchema.index({ dateTime: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ title: 'text', venueName: 'text', description: 'text' });

export default mongoose.model('Event', eventSchema);
