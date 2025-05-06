from dotenv import load_dotenv
import os
import io
from google.cloud import vision
import requests

# Load from .env
load_dotenv()

# Set up Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")

# Read image
file_path = "photos/15.jpg"
with io.open(file_path, 'rb') as image_file:
    content = image_file.read()

# Vision API
client = vision.ImageAnnotatorClient()
image = vision.Image(content=content)
response = client.text_detection(image=image)
texts = response.text_annotations

if texts:
    lines = texts[0].description.split('\n')
    shop_name = lines[0] if len(lines) > 0 else ""
    location = lines[1] if len(lines) > 1 else ""
    print("✅ Text Extracted")

    # Check with Google Maps
    query = f"{shop_name} in {location}"
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&key={maps_api_key}"
    place_response = requests.get(url).json()

    if place_response["results"]:
        print("✅ Shop Found")
        print(f"Shop Name: {place_response['results'][0]['name']}")
    else:
        print("❌ Shop Not Found")

else:
    print("❌ No text extracted.")
