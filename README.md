# City Weather App

A simple responsive weather web app built with **React + Vite** and deployed on **Vercel**.

It uses the free **Open-Meteo APIs** (no API key required):
- Geocoding API for city search
- Forecast API for current weather + 5-day forecast

## Features

- Search weather by city name
- Current conditions:
  - Temperature
  - Feels like temperature
  - Humidity
  - Wind speed
  - Weather condition
- 5-day forecast cards:
  - Day/date
  - Conditions
  - Min/max temperatures
  - Rain probability
- Responsive UI for desktop and mobile
- Error handling for missing city / failed requests

## Tech Stack

- React 19
- Vite 7
- Vanilla CSS
- Open-Meteo APIs

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/RostyslavDzhohola/weather-openmeteo.git
   cd weather-openmeteo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deployment (Vercel)

This project is deployed as a static Vite app.

Quick deploy with Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

If prompted:
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

## API References

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

## Notes

- No server/backend required.
- No API keys required.
- Forecast and current values are returned in local timezone (`timezone=auto`).
