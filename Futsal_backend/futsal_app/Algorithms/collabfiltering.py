from collections import defaultdict
import math
from futsal_app.models import Team, Match


def cosine_similarity(vec1, vec2):
    # Dot product
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))

    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def opponent_stats(team_id, opponent_id, matches):
    """
    Returns [played, win_rate, avg_goal_diff] for team vs opponent
    """
    games = [
        m for m in matches if
        (m.team_1.id == team_id and m.team_2.id == opponent_id) or
        (m.team_2.id == team_id and m.team_1.id == opponent_id)
    ]

    if not games:
        return [0, 0.0, 0.0]

    played = 1
    wins = 0
    goal_diff = 0

    for m in games:
        if not m.is_completed:
            continue  # skip unfinished matches

        if m.team_1.id == team_id:
            goals_for, goals_against = m.goals_team_1, m.goals_team_2
        else:
            goals_for, goals_against = m.goals_team_2, m.goals_team_1

        if goals_for is None or goals_against is None:
            continue  # ignore incomplete goal data

        if goals_for > goals_against:
            wins += 1
        elif goals_for == goals_against:
            wins += 0.5  # draw = half-win

        goal_diff += (goals_for - goals_against)

    if not games:
        return [0, 0.0, 0.0]

    win_rate = wins / len(games)
    avg_goal_diff = goal_diff / len(games)

    return [played, win_rate, avg_goal_diff]


def build_vector(team_id, all_opponents, matches):
    """
    Build a multi-dimensional vector for the team across all opponents.
    Each opponent contributes [played, win_rate, avg_goal_diff].
    """
    vector = []
    for opp in all_opponents:
        if opp == team_id:
            continue
        vector.extend(opponent_stats(team_id, opp, matches))
    return vector


def recommend_by_collab(target_team_id, top_n=5):
    # 1. Gather matches and teams
    matches = Match.objects.filter(match_type='competitive')
    all_teams = {m.team_1.id for m in matches} | {m.team_2.id for m in matches}
    all_opponents = sorted(list(all_teams))

    # 2. Build target vector
    target_vector = build_vector(target_team_id, all_opponents, matches)

    # 3. Compute cosine similarity with every other team
    similarities = []
    for team_id in all_teams:
        if team_id == target_team_id:
            continue
        vec = build_vector(team_id, all_opponents, matches)
        sim = cosine_similarity(target_vector, vec)
        similarities.append((team_id, sim))

    # 4. Sort and return top N
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_n]
