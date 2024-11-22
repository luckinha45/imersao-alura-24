import { MongoClient } from 'mongodb';

export async function connBD() {
	let client:MongoClient;
	let connStr:string = <string>process.env.BD_CONN_STR;

	try {
		client = new MongoClient(connStr);
		console.log('Conectando ao banco de dados...');
		await client.connect();
		console.log('Conectado ao banco de dados!');
		
		return client;
	}
	catch (err) {
		console.error('Falha na conexão com o MongoDB!', err);
		process.exit();
	}
}
