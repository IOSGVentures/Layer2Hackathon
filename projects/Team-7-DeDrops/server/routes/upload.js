/*文件上传*/
const router = require('koa-router')();
const path = require('path');
const fs = require('fs');
const date = require("silly-datetime");
const utils = require('./tools/utils.js');
const config = require('../conf/config.js');

//单文件上传
router.post('/', async (ctx) => {

	let file = ctx.request.files.file

	let day = date.format(new Date(), 'YYYYMMDD');
	const fileReader = fs.createReadStream(file.path);
	const filePath = path.join(__dirname, '../static/upload/' + day + '/');

	// // 获取文件后缀
	let ext = file.name.split('.')
	let extName = ext[ext.length - 1]
	let fileName = utils.randoms(32) + '.' + extName;

	let sendDate = {}
	if (!fs.existsSync(filePath)) {
		fs.mkdir(filePath, (err) => {
			if (err) {
				throw new Error(err);
				sendDate = {
					code: 1003,
					message: '上传失败,请重试'
				};
			} else {

				let fileResource = filePath + `/${fileName}`;
				let writeStream = fs.createWriteStream(fileResource);
				fileReader.pipe(writeStream);

				sendDate = {
					imgurl: day + '/' + fileName,
					code: 0,
					message: '上传成功'
				};
			}
		});
	} else {
		let fileResource = filePath + `/${fileName}`;
		let writeStream = fs.createWriteStream(fileResource);
		fileReader.pipe(writeStream);
		sendDate = {
			imgurl: day + '/' + fileName,
			code: 0,
			message: '上传成功'
		};
	}
	ctx.body = sendDate
})

//单文件上传
router.post('/indexz', async (ctx) => {

	let file = ctx.request.files.file

	let day = date.format(new Date(), 'YYYYMMDD');
	const fileReader = fs.createReadStream(file.path);
	const filePath = path.join(__dirname, '../static/upload/' + day + '/');

	// // 获取文件后缀
	let ext = file.name.split('.')
	let extName = ext[ext.length - 1]
	let fileName = utils.randoms(32) + '.' + extName;

	let sendDate = {}
	if (!fs.existsSync(filePath)) {
		fs.mkdir(filePath, (err) => {
			if (err) {
				throw new Error(err);
				sendDate = {
					code: 1003,
					message: '上传失败,请重试'
				};
			} else {

				let fileResource = filePath + `/${fileName}`;
				let writeStream = fs.createWriteStream(fileResource);
				fileReader.pipe(writeStream);

				sendDate = {
					data: { "src": config.fliePath + day + '/' + fileName },
					imgurl: config.fliePath + day + '/' + fileName,
					code: 0,
					message: '上传成功'
				};
			}
		});
	} else {
		let fileResource = filePath + `/${fileName}`;
		let writeStream = fs.createWriteStream(fileResource);
		fileReader.pipe(writeStream);
		sendDate = {
			data: { "src": config.fliePath + day + '/' + fileName },
			imgurl: config.fliePath + day + '/' + fileName,
			code: 0,
			message: '上传成功'
		};
	}

	console.log(sendDate)
	ctx.body = sendDate
})

module.exports = router.routes();