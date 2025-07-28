from futsal_app.models import Team
from futsal_app.Algorithms.weighted_score import weighted_score

def recommend_by_content(target_team, top_n=5):
    target_elo = target_team.ranking
    target_score = weighted_score(target_team)
    target_futsal_id = target_team.futsal.id if target_team.futsal else None

    recommendations = []

    for other_team in Team.objects.exclude(id=target_team.id):
        other_elo = other_team.ranking
        other_score = weighted_score(other_team)
        other_futsal_id = other_team.futsal.id if other_team.futsal else None  # <-- fixed

        # Euclidean distance on ELO and weighted score
        distance = ((target_elo - other_elo) ** 2 + (target_score - other_score) ** 2) ** 0.5
        similarity = 1 / (1 + distance)

        # Location (futsal) preference boost/penalty
        if target_futsal_id and other_futsal_id:
            if target_futsal_id == other_futsal_id:
                similarity *= 1.2  # Boost if same futsal
            else:
                similarity *= 0.8  # Penalize if different futsal

        recommendations.append((other_team.id, similarity))

    recommendations.sort(key=lambda x: x[1], reverse=True)
    return recommendations[:top_n]
