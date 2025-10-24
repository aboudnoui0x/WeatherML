"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Wind, Droplets, Thermometer, ArrowRight, MapPin, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PredictionChart } from "@/components/prediction-chart"

interface CityOption {
  name: string
  country: string
  latitude: number
  longitude: number
  admin1: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")
  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    windSpeed: "",
  })
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null)
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [citySearch, setCitySearch] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [prediction, setPrediction] = useState<{
    result: string
    confidence: string
    sunny: number
    rainy: number
    temperature: number
    humidity: number
    windSpeed: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (navigator.geolocation) {
      setLocationLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
        },
        () => {
          setLocationLoading(false)
        },
      )
    }
  }, [])

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setCoordinates({ lat, lon })
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      const data = await response.json()
      if (data.success) {
        setFormData({
          temperature: data.temperature.toString(),
          humidity: data.humidity.toString(),
          windSpeed: data.windSpeed.toString(),
        })
        setLocation({ city: data.city, country: data.country })
      }
    } catch (err) {
      console.error("Error fetching weather:", err)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citySearch.trim()) return

    setLocationLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(citySearch)}`)
      const data = await response.json()

      if (data.success) {
        setCoordinates({ lat: data.latitude, lon: data.longitude })
        setFormData({
          temperature: data.temperature.toString(),
          humidity: data.humidity.toString(),
          windSpeed: data.windSpeed.toString(),
        })
        setLocation({ city: data.city, country: data.country })
        setCitySearch("")
        setCitySuggestions([])
        setShowSuggestions(false)
      } else if (data.suggestions && data.suggestions.length > 0) {
        setCitySuggestions(data.suggestions)
        setShowSuggestions(true)
      } else {
        setError(data.error || "City not found")
      }
    } catch (err) {
      setError("Error fetching weather data")
      console.error(err)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleSelectCity = async (city: CityOption) => {
    setLocationLoading(true)
    setError("")
    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city.name)}&selectCity=${encodeURIComponent(city.country)}`,
      )
      const data = await response.json()
      if (data.success) {
        setCoordinates({ lat: city.latitude, lon: city.longitude })
        setFormData({
          temperature: data.temperature.toString(),
          humidity: data.humidity.toString(),
          windSpeed: data.windSpeed.toString(),
        })
        setLocation({ city: data.city, country: data.country })
        setCitySearch("")
        setCitySuggestions([])
        setShowSuggestions(false)
      } else {
        setError("Failed to fetch weather for selected city")
      }
    } catch (err) {
      setError("Error fetching weather data")
      console.error(err)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPrediction(null)
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("temperature", formData.temperature)
      formDataObj.append("humidity", formData.humidity)
      formDataObj.append("wind_speed", formData.windSpeed)

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formDataObj,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Prediction failed")
        return
      }

      setPrediction(data)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">WeatherML</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "home" ? "text-blue-400" : "text-slate-400 hover:text-white"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab("predict")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "predict" ? "text-blue-400" : "text-slate-400 hover:text-white"
              }`}
            >
              Predict
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "about" ? "text-blue-400" : "text-slate-400 hover:text-white"
              }`}
            >
              About
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeTab === "home" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Predict Weather with{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Machine Learning
                </span>
              </h1>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Advanced ML model trained on thousands of weather patterns. Get accurate sunny or rainy predictions
                based on temperature, humidity, and wind speed.
              </p>
              <Button
                onClick={() => setActiveTab("predict")}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-lg font-semibold flex items-center gap-2"
              >
                Start Predicting <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <Thermometer className="w-8 h-8 text-orange-400 mb-2" />
                    <p className="text-slate-400 text-sm">Temperature</p>
                    <p className="text-white text-2xl font-bold">-50 to 50°C</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <Droplets className="w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-slate-400 text-sm">Humidity</p>
                    <p className="text-white text-2xl font-bold">0 to 100%</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 col-span-2">
                    <Wind className="w-8 h-8 text-cyan-400 mb-2" />
                    <p className="text-slate-400 text-sm">Wind Speed</p>
                    <p className="text-white text-2xl font-bold">0 to 100 km/h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Prediction Form */}
      {activeTab === "predict" && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Weather Prediction</h2>
            <p className="text-slate-400 mb-8">
              Enter weather parameters or search by city to get an instant prediction
            </p>

            <div className="mb-8 space-y-4">
              {location && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Current Location</p>
                    <p className="text-white font-semibold">
                      {location.city}, {location.country}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCitySearch} className="relative">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search by city name..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={locationLoading}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-6"
                  >
                    {locationLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Search"}
                  </Button>
                </div>

                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-slate-400 text-xs px-3 py-2 font-semibold">
                        {citySuggestions.length} cities found
                      </p>
                      {citySuggestions.map((city, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectCity(city)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded transition-colors text-white text-sm"
                        >
                          <div className="font-medium">{city.name}</div>
                          <div className="text-slate-400 text-xs">
                            {city.admin1 && `${city.admin1}, `}
                            {city.country}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="temperature" className="text-white mb-2 block">
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    type="number"
                    placeholder="-50 to 50"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="humidity" className="text-white mb-2 block">
                    Humidity (%)
                  </Label>
                  <Input
                    id="humidity"
                    name="humidity"
                    type="number"
                    placeholder="0 to 100"
                    value={formData.humidity}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="windSpeed" className="text-white mb-2 block">
                    Wind Speed (km/h)
                  </Label>
                  <Input
                    id="windSpeed"
                    name="windSpeed"
                    type="number"
                    placeholder="0 to 100"
                    value={formData.windSpeed}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-lg font-semibold rounded-lg"
              >
                {loading ? "Predicting..." : "Get Prediction"}
              </Button>
            </form>

            {prediction && (
              <div className="mt-12 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-900/50 border-slate-700 p-6">
                    <div className="flex items-center gap-4">
                      {prediction.result === "Sunny" ? (
                        <Cloud className="w-12 h-12 text-yellow-400" />
                      ) : (
                        <CloudRain className="w-12 h-12 text-blue-400" />
                      )}
                      <div>
                        <p className="text-slate-400 text-sm">Prediction</p>
                        <p className="text-white text-3xl font-bold">{prediction.result}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-slate-900/50 border-slate-700 p-6">
                    <p className="text-slate-400 text-sm mb-2">Confidence</p>
                    <p className="text-white text-3xl font-bold">{prediction.confidence}</p>
                  </Card>
                </div>

                <PredictionChart
                  sunnyProb={prediction.sunny}
                  rainyProb={prediction.rainy}
                  temperature={prediction.temperature}
                  humidity={prediction.humidity}
                  windSpeed={prediction.windSpeed}
                />

                {coordinates && (
                  <div className="mt-12">
                    <h3 className="text-2xl font-bold text-white mb-4">Live Weather Map</h3>
                    <Card className="bg-slate-900/50 border-slate-700 p-0 overflow-hidden">
                      <iframe
                        src={`https://embed.windy.com/embed2.html?lat=${coordinates.lat}&lon=${coordinates.lon}&zoom=6&level=surface&overlay=temperature`}
                        width="100%"
                        height="600"
                        frameBorder="0"
                        className="w-full rounded-lg"
                        title="Live Weather Map"
                      ></iframe>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      {activeTab === "about" && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">About WeatherML</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                WeatherML is an advanced machine learning application that predicts weather conditions using Logistic
                Regression. Our model is trained on thousands of weather patterns to provide accurate predictions.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                The model analyzes three key weather parameters: temperature, humidity, and wind speed to determine
                whether conditions will be sunny or rainy with high confidence.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Accurate Predictions</h3>
                <p className="text-slate-400">High-accuracy ML model trained on diverse weather data</p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Wind className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Real-time Analysis</h3>
                <p className="text-slate-400">Instant predictions based on current weather parameters</p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Visual Insights</h3>
                <p className="text-slate-400">See how your input compares to training data</p>
              </Card>
            </div>

            <div className="border-t border-slate-700 pt-8 mt-12">
              <div className="text-center space-y-2">
                <p className="text-slate-500 text-sm">
                  Developed by{" "}
                  <span className="text-slate-400 font-medium">
                    Team AbdAllah Noui, Megueddem Yacine, and KHADRAOUI AYA
                  </span>
                </p>
                <p className="text-slate-500 text-sm">
                  Under supervision: <span className="text-slate-400 font-medium">Prof. OUAAR Hanane</span>
                </p>
                <p className="text-slate-500 text-sm">
                  <span className="text-slate-400 font-medium">University Mohamed Khider – Biskra</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400">
          <p>Developed for University Mohamed Khider – Biskra</p>
        </div>
      </footer>
    </div>
  )
}
