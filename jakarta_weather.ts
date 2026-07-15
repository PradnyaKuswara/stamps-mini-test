import 'dotenv/config';
import * as process from 'process';

interface WeatherItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

interface ForecastResponse {
  city: {
    name: string;
    country: string;
    timezone: number;
  };
  list: WeatherItem[];
}

async function getForecast() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error(
      'Error: OPENWEATHER_API_KEY environment variable is not defined in .env file.',
    );
    process.exit(1);
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=Jakarta,ID&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API returned status ${res.status}: ${errText}`);
    }

    const data = (await res.json()) as ForecastResponse;

    console.log(`Weather Forecast:`);

    const dailyForecasts: { [date: string]: WeatherItem } = {};

    for (const item of data.list) {
      const localTimeMs = (item.dt + data.city.timezone) * 1000;
      const dateStr = new Date(localTimeMs).toISOString().split('T')[0];
      const localHour = new Date(localTimeMs).getUTCHours();

      if (!dailyForecasts[dateStr]) {
        dailyForecasts[dateStr] = item;
      } else {
        const existingLocalHour = new Date(
          (dailyForecasts[dateStr].dt + data.city.timezone) * 1000,
        ).getUTCHours();
        if (Math.abs(localHour - 12) < Math.abs(existingLocalHour - 12)) {
          dailyForecasts[dateStr] = item;
        }
      }
    }

    // Sort dates and print the forecast for the next 5 days
    const sortedDates = Object.keys(dailyForecasts).sort().slice(0, 5);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    sortedDates.forEach((dateStr) => {
      const item = dailyForecasts[dateStr];
      const temp = item.main.temp;

      // Formatting date nicely
      const localTimeMs = (item.dt + data.city.timezone) * 1000;
      const dateObj = new Date(localTimeMs);
      const weekday = weekdays[dateObj.getUTCDay()];
      const day = dateObj.getUTCDate();
      const month = months[dateObj.getUTCMonth()];
      const year = dateObj.getUTCFullYear();

      const formattedDate = `${weekday}, ${day} ${month} ${year}`;

      console.log(`${formattedDate}: ${temp.toFixed(2)}°C`);
    });
  } catch (error: any) {
    console.error('Failed to retrieve weather data:', error.message);
  }
}

getForecast();
