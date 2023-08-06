import mongoose from 'mongoose';

const ApiSchema = new mongoose.Schema(
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

const Api = mongoose.model('ApiPending', ApiSchema);

export default Api;
