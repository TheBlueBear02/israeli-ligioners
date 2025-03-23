import requests
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file


FOOTBALL_API_KEY = "YOUR_RAPIDAPI_KEY"
HEADERS = {
    "X-RapidAPI-Key": FOOTBALL_API_KEY,
    "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
}

def get_team_list(league_id, season):
    url = "https://api-football-v1.p.rapidapi.com/v3/teams"
    params = {"league": league_id, "season": season}

    response = requests.get(url, headers=HEADERS, params=params)
    data = response.json()
    print(data)
    if "response" in data:
        for team in data["response"]:
            print(f"Team ID: {team['team']['id']} | Name: {team['team']['name']}")

# Example: Bundesliga (Germany) league ID is 78, season 2024
get_team_list(78, "2024")
