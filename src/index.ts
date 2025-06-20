import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { getWeatherData } from './weather';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req: Request, res: Response) => {
  res.send('Служба прогноза погоды работает');
});

app.get('/weather', async (req: Request, res: Response) => {
  const city = req.query.city as string;
  console.log(`[GET /weather] Получен запрос для города: ${city}`);

  if (!city) {
    console.warn(`[GET /weather] Город не указан`);
    res.status(400).json({ error: 'Параметр Город обязателен' });
    return;
  }

  try {
    const weather = await getWeatherData(city);
    console.log(`[GET /weather] Отправка данных о погоде для ${city}`);
    res.json(weather);
  } catch (e) {
    console.error(`[GET /weather] Error:`, e);
    res.status(500).json({ error: 'Не удалось получить данные о погоде.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});