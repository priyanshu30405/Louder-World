import mongoose from 'mongoose';

const ticketInterestSchema = new mongoose.Schema({
  email: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  optIn: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('TicketInterest', ticketInterestSchema);
