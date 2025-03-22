import requests
import sqlite3
import logging
from datetime import datetime
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='israeli_football_tracker.log'
)

class IsraeliFootballTracker:
    def __init__(self, db_path='israeli_football.db'):
        self.db_path = db_path
        self.conn = None
        # API Key
        self.football_api_key = os.getenv('FOOTBALL_API_KEY')
        if not self.football_api_key:
            logging.warning("No FOOTBALL_API_KEY found in environment variables")
            print("WARNING: No FOOTBALL_API_KEY found in environment variables")
        
        self.setup_database()
        
    def setup_database(self):
        """Create database and tables if they don't exist"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            cursor = self.conn.cursor()
            
            # Create football players table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS football_players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date_of_birth Date,
                team TEXT,
                country TEXT,
                city TEXT,
                games_played INTEGER,
                goals INTEGER,
                assists INTEGER,
                position TEXT,
                player_id TEXT,
                last_updated TIMESTAMP
            )
            ''')
            
            self.conn.commit()
            logging.info("Database setup complete")
        except sqlite3.Error as e:
            logging.error(f"Database error: {e}")
            if self.conn:
                self.conn.close()
            raise
    
    def test_api_connection(self):
        """Test if the API is working with a simple request"""
        if not self.football_api_key:
            print("No API key available for testing")
            return False
        
        try:
            # Test with a simple leagues endpoint
            test_url = "https://api-football-v1.p.rapidapi.com/v3/leagues"
            headers = {
                "X-RapidAPI-Key": self.football_api_key,
                "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
            }
            
            test_response = requests.get(test_url, headers=headers)
            print(f"Test API response status code: {test_response.status_code}")
            
            if test_response.status_code == 200:
                # Print first few leagues to verify data
                data = test_response.json()
                if 'response' in data and len(data['response']) > 0:
                    print(f"API working properly. Found {len(data['response'])} leagues.")
                    print("Sample league:", data['response'][0]['league']['name'])
                    return True
                else:
                    print("API responded but no leagues data found.")
                    return False
            else:
                print(f"API test failed with status code: {test_response.status_code}")
                return False
                
        except Exception as e:
            print(f"API test error: {e}")
            return False
    
    def fetch_football_players(self, debug=True):
        """Fetch Israeli football players playing internationally using API-Football"""
        logging.info("Fetching football players data from API")
        
        if not self.football_api_key:
            logging.error("Missing API key for football data")
            print("ERROR: Missing API key for football data")
            return []
        
        # Test API connection first
        if debug:
            print("\nTesting API connection...")
            connection_ok = self.test_api_connection()
            if not connection_ok:
                print("API connection test failed. Continuing anyway...")
            
        players = []
        
        try:
           # API-Football (from RapidAPI)
            url = "https://api-football-v1.p.rapidapi.com/v3/players"

            # You need to include a season parameter and likely a league parameter
            querystring = {
                "season": "2023",  # Current or recent season
                "league": "271"    # Example: Premier League ID - you'll need to use leagues relevant to you
            }

            headers = {
                "X-RapidAPI-Key": self.football_api_key,
                "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
            }

            print("\nFetching players data...")
            response = requests.get(url, headers=headers, params=querystring)

            # Then filter for Israeli players in your code
            israeli_players = []
            if response.status_code == 200:
                data = response.json()
                for player in data.get('response', []):
                    if player.get('player', {}).get('nationality') == "Israel":
                        israeli_players.append(player)
                        
            print(f"Found {len(israeli_players)} Israeli players")
            
            # Debug information
            if debug:
                print(f"API Response Status Code: {response.status_code}")
                print(f"API Response Headers: {dict(response.headers)}")
                print(f"Response data preview: {response.text[:500]}...")  # Print first 500 chars
            
            # Check if response is valid
            if response.status_code != 200:
                print(f"Error: API returned status code {response.status_code}")
                logging.error(f"API returned error status code: {response.status_code}")
                return []
            
            try:
                data = response.json()
            except json.JSONDecodeError:
                print("Error: Could not parse API response as JSON")
                logging.error("Failed to parse API response as JSON")
                return []
            
            # Debug information about the response structure
            if debug:
                print("\nAPI Response Structure:")
                if 'response' in data:
                    print(f"Number of players in response: {len(data['response'])}")
                    if len(data['response']) > 0:
                        print(f"First player: {data['response'][0]['player']['name']}")
                else:
                    print("No 'response' key found in API data")
                    print(f"Available keys in response: {data.keys()}")
            
            # Process the player data
            if 'response' in data:
                for player_data in data['response']:
                    if debug:
                        print(f"\nProcessing player: {player_data['player']['name']}")
                    
                    # Check if player has statistics
                    if 'statistics' not in player_data or not player_data['statistics']:
                        if debug:
                            print(f"No statistics found for {player_data['player']['name']}")
                        continue
                    
                    # Check if player plays outside Israel
                    for stat in player_data['statistics']:
                        if 'team' not in stat or 'country' not in stat['team']:
                            if debug:
                                print(f"Missing team or country data for {player_data['player']['name']}")
                            continue
                            
                        team_country = stat['team']['country']
                        if debug:
                            print(f"Player's team country: {team_country}")
                            
                        if team_country.lower() != 'israel':
                            if debug:
                                print(f"Found player outside Israel: {player_data['player']['name']} in {team_country}")
                            
                            # Get city info (not always available)
                            city = "Unknown"
                            if 'city' in stat['team']:
                                city = stat['team']['city']
                                
                            # Get games played
                            games_played = 0
                            if 'games' in stat and 'appearences' in stat['games']:
                                games_played = stat['games']['appearences'] or 0
                                
                            # Get goals
                            goals = 0
                            if 'goals' in stat and 'total' in stat['goals']:
                                goals = stat['goals']['total'] or 0
                                
                            # Get assists
                            assists = 0
                            if 'goals' in stat and 'assists' in stat['goals']:
                                assists = stat['goals']['assists'] or 0
                            
                            player = {
                                "name": player_data['player']['name'],
                                "age": player_data['player']['age'],
                                "team": stat['team']['name'],
                                "country": team_country,
                                "city": city,
                                "games_played": games_played,
                                "goals": goals,
                                "assists": assists,
                                "position": player_data['player']['position'],
                                "player_id": str(player_data['player']['id'])
                            }
                            players.append(player)
                            break  # Found a team outside Israel, no need to check more statistics
            
            # Debug information about players found
            if debug:
                print(f"\nFound {len(players)} Israeli players playing abroad")
                for i, p in enumerate(players):
                    print(f"{i+1}. {p['name']} - {p['team']} ({p['country']})")
            
            # If no players found, try an alternative approach
            if len(players) == 0 and debug:
                print("\nNo players found with initial query. Trying without season parameter...")
                alt_querystring = {"nationality": "Israel"}
                alt_response = requests.get(url, headers=headers, params=alt_querystring)
                
                if alt_response.status_code == 200:
                    alt_data = alt_response.json()
                    if 'response' in alt_data:
                        print(f"Alternative query returned {len(alt_data['response'])} players")
                
            # Add players to database
            cursor = self.conn.cursor()
            for player in players:
                # Check if player already exists
                cursor.execute("SELECT id FROM football_players WHERE player_id = ?", (player["player_id"],))
                existing_player = cursor.fetchone()
                
                if existing_player:
                    # Update existing player
                    cursor.execute('''
                    UPDATE football_players SET 
                    name=?, age=?, team=?, country=?, city=?, games_played=?, goals=?, 
                    assists=?, position=?, last_updated=?
                    WHERE player_id=?
                    ''', (
                        player["name"], player["age"], player["team"], player["country"], 
                        player["city"], player["games_played"], player["goals"], 
                        player["assists"], player["position"], datetime.now(), player["player_id"]
                    ))
                else:
                    # Insert new player
                    cursor.execute('''
                    INSERT INTO football_players 
                    (name, age, team, country, city, games_played, goals, assists, position, player_id, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        player["name"], player["age"], player["team"], player["country"], 
                        player["city"], player["games_played"], player["goals"], 
                        player["assists"], player["position"], player["player_id"], datetime.now()
                    ))
            
            self.conn.commit()
            logging.info(f"Added/updated {len(players)} football players in database")
        
        except requests.exceptions.RequestException as e:
            logging.error(f"API request error: {e}")
            print(f"API request error: {e}")
        except Exception as e:
            logging.error(f"Error processing football data: {e}")
            print(f"Error processing football data: {e}")
            import traceback
            print(traceback.format_exc())
            
        return players
    
    def query_football_players(self):
        """Query all football players in the database"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM football_players")
        return cursor.fetchall()
    
    def close(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()
            logging.info("Database connection closed")

def main():
    try:
        # Initialize tracker
        tracker = IsraeliFootballTracker()
        
        # Fetch and store data
        print("Fetching Israeli football players data...")
        football_players = tracker.fetch_football_players(debug=True)
        
        # Display some info about the data collected
        print(f"\nCollected data for {len(football_players)} Israeli football players abroad")
        
        # Query and display data
        all_football = tracker.query_football_players()
        
        print(f"\nTotal football players in database: {len(all_football)}")
        
        if len(all_football) > 0:
            print("\nFootball Players:")
            for i, player in enumerate(all_football):
                print(f"{i+1}. {player[1]} - {player[3]} ({player[4]}, {player[5]}) - {player[6]} games, {player[7]} goals, {player[8]} assists")
        else:
            print("\nNo players found in the database.")
            print("\nTroubleshooting tips:")
            print("1. Check your API key is correct in the .env file")
            print("2. Make sure you haven't exceeded your API rate limits")
            print("3. Try a different season parameter (like 2022 or 2021)")
            print("4. The API might be temporarily unavailable or its format might have changed")
        
    except Exception as e:
        logging.error(f"Error in main function: {e}")
        print(f"An error occurred: {e}")
        import traceback
        print(traceback.format_exc())
    finally:
        # Close connection
        if 'tracker' in locals():
            tracker.close()

if __name__ == "__main__":
    main()