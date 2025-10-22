# POST /jobs: create jobs → returns job_id; parses JD, stores text and JD embeddings.
# POST /jobs/{job_id}/weights: set {question_id: weight}; service stores weight_version.
# POST /score: body = job_id, candidate_id, {answers{q_id: text}} → returns per-Q scores + weighted total.
# POST /feedback: body = job_id, candidate_id, hr_score (and/or pairwise {better: idA, worse: idB}).