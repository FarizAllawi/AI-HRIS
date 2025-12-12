from typing import List, Dict
from sqlalchemy.orm import Session
from app.ml.indoBERT.indobert_model import IndoBERTModel
from app.models import JobPosting, JobPostingQuestion, JobPostingEmbedding
import numpy as np
import json

class JobPostingService:
    """
    Service for creating JD profiles:
    1. Parse JD into structured competencies
    2. Generate and cache embeddings
    3. Map questions to competencies
    """

    def __init__(self, model: IndoBERTModel, db: Session):
        self.model = model
        self.db = db

    def create_job_posting_profile(
        self,
        job_posting: JobPosting,
        questions: List[JobPostingQuestion],
    )->JobPosting:
        """
        Create complete JD profile with embeddings

        Args:
            job_posting: JobPosting instance with description
            questions: List of HR questions with weights and competency mappings

        Returns:
            Updated JobPosting with embeddings cached
        """
        # Step 1: Normalize question weights
        # total_weight = sum(q.weight for q in questions)
        # for q in questions:
        #     q.weight = q.weight / total_weight
        #     self.db.add(q)

        # Step 2: Generate and cache embeddings for job posting competency:
        #   Requirements
        #   Responsibility
        #   Qualifications
        #   Required Skills
        #   Preferred Skills
        self.generate_embeddings(job_posting)

        # Step 3: Generate and chache embeddings for combined question + competency
        for question in questions:
            self.generate_combined_embeddings(job_posting, question)

        self.db.commit()
        self.db.refresh(job_posting)
        return job_posting

    def get_job_posting_embeddings_for_questions(
            self,
            job_posting_id: str
    ) -> Dict[str, Dict[str, List]]:
        '''
        Get Job Posting Embeddings organized by question ID
        '''
        print(f"🔍 Retrieving embeddings for job posting: {job_posting_id}")

        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job_posting:
            print("❌ Job posting not found")
            return {}

        # Get all embeddings
        jp_embeddings = self.db.query(JobPostingEmbedding).filter(
            JobPostingEmbedding.job_posting_id == job_posting_id
        ).all()

        print(f"📊 Total embeddings found: {len(jp_embeddings)}")

        # Get all questions
        questions = self.db.query(JobPostingQuestion).filter(
            JobPostingQuestion.job_posting_id == job_posting_id
        ).all()

        print(f"❓ Questions found: {len(questions)}")

        # Organize by question with proper structure
        question_embeddings = {}

        for question in questions:
            qid = f"question_{question.id}"
            mapped_comps = question.mapped_competencies or []

            print(f"🔧 Processing question: {qid}")
            print(f"  Mapped competencies: {mapped_comps}")

            # Initialize embedding lists for this question
            question_emb = []
            competency_emb = []
            combined_emb = []

            for emb in jp_embeddings:
                cid = emb.competency_id or ""

                # Question-only embeddings
                if cid == f"question_{question.id}":
                    question_emb.append(np.array(emb.embedding, dtype=np.float32))
                    print(f"  ✅ Found question-only embedding")

                # Combined embeddings for this question - FIXED LOGIC
                # Format: "question_{comp_id}_{question.id}"
                elif cid.startswith("question_") and cid.endswith(
                        f"_{question.id}") and cid != f"question_{question.id}":
                    # Extract competency name from between "question_" and "_{question.id}"
                    comp_name = cid.replace("question_", "").replace(f"_{question.id}", "")
                    combined_emb.append((comp_name, np.array(emb.embedding, dtype=np.float32)))
                    print(f"  ✅ Found combined embedding: {comp_name}")

                # Competency embeddings from mapped competencies
                elif cid in mapped_comps:
                    competency_emb.append((cid, np.array(emb.embedding, dtype=np.float32)))
                    print(f"  ✅ Found competency embedding: {cid}")

            print(
                f"  📊 Results - Question: {len(question_emb)}, Competencies: {len(competency_emb)}, Combined: {len(combined_emb)}")

            question_embeddings[qid] = {
                "question": question_emb,
                "competencies": competency_emb,
                "combined": combined_emb
            }

        return question_embeddings

    def generate_embeddings(self, job_posting: JobPosting):
        """Generate embeddings for all competencies with error handling"""
        embedding_data = []

        competency_sources = [
            ('responsibilities', job_posting.responsibilities),
            ('requirements', job_posting.requirements),
            ('qualifications', job_posting.qualifications),
            ('preferred_skills', job_posting.preferred_skills),
            ('required_skills', job_posting.required_skills)
        ]

        for data_type, data in competency_sources:
            parsed_data = self._safe_json_parse(data)
            embedding_data.extend(self._process_embedding_items(
                job_posting.id,
                parsed_data,
                data_type,
            ))

        # Save to database
        for emb_dict in embedding_data:
            # Check if embedding already exists
            existing = self.db.query(JobPostingEmbedding).filter(
                JobPostingEmbedding.job_posting_id == job_posting.id,
                JobPostingEmbedding.competency_id == emb_dict["competency_id"],
                JobPostingEmbedding.competency_type == emb_dict["competency_type"]
            ).first()

            if not existing:
                jd_emb = JobPostingEmbedding(
                    job_posting_id=job_posting.id,
                    competency_type=emb_dict["competency_type"],
                    competency_id=emb_dict["competency_id"],
                    text=emb_dict["text"],
                    embedding=emb_dict["embedding"]
                )
                self.db.add(jd_emb)

    def generate_combined_embeddings(self, job_posting: JobPosting, questionItem: JobPostingQuestion):
        """
        Generate embeddings for each question with better ID format
        """
        print(f"🔧 Generating combined embeddings for question: {questionItem.id}")

        # --- 🧠 1️⃣ Question-only embedding ---
        q_text = questionItem.question.strip()
        q_embedding = self.model.encode(q_text)[0].tolist()

        self.db.add(JobPostingEmbedding(
            job_posting_id=job_posting.id,
            competency_type="question",
            competency_id=f"question_{questionItem.id}",
            text=q_text,
            embedding=q_embedding
        ))

        # --- 🧩 2️⃣ Combine all competency sources into a lookup dict ---
        competency_sources = [
            job_posting.responsibilities,
            job_posting.requirements,
            job_posting.qualifications,
            job_posting.preferred_skills,
            job_posting.required_skills
        ]

        # Flatten and safely parse all
        competencies = []
        for source in competency_sources:
            parsed_source = self._safe_json_parse(source, default=[])
            competencies.extend(parsed_source)

        # Build a lookup dictionary
        competency_dict = {c["id"]: c["value"] for c in competencies if
                           isinstance(c, dict) and "id" in c and "value" in c}

        # --- ⚙️ 3️⃣ Generate combined embeddings ---
        mapped_competencies = getattr(questionItem, "mapped_competencies", [])

        combined_count = 0
        for comp_id in mapped_competencies:
            comp_value = competency_dict.get(comp_id)
            if not comp_value:
                print(f"  ❌ Competency {comp_id} not found in dictionary")
                continue
                
            combined_text = f"{comp_value} {q_text}".strip()
            print(f"  Creating combined embedding: {comp_id} -> {combined_text[:100]}...")

            combined_embedding = self.model.encode(combined_text)[0].tolist()

            # OPTION 1: Keep existing format (recommended since data already exists)
            combined_id = f"question_{comp_id}_{questionItem.id}"

            # OPTION 2: Use new format (requires regenerating all embeddings)
            # combined_id = f"combined_{comp_id}_for_question_{questionItem.id}"

            # Check if combined embedding already exists
            existing = self.db.query(JobPostingEmbedding).filter(
                JobPostingEmbedding.job_posting_id == job_posting.id,
                JobPostingEmbedding.competency_id == combined_id
            ).first()

            if existing:
                print(f"  ⚠️  Combined embedding {combined_id} already exists, skipping")
                continue

            self.db.add(JobPostingEmbedding(
                job_posting_id=job_posting.id,
                competency_type="combined_question_embedding",
                competency_id=combined_id,
                text=combined_text,
                embedding=combined_embedding
            ))
            combined_count += 1

        try:
            self.db.commit()
            print(f"  ✅ Created {combined_count} combined embeddings for question {questionItem.id}")
        except Exception as e:
            print(f"  ❌ Failed to commit combined embeddings: {e}")
            self.db.rollback()

    def _process_embedding_items(self,job_posting_id, data_list, data_type):
        """
        Generate embeddings for a list of text items.

        :param job_posting_id: Job Posting ID
        :param data_list: list of dicts or strings (e.g. responsibilities, requirements, etc.)
        :param data_type: string to label the type (e.g. 'responsibility', 'requirement')
        :return: list of dicts with id, text, and embedding
        """
        embedding_data = []

        for idx, item in enumerate(data_list or []):
            text_value = item.get("value") if isinstance(item, dict) else str(item)
            if not text_value:
                continue  # skip empty

            existing = self.db.query(JobPostingEmbedding).filter(
                JobPostingEmbedding.text == text_value,
                JobPostingEmbedding.competency_type == data_type,
                JobPostingEmbedding.job_posting_id == job_posting_id
            ).first()

            if existing:
                continue # skip
            embedding = self.model.encode(text_value)[0]

            embedding_data.append({
                "competency_type": data_type,
                "competency_id": item.get("id") if isinstance(item, dict) else f"{data_type}_{idx+1}",
                "text": text_value,
                "embedding": embedding.tolist()
            })

        return embedding_data

    def _safe_json_parse(self, value, default=None):
        """
        Safely parse a JSON string to Python object.
        - If value is already a dict/list, it’s returned as-is.
        - If parsing fails, returns `default`.
        """
        if default is None:
            default = []

        if isinstance(value, (dict, list)):
            return value

        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                print(f"❌ Failed to parse JSON: {value}")
                return default

        return default
