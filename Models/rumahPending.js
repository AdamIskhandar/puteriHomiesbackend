import mongoose from 'mongoose';

const RumahSchema = new mongoose.Schema(
	{
		payid: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		billName: {
			type: String,
		},
		userId: {
			type: String,
		},
		pendingBill: {
			type: Boolean,
		},
	},
	{ timestamps: true }
);

const Rumah = mongoose.model('RumahPending', RumahSchema);

export default Rumah;
