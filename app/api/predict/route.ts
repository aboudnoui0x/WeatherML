import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const temperature = Number.parseFloat(formData.get("temperature") as string)
    const humidity = Number.parseFloat(formData.get("humidity") as string)
    const windSpeed = Number.parseFloat(formData.get("wind_speed") as string)

    // Validate inputs
    if (isNaN(temperature) || isNaN(humidity) || isNaN(windSpeed)) {
      return NextResponse.json({ error: "Invalid input values" }, { status: 400 })
    }

    if (temperature < -50 || temperature > 50) {
      return NextResponse.json({ error: "Temperature must be between -50 and 50°C" }, { status: 400 })
    }

    if (humidity < 0 || humidity > 100) {
      return NextResponse.json({ error: "Humidity must be between 0 and 100%" }, { status: 400 })
    }

    if (windSpeed < 0 || windSpeed > 100) {
      return NextResponse.json({ error: "Wind Speed must be between 0 and 100 km/h" }, { status: 400 })
    }

    // Simple prediction logic based on weather rules
    let sunnyProb = 0.5
    let rainyProb = 0.5

    // Apply weather rules
    if (temperature < 30 && humidity > 70 && windSpeed > 10) {
      rainyProb = 0.85
      sunnyProb = 0.15
    } else if (temperature < 25 && humidity > 80 && windSpeed > 5) {
      rainyProb = 0.8
      sunnyProb = 0.2
    } else if (temperature < 20 && humidity > 75 && windSpeed > 5) {
      rainyProb = 0.75
      sunnyProb = 0.25
    } else if (temperature >= 20 && temperature <= 30 && humidity > 65 && windSpeed >= 5 && windSpeed <= 10) {
      rainyProb = 0.7
      sunnyProb = 0.3
    } else {
      sunnyProb = 0.75
      rainyProb = 0.25
    }

    const prediction = rainyProb > sunnyProb ? "Rainy" : "Sunny"
    const confidence = Math.max(sunnyProb, rainyProb) * 100

    return NextResponse.json({
      result: prediction,
      confidence: `${confidence.toFixed(2)}%`,
      sunny: sunnyProb,
      rainy: rainyProb,
      temperature,
      humidity,
      windSpeed,
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
