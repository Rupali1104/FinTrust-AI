import os
from dotenv import load_dotenv
load_dotenv()

import os
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

import io
import requests
from google.cloud import vision

# Set environment variable for Google Vision API
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")  # Update with your actual path

# Initialize Google Vision client
client = vision.ImageAnnotatorClient()

# Load image file
file_path = "photos/11.jpg"  # Update with your image file name
with io.open(file_path, 'rb') as image_file:
    content = image_file.read()

# Create an image instance
image = vision.Image(content=content)

# Perform OCR
response = client.text_detection(image=image)
texts = response.text_annotations

# Extract text
if texts:
    detected_text = texts[0].description
    print("✅ Text extracted")
else:
    detected_text = ""
    print("❌ No text detected")

# Extract shop name and location (basic logic: first line = name, second = location)
lines = detected_text.split('\n')
shop_name = lines[0] if len(lines) > 0 else ""
location = lines[1] if len(lines) > 1 else ""

# Google Maps Places API setup
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")  # Replace with your API key
query = f"{shop_name} in {location}"
url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&key={API_KEY}"

# Make API call
response = requests.get(url)
data = response.json()

# Output based on result
if data['results']:
    print("✅ Shop found")
    print("Shop Name:", data['results'][0]['name'])
else:
    print("❌ Shop not found")