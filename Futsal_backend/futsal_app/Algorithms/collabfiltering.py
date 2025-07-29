from collections import defaultdict
import math
from futsal_app.models import Team
from futsal_app.models import Match

def cosine_similarity(vec1, vec2):
    # Dot product
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))

    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def recommend_by_collab(target_team_id, top_n=5):
    # 1. Gather opponent sets
    matches = Match.objects.filter(match_type='competitive')
    team_opponents = defaultdict(set)

    all_teams = set()
    for match in matches:
        t1, t2 = match.team_1.id, match.team_2.id
        team_opponents[t1].add(t2)
        team_opponents[t2].add(t1)
        all_teams.update([t1, t2])

    all_opponents = sorted(list(all_teams))  # Treat all teams as potential opponents

    # 2. Create binary vectors (rows = teams, columns = opponents)
    def build_vector(team_id):
        return [1 if opp in team_opponents[team_id] else 0 for opp in all_opponents]

    target_vector = build_vector(target_team_id)

    # 3. Compute cosine similarity with every other team
    similarities = []
    for team_id in all_teams:
        if team_id == target_team_id:
            continue
        vec = build_vector(team_id)
        sim = cosine_similarity(target_vector, vec)
        similarities.append((team_id, sim))

    # 4. Sort and return top N
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_n]
