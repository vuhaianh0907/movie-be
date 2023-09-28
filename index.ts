import express, { Request, Response, Application } from 'express';
import authRoute from './src/api/authApi';
import cors from 'cors';

import dotenv from 'dotenv';
import yoga from './src/graphql';
dotenv.config();

const app: Application = express();
const port = 8000;

const ports = [];
for (let i = 3000; i <= 7999; i++) {
  ports.push(i);
}

const portsWithHttp = ports.map((port) => `http://localhost:${port}`);

app.use(
  cors({
    origin: portsWithHttp,
    credentials: true,
    exposedHeaders: ['Authorization'],
  })
);

app.use(express.json());

app.use('/api', authRoute);

app.use('/api/graphql', yoga);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
