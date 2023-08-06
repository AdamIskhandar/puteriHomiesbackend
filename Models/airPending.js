import mongoose from 'mongoose';

const AirSchema = new mongoose.Schema(
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

const Air = mongoose.model('AirPending', AirSchema);

export default Air;
