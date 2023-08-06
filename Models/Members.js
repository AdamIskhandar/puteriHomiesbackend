import mongoose from 'mongoose';
import { boolean } from 'webidl-conversions';

const MembersSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			max: 30,
			required: true,
		},
		password: {
			type: String,
			min: 6,
			required: true,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		notification: {
			type: Array,
			default: [],
		},
		profilePicture: {
			type: String,
			default: '',
		},
		desc: {
			type: String,
			default: '',
		},
		isPayAll: {
			type: Boolean,
			default: false,
		},
		bill: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
);

const Member = mongoose.model('Member', MembersSchema);

export default Member;
