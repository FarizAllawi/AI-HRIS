# POST /train: kicks off a refinement run using accumulated feedback (logs train_run_id).
# GET /evaluate?run_id=...: returns offline metrics for that candidate model.
# POST /promote?run_id=...: set active_model_version if metrics pass gates.
# GET /models/active: returns model + jd_embedding_version + weight_version for traceability.