# app.py
from flask import Flask, render_template, jsonify
import sqlite3
import requests
from flask_migrate import Migrate
from models import db
import os  # Import the os module
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()  # Load environment variables from .env file

# Load the OpenCage API key from environment variable
OPENCAGE_API_KEY = os.getenv('OPENCAGE_API_KEY')  # Ensure this variable is set in your .env file
OPENCAGE_URL = 'https://api.opencagedata.com/geocode/v1/json'

# Configuration to enable or disable RapidAPI
USE_RAPIDAPI = os.getenv('USE_RAPIDAPI', 'true').lower() == 'true'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/israeli_football.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()  # Create database tables

FOOTBALL_API_KEY = os.getenv('FOOTBALL_API_KEY')
FOOTBALL_API_URL = "https://api-football-v1.p.rapidapi.com/v3/fixtures"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/players', methods=['GET'])
def get_players():
    # Connect to the SQLite database
    conn = sqlite3.connect('instance/israeli_football.db')  # Ensure the path is correct
    cursor = conn.cursor()

    # Query to fetch player data
    cursor.execute("""
        SELECT name, city, date_of_birth, team, country, games_played, goals, assists, position, player_number, image 
        FROM football_players
    """)
    players = cursor.fetchall()

    # Convert to a list of dictionaries
    player_data = []
    for player in players:
        city = player[1]
        lat, lng = get_lat_long(city)  # Get latitude and longitude
        player_data.append({
            'name': player[0],
            'city': city,
            'lat': lat,
            'lng': lng,
            'date_of_birth': player[2],
            'team': player[3],
            'country': player[4],
            'games_played': player[5],
            'goals': player[6],
            'assists': player[7],
            'position': player[8],
            'player_number': player[9],
            'image': player[10],  # Include the image URL
            'value': 0  # Placeholder for player value, adjust as needed
        })

    conn.close()
    return jsonify(player_data)

def get_lat_long(city):
    """Get latitude and longitude for a given city using OpenCage API."""
    try:
        response = requests.get(OPENCAGE_URL, params={
            'q': city,
            'key': OPENCAGE_API_KEY  # Use the API key from the environment variable
        })
        data = response.json()
        
        if data['results']:
            lat = data['results'][0]['geometry']['lat']
            lng = data['results'][0]['geometry']['lng']
            return lat, lng
        else:
            return 0, 0  # Default to 0 if no results found
    except Exception as e:
        return 0, 0  # Default to 0 on error

@app.route('/next_games/<player_id>', methods=['GET'])
def get_next_games(player_id):
    if not USE_RAPIDAPI:
        print('api disabled from .env file')
        return jsonify({"error": "RapidAPI usage is disabled."}), 403

    headers = {
        'x-rapidapi-host': "api-football-v1.p.rapidapi.com",
        'x-rapidapi-key': FOOTBALL_API_KEY
    }
    params = {
        'team': player_id,  # Assuming player_id corresponds to the team ID
        'next': 5  # Fetch the next 5 games
    }
    
    response = requests.get(FOOTBALL_API_URL, headers=headers, params=params)
    
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Unable to fetch data"}), response.status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)