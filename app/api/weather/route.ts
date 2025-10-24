export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const selectCity = searchParams.get("selectCity") // New parameter to select a specific city

  try {
    let latitude: number
    let longitude: number
    let cityName: string
    let country: string

    if (city) {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`,
      )
      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        return Response.json({ success: false, error: "City not found" }, { status: 404 })
      }

      // If selectCity is provided, use that specific result
      let selectedResult
      if (selectCity) {
        selectedResult = geoData.results.find((r: any) => r.name === city && r.country === selectCity)
        if (!selectedResult) {
          selectedResult = geoData.results[0]
        }
      } else if (geoData.results.length > 1) {
        // Return list of cities for user to choose from
        const cities = geoData.results.map((r: any) => ({
          name: r.name,
          country: r.country,
          latitude: r.latitude,
          longitude: r.longitude,
          admin1: r.admin1 || "",
        }))
        return Response.json({ success: false, suggestions: cities, error: "Multiple cities found" }, { status: 300 })
      } else {
        selectedResult = geoData.results[0]
      }

      latitude = selectedResult.latitude
      longitude = selectedResult.longitude
      cityName = selectedResult.name
      country = selectedResult.country
    } else if (lat && lon) {
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lon)

      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "User-Agent": "WeatherPredictionApp/1.0",
          },
        },
      )
      const geoData = await geoResponse.json()
      cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Unknown"
      country = geoData.address?.country || "Unknown"
    } else {
      return Response.json({ success: false, error: "Missing parameters" }, { status: 400 })
    }

    // Fetch weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`,
    )
    const weatherData = await weatherResponse.json()

    const current = weatherData.current
    return Response.json({
      success: true,
      city: cityName,
      country: country,
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return Response.json({ success: false, error: "Failed to fetch weather data" }, { status: 500 })
  }
}
