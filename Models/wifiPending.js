import mongoose from 'mongoose';

const WifiSchema = new mongoose.Schema(
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

const Wifi = mongoose.model('WifiPending', WifiSchema);

export default Wifi;
