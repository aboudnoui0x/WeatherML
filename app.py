# Import necessary libraries
from flask import Flask, render_template, request, flash  # Flask modules for web app creation
import pickle  # For loading the pre-trained model
import numpy as np  # Numerical operations
import matplotlib.pyplot as plt  # Plotting library
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend for Matplotlib to generate plots without display
import io  # For in-memory image saving
import base64  # For encoding image to display in HTML
import pandas as pd  # Data handling with DataFrames
import sys  # To detect if running from PyInstaller
import os  # File path handling

# Determine base path depending on whether the app is compiled (frozen) using PyInstaller or not
if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS  # Temporary path used by PyInstaller
else:
    base_path = os.path.abspath(".")  # Use current directory when running normally

# Construct the full path to the saved model
model_path = os.path.join(base_path, "model.pkl")

# Load the model, scaler, and dataset for visualization from the pickle file
with open(model_path, "rb") as file:
    data = pickle.load(file)

model = data["model"]     # Trained Logistic Regression model
scaler = data["scaler"]   # Scaler used for input normalization
df = data["data"]         # Original dataset used for training (for visualization)

# Initialize the Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Used for flashing messages (error/info display)

# Define route for the welcome page (root URL)
@app.route('/')
def welcome():
    return render_template('welcome.html')  # Show welcome page

# Define route for the input form
@app.route('/form')
def form():
    return render_template('index.html')  # Show the form where user enters weather data

# Define route for making predictions based on form data
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input values from the submitted form
        temp = request.form['temperature']
        humidity = request.form['humidity']
        wind_speed = request.form['wind_speed']

        # Check if any of the fields are empty
        if not temp or not humidity or not wind_speed:
            flash("All fields must be filled.", 'error')  # Flash error message
            return render_template('index.html')  # Reload the form

        # Convert input strings to float
        temp = float(temp)
        humidity = float(humidity)
        wind_speed = float(wind_speed)

        # Validate the input values to be within realistic ranges
        if not (-50 <= temp <= 50):
            flash("Temperature must be between -50 and 50°C.", 'error')
            return render_template('index.html')
        if not (0 <= humidity <= 100):
            flash("Humidity must be between 0 and 100%.", 'error')
            return render_template('index.html')
        if not (0 <= wind_speed <= 100):
            flash("Wind Speed must be between 0 and 100 km/h.", 'error')
            return render_template('index.html')

        # Prepare the input as a DataFrame for prediction
        input_data = pd.DataFrame([[temp, humidity, wind_speed]],
                                  columns=["Temperature", "Humidity", "WindSpeed"])

        # Normalize the input using the same scaler used during training
        input_scaled = scaler.transform(input_data)

        # Make prediction using the trained model
        prediction = model.predict(input_scaled)[0]  # 0 for Sunny, 1 for Rainy
        probabilities = model.predict_proba(input_scaled)[0]  # Probabilities for each class

        sunny_percent = probabilities[0] * 100  # Confidence for Sunny
        rainy_percent = probabilities[1] * 100  # Confidence for Rainy

        # Plot the input against training data for visualization
        plt.figure(figsize=(6, 5))
        # Plot Sunny training samples (label 0)
        plt.scatter(df['Humidity'][df['Weather'] == 0], df['WindSpeed'][df['Weather'] == 0],
                    color='orange', label="Sunny")
        # Plot Rainy training samples (label 1)
        plt.scatter(df['Humidity'][df['Weather'] == 1], df['WindSpeed'][df['Weather'] == 1],
                    color='blue', label="Rainy")
        # Plot user's input
        plt.scatter(humidity, wind_speed, color='lime', s=150, edgecolors='black',
                    linewidths=2, label="Your Input", marker='*')

        # Set labels and title
        plt.xlabel('Humidity (%)')
        plt.ylabel('Wind Speed (km/h)')
        plt.title('Weather Prediction Visualization')
        plt.legend()
        plt.grid(True)

        # Save the plot to a byte stream and encode it for HTML
        img = io.BytesIO()
        plt.tight_layout()
        plt.savefig(img, format='png', bbox_inches='tight', transparent=True)
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()  # Encode image as base64
        plt.close()  # Close the plot to free memory

        # Determine final prediction text
        result_text = "Rainy" if prediction == 1 else "Sunny"

        # Render the result template with prediction data and plot
        return render_template('result.html',
                               result=result_text,
                               confidence=f"{max(sunny_percent, rainy_percent):.2f}%",
                               sunny=f"{sunny_percent:.2f}%",
                               rainy=f"{rainy_percent:.2f}%",
                               plot_url=plot_url)

    # Handle form errors (invalid numbers, etc.)
    except ValueError as ve:
        flash(f"Value error: {str(ve)}", 'error')
        return render_template('index.html')

    # Handle unexpected application errors
    except Exception as e:
        flash(f"Unexpected error: {str(e)}", 'error')
        return render_template('index.html')

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)  # Enable debug mode for development
