import math

def update_elo(team_a, team_b, winner_team=None, goals_a=0, goals_b=0):
    BASE_K = 32  # Base multiplier for rating changes

    # ----------------------------------------------------------
    # 1. Expected score formula (standard Elo system)
    # ----------------------------------------------------------
    def expected_score(my_rating, opponent_rating):
        """
        Returns the expected probability of winning
        based on the difference in ratings.
        """
        return 1 / (1 + 10 ** ((opponent_rating - my_rating) / 400))

    # ----------------------------------------------------------
    # 2. Experience multiplier (newer teams change faster)
    # ----------------------------------------------------------
    def experience_factor(games_played):
        """
        Returns a factor that reduces rating changes
        as teams play more games (more stable rating).
        """
        if games_played >= 50:
            return 0.8   # very experienced teams → smaller changes
        elif games_played >= 20:
            return 0.9   # medium experience → slightly smaller changes
        return 1.0       # new teams → full impact

    # ----------------------------------------------------------
    # 3. Goal difference multiplier (big wins = bigger changes)
    # ----------------------------------------------------------
    def goal_difference_factor(goal_diff):
        """
        Returns a multiplier based on how many goals the winner
        won by. Uses logarithm so that large wins matter more,
        but growth slows down (and is capped at 2.5).
        """
        if goal_diff == 0:
            return 1.0  # no difference for draws
        return min(1 + math.log(abs(goal_diff) + 1) * 0.5, 2.5)

    # ----------------------------------------------------------
    # Current team ratings and stats
    # ----------------------------------------------------------
    rating_a = team_a.ranking
    rating_b = team_b.ranking
    games_a = team_a.matches_played
    games_b = team_b.matches_played

    # ----------------------------------------------------------
    # Expected probabilities (who is more likely to win?)
    # ----------------------------------------------------------
    expected_a = expected_score(rating_a, rating_b)
    expected_b = expected_score(rating_b, rating_a)

    # ----------------------------------------------------------
    # Apply multipliers (experience + goal difference)
    # ----------------------------------------------------------
    exp_a = experience_factor(games_a)
    exp_b = experience_factor(games_b)
    goal_diff = abs(goals_a - goals_b)
    goal_factor = goal_difference_factor(goal_diff)

    # ----------------------------------------------------------
    # Actual scores (who really won?)
    # ----------------------------------------------------------
    if goals_a > goals_b:   # Team A wins
        score_a = min(1.0 * goal_factor, 1.5)
        score_b = 0.0
        team_a.wins += 1
    elif goals_b > goals_a: # Team B wins
        score_a = 0.0
        score_b = min(1.0 * goal_factor, 1.5)
        team_b.wins += 1
    else:                   # Draw
        score_a = score_b = 0.5

    # ----------------------------------------------------------
    # K-factors (rating adjustment speed)
    # ----------------------------------------------------------
    k_a = BASE_K * exp_a
    k_b = BASE_K * exp_b

    # ----------------------------------------------------------
    # Rating updates (main Elo formula)
    # ----------------------------------------------------------
    change_a = round(k_a * (score_a - expected_a), 2)
    change_b = round(k_b * (score_b - expected_b), 2)

    team_a.ranking = round(rating_a + change_a, 2)
    team_b.ranking = round(rating_b + change_b, 2)

    # ----------------------------------------------------------
    # Update matches played
    # ----------------------------------------------------------
    team_a.matches_played += 1
    team_b.matches_played += 1

    # Optional: Win rate (commented out in original code)
    # team_a.win_rate = round(team_a.wins / team_a.matches_played, 2)
    # team_b.win_rate = round(team_b.wins / team_b.matches_played, 2)

    # ----------------------------------------------------------
    # Save updates (assuming Django model or similar)
    # ----------------------------------------------------------
    team_a.save()
    team_b.save()

    # ----------------------------------------------------------
    # Return summary of rating changes
    # ----------------------------------------------------------
    return {
        "team_a_change": change_a,
        "team_b_change": change_b,
        "team_a_new_rating": team_a.ranking,
        "team_b_new_rating": team_b.ranking
    }
