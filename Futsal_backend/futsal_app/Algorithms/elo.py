import math

def update_elo(team_a, team_b, winner_team=None, goals_a=0, goals_b=0):
    BASE_K = 32

    def expected_score(rating_self, rating_opponent):
        return 1 / (1 + 10 ** ((rating_opponent - rating_self) / 400))

    def experience_multiplier(games_played):
        if games_played >= 50:
            return 0.8
        elif games_played >= 20:
            return 0.9
        return 1.0

    def goal_diff_multiplier(goal_diff):
        if goal_diff == 0:
            return 1.0
        return min(1 + math.log(abs(goal_diff) + 1) * 0.5, 2.5)

    # Current ratings
    R_A = team_a.ranking
    R_B = team_b.ranking

    # Games played before update
    gp_A = team_a.matches_played
    gp_B = team_b.matches_played

    # Expected scores
    E_A = expected_score(R_A, R_B)
    E_B = expected_score(R_B, R_A)

    # Multipliers
    exp_A = experience_multiplier(gp_A)
    exp_B = experience_multiplier(gp_B)
    goal_diff = abs(goals_a - goals_b)
    goal_mult = goal_diff_multiplier(goal_diff)

    # Actual scores
    if goals_a > goals_b:
        S_A = min(1.0 * goal_mult, 1.5)
        S_B = 0.0
        team_a.wins += 1
    elif goals_b > goals_a:
        S_A = 0.0
        S_B = min(1.0 * goal_mult, 1.5)
        team_b.wins += 1
    else:
        S_A = S_B = 0.5  # Draw

    # K-Factors
    K_A = BASE_K * exp_A
    K_B = BASE_K * exp_B

    # Rating adjustments
    delta_A = round(K_A * (S_A - E_A), 2)
    delta_B = round(K_B * (S_B - E_B), 2)

    team_a.ranking = round(R_A + delta_A, 2)
    team_b.ranking = round(R_B + delta_B, 2)

    # Matches played
    team_a.matches_played += 1
    team_b.matches_played += 1

    # Win rates
    # team_a.win_rate = round(team_a.wins / team_a.matches_played, 2)
    # team_b.win_rate = round(team_b.wins / team_b.matches_played, 2)

    # Save updates
    team_a.save()
    team_b.save()

    return {
        "team_a_change": delta_A,
        "team_b_change": delta_B,
        "team_a_new_rating": team_a.ranking,
        "team_b_new_rating": team_b.ranking
    }
