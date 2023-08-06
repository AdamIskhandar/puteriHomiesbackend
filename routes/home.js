import express from 'express';
import { v4 as uuidv4, v4 } from 'uuid';
import { verifyToken } from '../middleware/verifyToken.js';

import Bill from '../Models/Bills.js';
import Member from '../Models/Members.js';
import Wifi from '../Models/wifiPending.js';
import Rumah from '../Models/rumahPending.js';
import Api from '../Models/apiPending.js';
import Air from '../Models/airPending.js';

const router = express.Router();

// HOME
router.get('/', async (req, res) => {
	res
		.status(200)
		.json({ status: 'ok', message: 'welcome to puteri homies server..' });
});

// verifyUSer ✔
router.post('/verify', verifyToken, (req, res) => {
	res.status(200).json({ status: 'ok', message: 'okkk lepass' });
});

//FOR CREATE BILL - ADMIN ONLY => UI ✔
router.post('/uploadBill', verifyToken, async (req, res) => {
	const id = req.body.adminId;
	const billname = req.body.billName;
	const billprice = req.body.price;
	const billDate = req.body.billDate;
	const duedate = req.body.duedate;
	const pendingBill = req.body.pendingBill;

	try {
		const getAdmin = await Member.findById(id);

		if (getAdmin.isAdmin !== true)
			res.status(403).json({ status: 'error', message: 'bukan admin' });

		const billid = uuidv4();

		const bill = {
			billId: billid,
			createBy: getAdmin.username,
			billName: billname,
			price: billprice,
			payDate: billDate,
			dueDate: duedate,
			pendingBill: pendingBill,
		};

		const createBill = new Bill(bill);

		const saveBill = await createBill.save();

		const members = await Member.find({ isPayAll: false });

		for (let i = 0; i < members.length; i++) {
			await members[i].updateOne({
				$push: {
					bill: {
						billid: billid,
						payid: uuidv4(),
						billName: billname,
						billPrice: billprice,
						createdBy: getAdmin.username,
						isPayBill: false,
						isRejected: false,
						dueDate: duedate,
						pendingBill: pendingBill,
					},
				},
			});
		}

		if (saveBill) {
			return res
				.status(200)
				.json({ status: 'ok', message: 'Bill sudah di upload.' });
		}
	} catch (error) {
		console.log(error);
		return res.status(403).json({ status: 'error', message: error });
	}
});

// FOR SET MEMBER WHO HAS PAY ALL THE BILL
router.post('/setPayAll', verifyToken, async (req, res) => {
	const userID = req.body.userID;

	try {
		const getMember = await Member.findOne({ _id: userID });

		const donePayAll = [];
		const payAllBill = 4;

		for (let i = 0; i < getMember.bill.length; i++) {
			if (getMember.bill[i].isPayBill) {
				donePayAll.push(getMember.bill[i]);
			}
		}

		if (donePayAll.length == payAllBill) {
			const setMemberPayAll = await Member.findOneAndUpdate(
				{ _id: userID },
				{
					$set: {
						isPayAll: true,
					},
				}
			);
		} else {
			console.log('tak cukup 4 bill lagi bayar');
		}

		res.status(200).json({ status: 'ok', message: 'DONE SET.' });
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'FAIL SET.' });
	}
});

//FOR MEMBER HAS DONE PAY ALL BILL
router.post('/memberPaid', verifyToken, async (req, res) => {
	try {
		const getMember = await Member.find();

		let memberPaid = [];

		for (let i = 0; i < getMember.length; i++) {
			const res = await Member.findOne({
				_id: getMember[i]._id,
				isPayAll: true,
			});

			if (res !== null) {
				memberPaid.push(res);
			}
		}

		res
			.status(200)
			.json({ status: 'ok', message: 'DONE', memberPaidAll: memberPaid });
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error woi', message: 'FAIL' });
	}
});

// GET ALL BILL DATA FOR CURRENT USER
router.post('/member/:username', verifyToken, async (req, res) => {
	const userName = req.params.username;

	try {
		const memberBill = await Member.find({ username: userName });

		return res.status(200).json({
			status: 'ok',
			message: 'user data',
			userData: memberBill,
			memberBill: memberBill[0].bill,
		});
	} catch (error) {
		console.log(error);
		return res.status(403).json({ status: 'error', message: error });
	}
});

//DELETE BILL FOR ALL MEMBERS - ADMIN ONLY
router.post('/deleteBill/:billID', verifyToken, async (req, res) => {
	const billId = req.params.billID;
	const adminName = req.body.adminName;

	try {
		const memberBill = await Member.find();
		const allBill = await Bill.deleteMany({ createBy: adminName });

		// delete bill for user
		const getBill = await Promise.all(
			memberBill.map(async (member, i) => {
				return await Member.updateOne(
					{ _id: member._id, 'bill.billid': billId },
					{
						$pull: { bill: { billid: billId } },
					}
				);
			})
		);

		res.status(200).json({ status: 'ok', message: 'DONE DELETE..' });
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'FAIL PAYMENT' });
	}
});

// RESET THE PAYMENT MONTHLY FOR ALL MEMBERS - ADMIN ONLY
router.post('/resetPayment', verifyToken, async (req, res) => {
	const id = req.body.adminId;

	try {
		const getAdmin = await Member.findById(id);

		if (getAdmin.isAdmin !== true)
			res.status(403).json({ status: 'error', message: 'bukan admin' });

		const members = await Member.find({ isPayAll: true });

		for (let i = 0; i < members.length; i++) {
			await members[i].updateOne({
				$set: {
					isPayAll: false,
					bill: [],
				},
			});
		}

		res.status(200).json({
			ststus: 'ok',
			message: 'reset all payment member successfully.',
		});
	} catch (error) {
		res.status(403).json({ status: 'error', message: 'get error' });
	}
});

// FOR SET PENDING STATUS TO TRUE AFTER MEMBERS VERIFY BILL - MEMBER
router.post('/paybill/:payId', verifyToken, async (req, res) => {
	const id = req.body.userId;
	const payId = req.params.payId;

	try {
		const memberBill = await Member.findOneAndUpdate(
			{ _id: id, 'bill.payid': payId },
			{
				$set: {
					'bill.$.pendingBill': true,
				},
			}
		);

		res.status(200).json({ status: 'ok', message: 'DONE PAYMENT..' });
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'FAIL PAYMENT' });
	}
});

// FOR SEND WIFI PENDING TO WIFI DATABASE
router.post('/pendingBill/:payId', verifyToken, async (req, res) => {
	const payId = req.params.payId;
	const userName = req.body.username;
	const billname = req.body.billname;
	const userId = req.body.userId;

	try {
		if (billname == 'BIL WIFI') {
			const newWifiPending = {
				payid: payId,
				username: userName,
				billName: billname,
				userId,
				pendingBill: true,
			};

			const createPending = new Wifi(newWifiPending);

			const savePending = await createPending.save();

			if (savePending) {
				return res
					.status(200)
					.json({ status: 'ok', message: 'Wifi pending sudah di upload.' });
			}
		} else if (billname == 'BIL RUMAH') {
			const newRumahPending = {
				payid: payId,
				username: userName,
				billName: billname,
				userId,
				pendingBill: true,
			};

			const createPending = new Rumah(newRumahPending);

			const savePending = await createPending.save();

			if (savePending) {
				return res
					.status(200)
					.json({ status: 'ok', message: 'Rumah pending sudah di upload.' });
			}
		} else if (billname == 'BIL API') {
			const newRumahPending = {
				payid: payId,
				username: userName,
				billName: billname,
				userId,
				pendingBill: true,
			};

			const createPending = new Api(newRumahPending);

			const savePending = await createPending.save();

			if (savePending) {
				return res
					.status(200)
					.json({ status: 'ok', message: 'Api pending sudah di upload.' });
			}
		} else if (billname == 'BIL AIR') {
			const newRumahPending = {
				payid: payId,
				username: userName,
				billName: billname,
				userId,
				pendingBill: true,
			};

			const createPending = new Air(newRumahPending);

			const savePending = await createPending.save();

			if (savePending) {
				return res
					.status(200)
					.json({ status: 'ok', message: 'Api pending sudah di upload.' });
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(403).json({ status: 'error', message: error });
	}
});

// FOR GET USER HAVE PENDING BILL- MEMBER - WIFI
router.post('/getUserPending', verifyToken, async (req, res) => {
	try {
		const getAllMember = await Member.find();

		res
			.status(200)
			.json({ status: 'ok', message: 'DONE', allMember: getAllMember });
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'FAIL PAYMENT' });
	}
});

// FOR GET ALL DATA PENDING STATUS  - MEMBER
router.post('/getUserPending/:billType', verifyToken, async (req, res) => {
	const bilType = req.params.billType;

	try {
		const dataPending = [];

		if (bilType == 'BILWIFI') {
			const getBillPending = await Wifi.find();

			if (getBillPending) {
				for (let i = 0; i < getBillPending.length; i++) {
					dataPending.push(getBillPending[i]);
				}
			}
		}
		if (bilType == 'BILRUMAH') {
			const getBillPending = await Rumah.find();

			if (getBillPending) {
				for (let i = 0; i < getBillPending.length; i++) {
					dataPending.push(getBillPending[i]);
				}
			}
		}
		if (bilType == 'BILAPI') {
			const getBillPending = await Api.find();

			if (getBillPending) {
				for (let i = 0; i < getBillPending.length; i++) {
					dataPending.push(getBillPending[i]);
				}
			}
		}
		if (bilType == 'BILAIR') {
			const getBillPending = await Air.find();

			if (getBillPending) {
				for (let i = 0; i < getBillPending.length; i++) {
					dataPending.push(getBillPending[i]);
				}
			}
		}

		res.status(200).json({
			status: 'ok',
			message: 'DONE PAYMENT..',
			billPending: dataPending,
		});
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'FAIL PAYMENT' });
	}
});

// FOR APPROVED  PENDING BILL - ADMIN
router.post('/approvedPending', verifyToken, async (req, res) => {
	const payID = req.body.payid;
	const userId = req.body.userId;
	const billName = req.body.billName;

	try {
		const memberBill = await Member.findOneAndUpdate(
			{ _id: userId, 'bill.payid': payID },
			{
				$set: {
					'bill.$.isPayBill': true,
					'bill.$.isRejected': false,
				},
			}
		);

		if (memberBill) {
			if (billName == 'BIL WIFI') {
				const deletePending = await Wifi.deleteOne({
					userId,
					payid: payID,
				});
			} else if (billName == 'BIL RUMAH') {
				const deletePending = await Rumah.deleteOne({
					userId,
					payid: payID,
				});
			} else if (billName == 'BIL API') {
				const deletePending = await Api.deleteOne({
					userId,
					payid: payID,
				});
			} else if (billName == 'BIL AIR') {
				const deletePending = await Air.deleteOne({
					userId,
					payid: payID,
				});
			}
		}

		res.status(200).json({
			status: 'ok',
			message: 'APPROVED PAYMENT',
		});
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'FAIL PAYMENT' });
	}
});
// FOR REJECT PENDING BILL - ADMIN
router.post('/rejectPending', verifyToken, async (req, res) => {
	const payID = req.body.payid;
	const userId = req.body.userId;
	const billName = req.body.billName;

	try {
		const memberBill = await Member.findOneAndUpdate(
			{ _id: userId, 'bill.payid': payID },
			{
				$set: {
					'bill.$.isPayBill': false,
					'bill.$.pendingBill': false,
					'bill.$.isRejected': true,
				},
			}
		);

		if (memberBill) {
			if (billName == 'BIL WIFI') {
				const deletePending = await Wifi.deleteOne({
					userId,
					payid: payID,
				});
			} else if (billName == 'BIL RUMAH') {
				const deletePending = await Rumah.deleteOne({
					userId,
					payid: payID,
				});
			} else if (billName == 'BIL API') {
				const deletePending = await Api.deleteOne({
					userId,
					payid: payID,
				});
			} else if (billName == 'BIL AIR') {
				const deletePending = await Air.deleteOne({
					userId,
					payid: payID,
				});
			}
		}

		res.status(200).json({
			status: 'ok',
			message: 'REJECT PAYMENT',
		});
	} catch (error) {
		console.log(error);
		res.status(403).json({ status: 'error', message: 'ERROR PAYMENT' });
	}
});

export default router;
