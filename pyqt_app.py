# Import required modules
import sys                  # Provides access to system-specific parameters and functions
import threading            # Used to run Flask in a separate thread
import time                 # Provides sleep function to delay startup

# Import PyQt5 modules for GUI
from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt5.QtWebEngineWidgets import QWebEngineView  # For displaying web pages inside the GUI
from PyQt5.QtCore import QUrl                        # To handle URLs

# Import waitress to run the Flask app as a production server
from waitress import serve

# Import the Flask app from app.py
from app import app

# Function to start the Flask app using waitress server
def run_flask():
    # Run Flask on localhost with port 5000
    serve(app, host='127.0.0.1', port=5000)

# Create the main PyQt application window
class WeatherApp(QMainWindow):
    def __init__(self):
        super().__init__()  # Call parent constructor

        # Set the title and dimensions of the window
        self.setWindowTitle("Weather Prediction App 🌦")
        self.setGeometry(200, 200, 1500, 600)  # x, y, width, height

        # Create a browser view to load the Flask web app
        self.browser = QWebEngineView()
        self.browser.setUrl(QUrl("http://127.0.0.1:5000"))  # Load the local Flask web server

        # Set up the layout and central widget
        central_widget = QWidget()
        layout = QVBoxLayout()
        layout.addWidget(self.browser)  # Add browser to layout
        central_widget.setLayout(layout)
        self.setCentralWidget(central_widget)  # Set the central widget in main window

# Function to start the PyQt GUI
def start_pyqt():
    time.sleep(1)  # Small delay to ensure Flask server starts before loading it in the GUI

    # Create the PyQt application instance
    app_qt = QApplication(sys.argv)

    # Create and show the main window
    window = WeatherApp()
    window.show()

    # Execute the Qt event loop
    sys.exit(app_qt.exec_())

# Entry point of the script
if __name__ == "__main__":
    # Start Flask server in a separate daemon thread so it doesn't block the GUI
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True  # Ensure thread exits when main program exits
    print("🚀 Starting Flask server...")
    flask_thread.start()

    start_pyqt()
