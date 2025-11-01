# AI Screening Service

IndoBERT-based candidate screening system with continual learning and zero-shot calibration.

## 🎯 Features

### 1. **Smart JD Profiling**
- Automatic parsing of job descriptions into competencies
- Embedding generation and caching per competency
- HR question mapping to relevant JD sections

### 2. **Zero-Shot Calibration**
- Find similar historical JDs using cosine similarity
- Import score distributions automatically
- Set thresholds (P75 for shortlist, P25 for flag) without applicants

### 3. **Weighted Scoring System**
- Configurable question weights by HR
- Max-pool cosine similarity per question
- Weighted aggregation: `S(c) = Σ(w_q × s_q)`
- **Re-scoreable with new weights** (no retraining!)

### 4. **Continual Learning**
- Replay buffer for catastrophic forgetting prevention
- Weekly model refinement from HR feedback
- Optional LoRA adapters for domain adaptation

### 5. **Production-Ready**
- Async processing with Celery
- Real-time and batch screening
- PostgreSQL + Redis backend
- Docker deployment

## 📁 Project Structure

```
app/
├── main.py                 # FastAPI application
├── celery_app.py          # Celery configuration
├── api/                   # REST API endpoints
│   ├── job_posting.py     # Job CRUD + JD profiling
│   ├── screening.py       # Candidate screening
│   ├── calibration.py     # Threshold calibration
│   └── training.py        # Model refinement
├── models/                # SQLAlchemy models
├── schemas/               # Pydantic schemas
├── services/              # Business logic
├── ml/                    # ML components
│   ├── indobert_model.py  # IndoBERT wrapper
│   ├── scorer.py          # Scoring algorithm
│   └── trainer.py         # Continual learning
├── tasks/                 # Celery async tasks
└── utils/                 # Utilities
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repo-url>
cd ai-service

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Run with Docker (Recommended)

```bash
# Build images
docker compose build

# Start all services
docker compose up -d

# Check logs
docker compose logs -f web
docker compose logs -f celery-worker

# Access services:
# - API: http://localhost:8100
# - API Docs: http://localhost:8100/docs
# - Flower (Celery monitor): http://localhost:5555
```

### 3. Run Locally (Development)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (base only, no ML libs)
pip install -r requirements.txt

# For Celery worker (with ML libs):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install transformers sentence-transformers

# Start PostgreSQL and Redis (with Docker)
docker compose up postgres redis -d

# Run FastAPI
uvicorn app.main:app --reload --port 8100

# In another terminal: Run Celery worker
celery -A app.celery_app worker --loglevel=info

# Optional: Run Celery beat (periodic tasks)
celery -A app.celery_app beat --loglevel=info
```

## 📖 API Usage

### Create Job Posting

```bash
curl -X POST http://localhost:8100/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer",
    "description": "We are looking for...",
    "questions": [
      {
        "id": 1,
        "text": "Describe your experience with Python",
        "weight": 0.4,
        "mapped_competencies": [0, 1, 2]
      },
      {
        "id": 2,
        "text": "What is your motivation?",
        "weight": 0.3,
        "mapped_competencies": [3, 4]
      },
      {
        "id": 3,
        "text": "Team collaboration experience?",
        "weight": 0.3,
        "mapped_competencies": [5]
      }
    ]
  }'
```

### Submit Candidate

```bash
curl -X POST http://localhost:8100/api/v1/screening/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "job_posting_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "answers": [
      {
        "question_id": 1,
        "answer": "I have 5 years of experience with Python..."
      },
      {
        "question_id": 2,
        "answer": "I am passionate about building scalable systems..."
      },
      {
        "question_id": 3,
        "answer": "I have led multiple cross-functional teams..."
      }
    ]
  }'
```

### Get Screening Results

```bash
# Get specific candidate result
curl http://localhost:8100/api/v1/screening/results/{candidate_id}

# Get all results for a job (shortlisted only)
curl "http://localhost:8100/api/v1/screening/results/job/1?decision=shortlist"

# Get screening summary
curl http://localhost:8100/api/v1/screening/summary/1
```

### Update Question Weights (Re-score All)

```bash
curl -X PUT http://localhost:8100/api/v1/jobs/1/weights \
  -H "Content-Type: application/json" \
  -d '{
    "weights": {
      "1": 0.5,
      "2": 0.3,
      "3": 0.2
    }
  }'
```

### Submit HR Feedback

```bash
curl -X PUT http://localhost:8100/api/v1/screening/feedback/1 \
  -H "Content-Type: application/json" \
  -d '{
    "hr_rating": 4,
    "hr_decision": "hired",
    "hr_notes": "Great technical skills and culture fit"
  }'
```

## 🔄 Workflow

### When HR Creates a Job Post:

1. **Parse JD** → structured competencies
2. **Generate embeddings** → cached per competency
3. **Attach question weights** → normalized to sum=1.0
4. **Calibrate thresholds** → find similar historical JDs
5. **Publish** → ready to receive candidates

### When Candidate Applies:

1. **Submit application** → candidate + answers
2. **Async screening** → Celery task
3. **Score calculation**:
   - Generate answer embeddings
   - Max-pool similarity to JD embeddings per question
   - Weighted aggregation
4. **Decision** → shortlist/review/flag based on thresholds
5. **Store results** → available immediately via API

### When HR Updates Weights:

1. **Update weights** → normalize
2. **Increment weight_version**
3. **Async re-scoring** → all candidates rescored
4. **No retraining needed!**

### Weekly Refinement (Automatic):

1. **Collect HR feedback** → ratings, decisions, notes
2. **Build training batch** → with replay buffer
3. **Fine-tune model** → continual learning
4. **Save checkpoint** → versioned
5. **Deploy** → seamless update

## 🧪 Testing

```bash
# Run tests
pytest tests/

# With coverage
pytest --cov=app tests/

# Specific test
pytest tests/test_api/test_screening.py
```

## 📊 Monitoring

### Celery Tasks (Flower)
Access http://localhost:5555 to monitor:
- Active tasks
- Task history
- Worker status
- Task success/failure rates

### Database
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U admin -d screening_db

# Check tables
\dt

# Query screening results
SELECT * FROM screening_results LIMIT 10;
```

### Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f celery-worker
```

## 🔧 Configuration

### Environment Variables (.env)

See `.env.example` for all available options.

Key settings:
- `MODEL_NAME`: IndoBERT model (default: indobenchmark/indobert-base-p1)
- `DEFAULT_SHORTLIST_PERCENTILE`: P75 threshold (default: 75.0)
- `DEFAULT_FLAG_PERCENTILE`: P25 threshold (default: 25.0)
- `REPLAY_BUFFER_SIZE`: Historical data size (default: 10000)

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Support

For issues and questions, please open a GitHub issue.