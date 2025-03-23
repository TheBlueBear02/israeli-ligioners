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

@app.route('/next_games/<team_name>', methods=['GET'])
def get_next_games(team_name):
    if not USE_RAPIDAPI:
        print('API disabled from .env file')
        return jsonify({"error": "RapidAPI usage is disabled."}), 403

    headers = {
        "X-RapidAPI-Key": FOOTBALL_API_KEY,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    }

    # Step 1: Get team ID from team name
    team_url = "https://api-football-v1.p.rapidapi.com/v3/teams"
    team_response = requests.get(team_url, headers=headers, params={"search": team_name})
    
    if team_response.status_code != 200:
        return jsonify({"error": "Failed to fetch team data"}), team_response.status_code

    team_data = team_response.json()

    if not team_data["response"]:
        return jsonify({"error": "No team found with that name"}), 404

    selected_team = None
    for team in team_data["response"]:
        team_name_clean = team["team"]["name"].lower()
        if "women" not in team_name_clean and "w" not in team_name_clean:
            selected_team = team
            break

    if not selected_team:
        return jsonify({"error": "Only women's team found, no men's team available"}), 404

    team_id = selected_team["team"]["id"]
    print("Team ID:", team_id)

    # Step 2: Get next games for the team
    fixtures_url = "https://api-football-v1.p.rapidapi.com/v3/fixtures"
    fixtures_response = requests.get(fixtures_url, headers=headers, params={"team": str(team_id), "next": "2"})
    
    if fixtures_response.status_code != 200:
        return jsonify({"error": "Failed to fetch fixtures"}), fixtures_response.status_code

    fixtures_data = fixtures_response.json()

    if not fixtures_data["response"]:
        return jsonify({"message": "No upcoming games found for this team"}), 200

    # Step 3: Fetch player images for the teams
    player_images = {}
    for match in fixtures_data["response"]:
        home_team_id = match["teams"]["home"]["id"]
        away_team_id = match["teams"]["away"]["id"]

        # Fetch players for home team
        players_response = requests.get(f"https://api-football-v1.p.rapidapi.com/v3/players", headers=headers, params={"team": home_team_id})
        if players_response.status_code == 200:
            players_data = players_response.json()
            if players_data["response"]:
                player_images[home_team_id] = players_data["response"][0]["player"]["photo"]  # Get the first player's image

        # Fetch players for away team
        players_response = requests.get(f"https://api-football-v1.p.rapidapi.com/v3/players", headers=headers, params={"team": away_team_id})
        if players_response.status_code == 200:
            players_data = players_response.json()
            if players_data["response"]:
                player_images[away_team_id] = players_data["response"][0]["player"]["photo"]  # Get the first player's image

    # Format response
    upcoming_games = []
    for match in fixtures_data["response"]:
        home_team_id = match["teams"]["home"]["id"]
        away_team_id = match["teams"]["away"]["id"]
        upcoming_games.append({
            "league": match["league"]["name"],
            "home_team": match["teams"]["home"]["name"],
            "away_team": match["teams"]["away"]["name"],
            "date": match["fixture"]["date"],
            "home_image": player_images.get(home_team_id, ""),  # Get home team image
            "away_image": player_images.get(away_team_id, "")   # Get away team image
        })

    return jsonify({"team_name": selected_team["team"]["name"], "next_games": upcoming_games})


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)