import express from 'express';
import cors from 'cors';
import { config } from './core/config';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'node-backend' });
});

app.listen(config.NODE_PORT, () => {
    console.log(`Node backend running on port ${config.NODE_PORT}`);
});