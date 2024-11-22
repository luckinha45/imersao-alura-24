import {ObjectId, Collection, MongoClient} from "mongodb";


export class Posts {
	static collection: Collection;

	constructor(
		public descricao:string,
		public imgUrl:string,
		public altImg:string,
		public _id?:ObjectId,
	) {};

	public serialize() {
		return {
			descricao: this.descricao,
			imgUrl: this.imgUrl,
			altImg: this.altImg,
		};
	}
	
	static async GetAllPosts() {
		const docs = await Posts.collection.find({}).toArray();
		return docs.map(doc => new Posts(doc.descricao, doc.imgUrl, doc.altImg, doc._id));
	}

	static async GetPostById(id:string) {
		const doc = await Posts.collection.findOne({ _id: new ObjectId(id) });
		return new Posts(doc!.descricao, doc!.imgUrl, doc!.altImg, doc!._id);
	}

	static async CreatePost(post:Posts) {
		return await Posts.collection.insertOne(post.serialize());
	}

	static async UpdatePost(post:Posts) {
		return await Posts.collection.updateOne({ _id: post._id }, { $set: post.serialize() });
	}
}
