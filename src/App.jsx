import { useEffect, useState } from 'react'
import './App.css'

const WEATHER_CODE_MAP = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Moderate drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  56: { label: 'Light freezing drizzle', icon: '🌧️' },
  57: { label: 'Dense freezing drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌦️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Light freezing rain', icon: '🌧️' },
  67: { label: 'Heavy freezing rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  73: { label: 'Moderate snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Moderate rain showers', icon: '🌧️' },
  82: { label: 'Violent rain showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

const DEFAULT_CITY = 'Kyiv'

function weatherMeta(code) {
  return WEATHER_CODE_MAP[code] ?? { label: 'Unknown conditions', icon: '🌡️' }
}

function formatDay(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateValue))
}

async function fetchWeatherByCity(city) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  const geocodeResponse = await fetch(geocodeUrl)

  if (!geocodeResponse.ok) {
    throw new Error('Could not find that city. Please try another search.')
  }

  const geocodeData = await geocodeResponse.json()
  const location = geocodeData?.results?.[0]

  if (!location) {
    throw new Error('No matching city found. Try a different name.')
  }

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto`

  const forecastResponse = await fetch(forecastUrl)

  if (!forecastResponse.ok) {
    throw new Error('Weather service is unavailable right now. Please retry in a moment.')
  }

  const weather = await forecastResponse.json()

  return {
    location,
    weather,
  }
}

function App() {
  const [query, setQuery] = useState(DEFAULT_CITY)
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadWeather = async (city) => {
    if (!city.trim()) {
      setError('Please enter a city name.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await fetchWeatherByCity(city.trim())
      setLocation(data.location)
      setWeather(data.weather)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while loading weather data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeather(DEFAULT_CITY)
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    loadWeather(query)
  }

  const forecastDays =
    weather?.daily?.time?.map((day, index) => ({
      day,
      weatherCode: weather.daily.weather_code[index],
      maxTemp: weather.daily.temperature_2m_max[index],
      minTemp: weather.daily.temperature_2m_min[index],
      rainChance: weather.daily.precipitation_probability_max[index],
    })) ?? []

  const currentMeta = weatherMeta(weather?.current?.weather_code)

  return (
    <main className="app-shell">
      <section className="weather-app" aria-busy={loading}>
        <header className="app-header">
          <h1>City Weather</h1>
          <p>Current conditions and 5-day forecast powered by Open-Meteo.</p>
        </header>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="city-input" className="sr-only">
            Search city
          </label>
          <input
            id="city-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city (e.g., London, Kyiv, Tokyo)"
            autoComplete="off"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {weather && location && !error && (
          <>
            <section className="current-card">
              <div>
                <p className="location-name">
                  {location.name}, {location.country}
                </p>
                <p className="timezone">Timezone: {weather.timezone}</p>
              </div>

              <div className="current-main">
                <span className="weather-icon" aria-hidden="true">
                  {currentMeta.icon}
                </span>
                <p className="temperature">
                  {Math.round(weather.current.temperature_2m)}
                  {weather.current_units.temperature_2m}
                </p>
              </div>

              <p className="weather-label">{currentMeta.label}</p>

              <div className="current-details">
                <p>
                  Feels like: <strong>{Math.round(weather.current.apparent_temperature)}{weather.current_units.apparent_temperature}</strong>
                </p>
                <p>
                  Humidity: <strong>{weather.current.relative_humidity_2m}{weather.current_units.relative_humidity_2m}</strong>
                </p>
                <p>
                  Wind: <strong>{Math.round(weather.current.wind_speed_10m)} {weather.current_units.wind_speed_10m}</strong>
                </p>
              </div>
            </section>

            <section className="forecast-grid" aria-label="5-day forecast">
              {forecastDays.map((item) => {
                const meta = weatherMeta(item.weatherCode)

                return (
                  <article className="forecast-card" key={item.day}>
                    <p className="forecast-day">{formatDay(item.day)}</p>
                    <p className="forecast-icon" aria-hidden="true">
                      {meta.icon}
                    </p>
                    <p className="forecast-label">{meta.label}</p>
                    <p className="forecast-temp">
                      {Math.round(item.maxTemp)}° / {Math.round(item.minTemp)}°
                    </p>
                    <p className="forecast-rain">Rain: {item.rainChance}%</p>
                  </article>
                )
              })}
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default App
