# Import essential libraries
import numpy as np
import pandas as pd
import pickle  # For saving the trained model and scaler
from sklearn.model_selection import train_test_split  # To split data into training and testing sets
from sklearn.preprocessing import StandardScaler  # To standardize features
from sklearn.linear_model import LogisticRegression  # Logistic Regression algorithm
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix  # Model evaluation metrics

# Load existing weather data from CSV file instead of generating new data
file_path = "WeatherPrediction.csv"
df = pd.read_csv(file_path)
print(f"Dataset loaded from {file_path}")


# Data cleaning step: fill any missing numerical values with the mean of their respective columns
df.fillna(df.mean(numeric_only=True), inplace=True)

# Remove outliers using the Interquartile Range (IQR) method
Q1 = df[['Temperature', 'Humidity', 'WindSpeed']].quantile(0.25)  # 25th percentile (Q1)
Q3 = df[['Temperature', 'Humidity', 'WindSpeed']].quantile(0.75)  # 75th percentile (Q3)
IQR = Q3 - Q1  # Calculate the IQR

# Filter out samples where any feature is outside the range [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
df = df[~((df[['Temperature', 'Humidity', 'WindSpeed']] < (Q1 - 1.5 * IQR)) |
          (df[['Temperature', 'Humidity', 'WindSpeed']] > (Q3 + 1.5 * IQR))).any(axis=1)]

# Separate features (X) and target variable (y)
X = df[['Temperature', 'Humidity', 'WindSpeed']]
y = df['Weather']

# Split data into training set (80%) and testing set (20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize features to have mean=0 and variance=1, which helps many ML models perform better
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # Fit scaler on training data and transform it
X_test_scaled = scaler.transform(X_test)        # Use the same scaler to transform test data

# Initialize and train the Logistic Regression model with balanced class weights
model = LogisticRegression(class_weight='balanced')
model.fit(X_train_scaled, y_train)  # Train the model on the scaled training data

# Save the trained model, scaler, and cleaned dataset in a pickle file for later use (e.g., in Flask app)
with open("model.pkl", "wb") as model_file:
    pickle.dump({"model": model, "scaler": scaler, "data": df}, model_file)

print("Model trained and saved as model.pkl!")

# Predict probabilities of the positive class (Rainy) for the test set
y_proba = model.predict_proba(X_test_scaled)[:, 1]  # Get probability for class "1" (Rainy)

# Evaluate model performance with different probability thresholds to convert probabilities into binary predictions
thresholds = [0.7, 0.6, 0.5]  # Different cutoffs for deciding if weather is rainy
for threshold in thresholds:
    y_pred = (y_proba >= threshold).astype(int)  # Convert probabilities to 0 or 1 based on threshold
    acc = accuracy_score(y_test, y_pred)         # Calculate accuracy
    prec = precision_score(y_test, y_pred, zero_division=0)  # Calculate precision
    rec = recall_score(y_test, y_pred, zero_division=0)      # Calculate recall
    cm = confusion_matrix(y_test, y_pred)        # Compute confusion matrix
    
    # Print evaluation metrics for each threshold
    print(f"\nThreshold = {threshold}:")
    print(f"Accuracy: {acc:.3f}")
    print(f"Precision: {prec:.3f}")
    print(f"Recall: {rec:.3f}")
    print("Confusion Matrix:")
    print(cm)
