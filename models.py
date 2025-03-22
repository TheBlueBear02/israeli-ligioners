from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class FootballPlayer(db.Model):
    __tablename__ = 'football_players'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    team = db.Column(db.String, nullable=False)
    country = db.Column(db.String, nullable=False)
    city = db.Column(db.String, nullable=False)
    games_played = db.Column(db.Integer, default=0)
    goals = db.Column(db.Integer, default=0)
    assists = db.Column(db.Integer, default=0)
    position = db.Column(db.String, nullable=False)
    player_number = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String)
    last_updated = db.Column(db.DateTime)

    def __repr__(self):
        return f'<FootballPlayer {self.name}, Team: {self.team}, City: {self.city}>'

