import math

def weighted_score(team):
    if team.matches_played == 0:
        return 0.0
    win_rate = team.wins / team.matches_played
    return win_rate * math.log(team.matches_played + 1)
