import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema(
	{
		billId: {
			type: String,
			required: true,
		},
		createBy: {
			type: String,
		},
		billName: {
			type: String,
			required: true,
		},
		price: {
			type: String,
			default: '0',
		},
		payDate: {
			type: String,
			default: 'not yet',
		},
		dueDate: {
			type: String,
			deafault: 'no due date',
		},
		pendingBill: {
			type: Boolean,
		},
		donePay: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
);

const Bill = mongoose.model('Bill', BillSchema);

export default Bill;
