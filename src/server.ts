import  express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connBD } from './dbConfig.js';
import { Posts } from './models/postsModel.js';
import { routes } from './routes/postsRoutes.js';

// CONFIG CORS
const corsOptions = {
	origin: 'http://localhost:8000',
	optionsSuccessStatus: 200
}

dotenv.config();

const client = await connBD();
const app = express();
app.use(express.static('uploads'));
app.use(cors(corsOptions));
 
// CONFIGURAÇÃO DAS COLLECTIONS DAS MODELS
Posts.collection = client.db(process.env.BD_NAME).collection('posts');


// ROTAS
routes(app);

app.listen(process.env.SERVER_PORT, () => {
	console.log('Server running on localhost:3000');
});
