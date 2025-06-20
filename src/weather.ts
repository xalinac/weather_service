import fetch from 'node-fetch';
import client from './redisClient';
import { getCoordinates } from './geocode';

const TTL = 60 * 15; // Time to live = 15

export async function getWeatherData(city: string) {
  const cacheKey = `weather:${city.toLowerCase()}`;
  console.log(`[weather] Проверка кэша для ${cacheKey}`);

  const cached = await client.get(cacheKey);
  if (cached) {
    console.log(`[weather] Кэш найден для ${city}`);
    return JSON.parse(cached);
  }

  console.log(`[weather] Нет кэша для ${city}, запрос API...`);
  console.log(`[geocode] Запрос координат для города: ${city}`);

  const { lat, lon } = await getCoordinates(city);
  console.log(`[geocode] Полученные координаты: lat=${lat}, lon=${lon}`);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`;

  const t0 = Date.now();
  const res = await fetch(url);
  const data = await res.json() as {
    hourly: {
      time: string[];
      temperature_2m: number[];
    };
  };
  const t1 = Date.now();
  console.log(`[weather] Open-Meteo API ответил за ${t1 - t0} мс`);

  const result = {
    city,
    hourly: data.hourly.time.map((t, i) => ({ time: t, temp: data.hourly.temperature_2m[i] }))
  };

  await client.setEx(cacheKey, TTL, JSON.stringify(result));
  console.log(`[weather] Данные о погоде для ${city} кэшированы с TTL ${TTL} секунд`);

  return result;
}