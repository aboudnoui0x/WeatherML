# Import pandas and numpy libraries
import pandas as pd  # For data manipulation and DataFrame creation
import numpy as np   # For numerical operations and random number generation

# Set random seed for reproducibility (so results stay the same every time you run it)
np.random.seed(42)

# Define number of synthetic weather samples to generate
num_samples = 5000

# Generate random temperature values between 15°C and 45°C
temperature = np.random.randint(15, 45, num_samples)

# Generate random humidity values between 20% and 100%
humidity = np.random.randint(20, 100, num_samples)

# Generate random wind speed values between 0 and 30 km/h
wind_speed = np.random.randint(0, 30, num_samples)

# Initialize an empty list to store the weather labels (0 for Sunny, 1 for Rainy)
weather = []

# Loop over each sample and apply rules to classify the weather
for temp, hum, wind in zip(temperature, humidity, wind_speed):
    # Apply custom rules based on temperature, humidity, and wind speed
    if (temp < 30 and hum > 70 and wind > 10) or \
       (temp < 25 and hum > 80 and wind > 5) or \
       (temp < 20 and hum > 75 and wind > 5) or \
       (20 <= temp <= 30 and hum > 65 and 5 <= wind <= 10):
        weather.append(1)  # Label as Rainy
    else:
        weather.append(0)  # Label as Sunny

# Create a DataFrame with the generated data
df = pd.DataFrame({
    'Temperature': temperature,  # Column for temperature values
    'Humidity': humidity,        # Column for humidity values
    'WindSpeed': wind_speed,     # Column for wind speed values
    'Weather': weather           # Column for weather classification (0 or 1)
})

# Define the file path where the CSV will be saved
file_path = "F:\\weather.prediction.app\\WeatherPrediction.csv"

# Save the DataFrame to a CSV file (without row indices)
df.to_csv(file_path, index=False)

# Print confirmation message
print("✅ File has been saved with weather cases classified as sunny or rainy.")
