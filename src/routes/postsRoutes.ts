import express from "express";
import core from "express";
import multer from 'multer';
import fs from 'fs';
import {ObjectId} from "mongodb";
import { Posts } from '../models/postsModel.js';
import gerarDescricaoComGemini from "serviceGemini.js";

function getFileExtension(fileName: string) {
	const nameSplitted = fileName.split('.');
	return nameSplitted[nameSplitted.length - 1];
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

const upload = multer({ dest: './uploads', storage });

export const routes = (app:core.Express) => {
	app.use(express.json());

	app.get('/posts/', async (req, res) => {
		res.status(200).json(await Posts.GetAllPosts());
	});

	app.post('/posts/', async (req, res) => {
		const { descricao, imgUrl, altImg } = req.body;

		try {
			const post = new Posts(descricao, imgUrl, altImg);
			res.status(201).json(await Posts.CreatePost(post));
		}
		catch (err:any) {
			console.error(err.message);
			res.status(400).json({ 'Erro': 'Falha na criação do post' });
		}
	});

	app.post('/upload', upload.single('image'), async (req, res) => {
		const fileExt = getFileExtension(req.file!.originalname!);

		if (fileExt == 'gif') {
			res.status(400).json({'Erro': 'Formato GIF não suportado'});
			return;
		}

		const data = {
			descricao: '',
			imgUrl: req.file!.originalname!,
			altImg: ''
		};
		try {
			const post = new Posts(data.descricao, data.imgUrl, data.altImg);
			const result = await Posts.CreatePost(post);

			const imageAtt = `uploads/${result.insertedId}.${fileExt}`;
			fs.renameSync(req.file!.path!, imageAtt);

			res.status(201).json(result);
		}
		catch (err: any) {
			console.error(err.message);
			res.status(400).json({'Erro': 'Falha na criação do post'});
		}
	});

	app.put('/upload/:id', async (req, res) => {
		const id = req.params.id;

		// procura em uploads arquivo q tenha o mesmo nome do id passado e pega a extensão
		const files = fs.readdirSync('uploads');
		const file = files.find(file => file.includes(id));
		const ext = getFileExtension(file!);

		const {altImg} = req.body;
		const imgUrl = `http://localhost:${process.env.SERVER_PORT}/${id}.${ext}`;

		try {
			const imageBuffer = fs.readFileSync(`uploads/${id}.${ext}`);
			const descricao = await gerarDescricaoComGemini(imageBuffer);
			console.log('descricao: ' + descricao);
			const post = new Posts(descricao, imgUrl, altImg, new ObjectId(id));
			res.status(201).json(await Posts.UpdatePost(post));
		}
		catch (err: any) {
			console.error(err.message);
			res.status(400).json({'Erro': 'Falha na criação do post'});
		}
	})
}
