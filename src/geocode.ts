import fetch from 'node-fetch';

type GeocodeResponse = {
  results?: Array<{
    latitude: number;
    longitude: number;
  }>;
};

export async function getCoordinates(city: string): Promise<{ lat: number, lon: number }> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
  console.log(`[geocode] Получение координат для города: ${city}`);
  const res = await fetch(url);
  const data = (await res.json()) as GeocodeResponse;

  if (!data.results || data.results.length === 0) {
    console.warn(`[geocode] Город не найден: ${city}`);
    throw new Error('Город не найден');
  }

  const { latitude, longitude } = data.results[0];
  console.log(`[geocode] Найдены координаты: lat=${latitude}, lon=${longitude}`);
  return { lat: latitude, lon: longitude };
}