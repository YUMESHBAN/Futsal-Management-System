def merge_recommendations(cf_results, cbf_results, alpha=0.5):
    """
    Combines two recommendation lists:
    - cf_results: [(team_id, score), ...]
    - cbf_results: [(team_id, score), ...]
    - alpha: weight given to collaborative filtering (0 ≤ α ≤ 1)

    Returns: sorted list of (team_id, combined_score)
    """
    combined_scores = {}

    # Add weighted CF scores
    for team_id, score in cf_results:
        combined_scores[team_id] = combined_scores.get(team_id, 0) + alpha * score

    # Add weighted CBF scores
    for team_id, score in cbf_results:
        combined_scores[team_id] = combined_scores.get(team_id, 0) + (1 - alpha) * score

    # Sort by combined score
    sorted_results = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_results
