module.exports = function ({ models }) {
	const Currencies = models.use('Currencies');

	async function getAll(...data) {
		var where, attributes;
		for (const i of data) {
			if (typeof i != 'object') throw global.getText("currencies", "needObjectOrArray");
			if (Array.isArray(i)) attributes = i;
			else where = i;
		}
		try { return (await Currencies.findAll({ where, attributes })).map(e => e.get({ plain: true })) }
		catch (error) {
			console.error(error);
			throw new Error(error);
		};
	}

	async function getData(userID) {
		try {
			let data = await Currencies.findOne({ where: { userID }});
			
			// ✅ إذا لم يوجد، أنشئ حساب جديد تلقائياً
			if (!data) {
				console.log(`📝 [CURRENCY] إنشاء حساب جديد لـ ${userID}`);
				await Currencies.create({ 
					userID, 
					money: 1000,  // رصيد ابتدائي
					exp: 0,
					data: {}
				});
				data = await Currencies.findOne({ where: { userID }});
			}
			
			return data ? data.get({ plain: true }) : false;
		} 
		catch (error) {
			console.error('❌ [CURRENCY] خطأ في getData:', error);
			throw new Error(error);
		}
	}

	async function setData(userID, options = {}) {
		if (typeof options != 'object' && !Array.isArray(options)) throw global.getText("currencies", "needObject");
		try {
			const user = await Currencies.findOne({ where: { userID } });
			if (user) {
				await user.update(options);
				await user.save(); // ✅ الحفظ الفوري!
				console.log(`✅ [CURRENCY] حُفظت البيانات لـ ${userID}:`, options);
				return true;
			}
			return false;
		} 
		catch (error) {
			console.error('❌ [CURRENCY] خطأ في setData:', error);
			throw new Error(error);
		}
	}

	async function delData(userID) {
		try {
			(await Currencies.findOne({ where: { userID } })).destroy();
			return true;
		}
		catch (error) {
			console.error(error);
			throw new Error(error);
		}
	}

	async function createData(userID, defaults = {}) {
		if (typeof defaults != 'object' && !Array.isArray(defaults)) throw global.getText("currencies", "needObject");
		try {
			await Currencies.findOrCreate({ where: { userID }, defaults });
			return true;
		}
		catch (error) {
			console.error(error);
			throw new Error(error);
		}
	}

	async function increaseMoney(userID, money) {
		if (typeof money != 'number' || money < 0) throw new Error('المبلغ يجب أن يكون رقم موجب');
		try {
			const data = await getData(userID);
			const oldBalance = data.money || 0;
			const newBalance = oldBalance + money;
			
			await setData(userID, { money: newBalance });
			
			console.log(`💰 [CURRENCY] إضافة ${money} لـ ${userID} | ${oldBalance} → ${newBalance}`);
			return true;
		}
		catch (error) {
			console.error('❌ [CURRENCY] خطأ في increaseMoney:', error);
			throw new Error(error);
		}
	}

	async function decreaseMoney(userID, money) {
		if (typeof money != 'number' || money < 0) throw new Error('المبلغ يجب أن يكون رقم موجب');
		try {
			const data = await getData(userID);
			const currentBalance = data.money || 0;
			
			if (currentBalance < money) {
				console.log(`❌ [CURRENCY] رصيد غير كافٍ لـ ${userID}: ${currentBalance} < ${money}`);
				return false;
			}
			
			const newBalance = currentBalance - money;
			await setData(userID, { money: newBalance });
			
			console.log(`💸 [CURRENCY] خصم ${money} من ${userID} | ${currentBalance} → ${newBalance}`);
			return true;
		} catch (error) {
			console.error('❌ [CURRENCY] خطأ في decreaseMoney:', error);
			throw new Error(error);
		}
	}

	// ✅ دالة حفظ قاعدة البيانات بشكل دوري
	async function syncDatabase() {
		try {
			await Currencies.sync({ force: false });
			console.log('✅ [CURRENCY] تم مزامنة قاعدة البيانات');
			return true;
		} catch (error) {
			console.error('❌ [CURRENCY] خطأ في المزامنة:', error);
			return false;
		}
	}

	return {
		getAll,
		getData,
		setData,
		delData,
		createData,
		increaseMoney,
		decreaseMoney,
		syncDatabase
	};
};
