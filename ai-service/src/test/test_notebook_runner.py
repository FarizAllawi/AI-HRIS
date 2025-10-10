import torch
import torch.nn.functional as F
import pandas as pd
from transformers import AutoTokenizer, AutoModel

# ==========================================================
# 1. Load IndoBERT model
# ==========================================================
print("🔹 Loading IndoBERT model...")
tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p1")
model = AutoModel.from_pretrained("indobenchmark/indobert-base-p1")

# ==========================================================
# 2. Load CSV
# ==========================================================
file_path = "Form_Responses_1.csv"  # mount this file in Docker
df = pd.read_csv(file_path)
print(f"✅ Loaded {len(df)} records")

# ==========================================================
# 3. Mapping
# ==========================================================
Q1 = 'Ceritakan pengalaman kerja terdahulu. Anda boleh menceritakan relevansi pengalaman kerja dulu dengan lowongan kerja yang Bapak/Ibu lamar'
Q2 = 'Apa motivasi Bapak/Ibu untuk bekerja di Universitas Trilogi?\n'
Q3 = 'Apa yang Bapak/Ibu ketahui tentang posisi ini?'
Q4 = 'Apa rencana pengembangan kedepannya apabila Anda diterima dalam posisi ini?'
Q5 = 'Jika Anda diterima, Apa yang Anda butuhkan dari Biro Sumber Daya Manusia jika Anda ingin mengembangkan diri Anda ?\n'

job_desc = """
Staf Administrasi Biro Pembelajaran bertugas mengelola data yudisium,
menerbitkan ijazah, menyiapkan alat tulis untuk dosen, menghadirkan absensi dosen,
menginput jadwal perkuliahan, dan menggandakan soal ujian.
"""

# ==========================================================
# 4. Embedding Function
# ==========================================================
def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    embeddings = outputs.last_hidden_state
    return embeddings.mean(dim=1)  # mean pooling

# ==========================================================
# 5. Scoring Function
# ==========================================================
weights = [0.3, 0.2, 0.2, 0.15, 0.15]

def skor_kandidat(row):
    total = 0
    jawaban = [row[Q1], row[Q2], row[Q3], row[Q4], row[Q5]]
    for ans, w in zip(jawaban, weights):
        sim = F.cosine_similarity(get_embedding(job_desc), get_embedding(str(ans))).item()
        total += sim * w
    return total

df["skor"] = df.apply(skor_kandidat, axis=1)

# ==========================================================
# 6. Ranking + Save
# ==========================================================
df_sorted = df.sort_values(by="skor", ascending=False)
top10 = df_sorted.head(10)
print("\n=== 10 Kandidat Terbaik ===")
print(top10[["Nama Lengkap", "skor"]])

top10.to_csv("hasil_seleksi_top10.csv", index=False)
print("💾 Saved results to hasil_seleksi_top10.csv")
