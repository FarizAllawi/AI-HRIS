import re
from typing import Any, Dict, List, Union
import json


def parse_job_desc_to_competencies(jd_text: str) -> Dict[str, List[str]]:
    """
    Parse job description text into structured competencies

    Args:
        jd_text: Raw job description text

    Returns:
        Dict with keys: responsibilities, required_skills, preferred_skills, qualifications
    """

    # Common section headers (Indonesian and English)
    responsibility_headers = [
        r"tanggung jawab",
        r"responsibilities",
        r"job description",
        r"tugas",
        r"what you'll do"
    ]

    skill_headers = [
        r"kualifikasi",
        r"requirements",
        r"required skills",
        r"keahlian yang dibutuhkan",
        r"qualifications",
        r"persyaratan"
    ]

    preferred_headers = [
        r"preferred",
        r"nice to have",
        r"bonus",
        r"diutamakan"
    ]

    # Split into sections
    sections = {
        "responsibilities": [],
        "required_skills": [],
        "preferred_skills": [],
        "qualifications": []
    }

    # Normalize text
    text = jd_text.lower()

    # Extract bullet points (common patterns)
    bullet_patterns = [
        r'[-•*]\s*(.+?)(?=\n|$)',
        r'\d+\.\s*(.+?)(?=\n|$)',
        r'[a-z]\)\s*(.+?)(?=\n|$)'
    ]

    bullets = []
    for pattern in bullet_patterns:
        bullets.extend(re.findall(pattern, text, re.MULTILINE))

    # If no bullets found, split by sentences
    if not bullets:
        bullets = [s.strip() for s in re.split(r'[.!?]\s+', text) if len(s.strip()) > 10]

    # Classify bullets into sections
    current_section = "responsibilities"  # default

    for bullet in bullets:
        bullet = bullet.strip()
        if len(bullet) < 5:
            continue

        # Check if it's a section header
        is_header = False
        for header in responsibility_headers:
            if re.search(header, bullet, re.IGNORECASE):
                current_section = "responsibilities"
                is_header = True
                break

        if not is_header:
            for header in skill_headers:
                if re.search(header, bullet, re.IGNORECASE):
                    current_section = "required_skills"
                    is_header = True
                    break

        if not is_header:
            for header in preferred_headers:
                if re.search(header, bullet, re.IGNORECASE):
                    current_section = "preferred_skills"
                    is_header = True
                    break

        # If not a header, add to current section
        if not is_header:
            # Clean up the bullet text
            cleaned = re.sub(r'^[-•*\d+\.a-z\)]\s*', '', bullet)
            cleaned = cleaned.strip()

            if len(cleaned) > 10:
                sections[current_section].append(cleaned)

    # If no clear sections found, put everything in responsibilities
    if all(len(v) == 0 for v in sections.values()):
        # Split by sentences as fallback
        sentences = [s.strip() for s in re.split(r'[.!?]\s+', jd_text) if len(s.strip()) > 15]
        sections["responsibilities"] = sentences[:len(sentences) // 2] if len(sentences) > 4 else sentences
        sections["required_skills"] = sentences[len(sentences) // 2:] if len(sentences) > 4 else []

    return sections


def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text (for competency mapping)"""
    # Simple keyword extraction (can be improved with NLP)
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())

    # Filter common words
    stop_words = {'the', 'and', 'for', 'with', 'yang', 'dan', 'untuk', 'dari', 'akan'}
    keywords = [w for w in words if w not in stop_words]

    return list(set(keywords))

def safe_json_parse(value: Any, default: Any = None) -> Union[dict, list]:
    """
    Safely parse a value to Python object suitable for JSON storage.
    - If value is a Pydantic model or list of models, convert to dict
    - If value is already a dict/list, return as-is
    - If value is a JSON string, parse it
    - If parsing fails, return `default`
    """
    if default is None:
        default = []

    # Handle None
    if value is None:
        return default

    # Handle Pydantic models (they have .model_dump() or .dict())
    if hasattr(value, 'model_dump'):
        return value.model_dump()
    elif hasattr(value, 'dict'):
        return value.dict()

    # Handle list of Pydantic models
    if isinstance(value, list):
        if value and hasattr(value[0], 'model_dump'):
            return [item.model_dump() for item in value]
        elif value and hasattr(value[0], 'dict'):
            return [item.dict() for item in value]
        return value

    # Handle dict
    if isinstance(value, dict):
        return value

    # Handle JSON string
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            print(f"❌ Failed to parse JSON: {value}")
            return default

    print(f"⚠️ Unexpected type for JSON field: {type(value)}")
    return defaultt