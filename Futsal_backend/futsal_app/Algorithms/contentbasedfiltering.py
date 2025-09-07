# from futsal_app.models import Team
# from futsal_app.Algorithms.weighted_score import weighted_score

# def recommend_by_content(target_team, top_n=5):
#     target_elo = target_team.ranking
#     target_score = weighted_score(target_team)
#     target_futsal_id = target_team.futsal.id if target_team.futsal else None

#     recommendations = []

#     for other_team in Team.objects.exclude(id=target_team.id):
#         other_elo = other_team.ranking
#         other_score = weighted_score(other_team)
#         other_futsal_id = other_team.futsal.id if other_team.futsal else None  # <-- fixed

#         # Euclidean distance on ELO and weighted score
#         distance = ((target_elo - other_elo) ** 2 + (target_score - other_score) ** 2) ** 0.5
#         similarity = 1 / (1 + distance)

#         # Location (futsal) preference boost/penalty
#         if target_futsal_id and other_futsal_id:
#             if target_futsal_id == other_futsal_id:
#                 similarity *= 1.2  # Boost if same futsal
#             else:
#                 similarity *= 0.8  # Penalize if different futsal

#         recommendations.append((other_team.id, similarity))

#     recommendations.sort(key=lambda x: x[1], reverse=True)
#     return recommendations[:top_n]

from futsal_app.models import Team
from futsal_app.Algorithms.weighted_score import weighted_score

def recommend_by_content(target_team, top_n=5):
    target_elo = target_team.ranking
    target_score = weighted_score(target_team)

    # get set of futsal ids preffered by target team
    target_futsal_ids = set(target_team.preferred_futsals.values_list('id', flat=True))

    with_futsal_match = []
    without_futsal_match = []

    for other_team in Team.objects.exclude(id=target_team.id):
        other_elo = other_team.ranking
        other_score = weighted_score(other_team)
        other_futsal_ids = set(other_team.preferred_futsals.values_list('id', flat=True))

        # Euclidean distance on ELO and weighted score
        distance = ((target_elo - other_elo) ** 2 + (target_score - other_score) ** 2) ** 0.5
        similarity = 1 / (1 + distance)
 
        # Check if there is any futsal overlap
        has_futsal_overlap = len(target_futsal_ids.intersection(other_futsal_ids)) > 0

        if has_futsal_overlap:
            with_futsal_match.append((other_team.id, similarity))
        else:
            without_futsal_match.append((other_team.id, similarity))

    # Sort each list by descending similarity 
    with_futsal_match.sort(key=lambda x: x[1], reverse=True)
    without_futsal_match.sort(key=lambda x: x[1], reverse=True)

    # Combine lists, with futsal match teams first
    combined = with_futsal_match + without_futsal_match

    # Return top_n teams from combined list
    return combined[:top_n]
