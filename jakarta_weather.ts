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
    timezone: number; // Offset in seconds from UTC
  };
  list: WeatherItem[];
}

async function getForecast() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  console.log(process.env.OPENWEATHER_API_KEY);
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

    console.log(`Weather Forecast for Jakarta, ID (Next 5 Days):\n`);

    // Group the forecast entries by local date
    const dailyForecasts: { [date: string]: WeatherItem } = {};

    for (const item of data.list) {
      // Adjust timestamp using city timezone offset to get local time in Jakarta
      const localTimeMs = (item.dt + data.city.timezone) * 1000;
      // Format to YYYY-MM-DD in UTC relative to the adjusted timestamp to represent local date
      const dateStr = new Date(localTimeMs).toISOString().split('T')[0];
      const localHour = new Date(localTimeMs).getUTCHours(); // getUTCHours() gives local hours because of timezone shift

      if (!dailyForecasts[dateStr]) {
        dailyForecasts[dateStr] = item;
      } else {
        const existingLocalHour = new Date(
          (dailyForecasts[dateStr].dt + data.city.timezone) * 1000,
        ).getUTCHours();
        // Prefer hour closer to 12:00 local time
        if (Math.abs(localHour - 12) < Math.abs(existingLocalHour - 12)) {
          dailyForecasts[dateStr] = item;
        }
      }
    }

    // Sort dates and print the forecast for the next 5 days
    const sortedDates = Object.keys(dailyForecasts).sort().slice(0, 5);

    sortedDates.forEach((dateStr) => {
      const item = dailyForecasts[dateStr];
      const temp = item.main.temp;
      const weatherDesc = item.weather[0]?.description || 'N/A';

      // Formatting date nicely
      const localTimeMs = (item.dt + data.city.timezone) * 1000;
      const dateObj = new Date(localTimeMs);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      };
      const formattedDate = dateObj.toLocaleDateString('en-US', options);

      console.log(`${formattedDate}: ${temp.toFixed(1)}°C - ${weatherDesc}`);
    });
  } catch (error: any) {
    console.error('Failed to retrieve weather data:', error.message);
  }
}

getForecast();
