from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F

class IndoBERT:
  def __init__(self):
    print("🔹 Loading IndoBERT model...")
    self.tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p1")
    print("🔹 Tokenizer loaded.")
    self.model = AutoModel.from_pretrained("indobenchmark/indobert-base-p1")
    print("🔹 Model loaded.")
    self.model.eval()
    print("🔹 Model set to evaluation mode.")

  def encode(self, text: str):
    print(f"🔹 Encoding text: {text}")
    inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding='longest', max_length=512)
    print("🔹 Tokenized input.")
    with torch.no_grad():
      outputs = self.model(**inputs)
      print("🔹 Model inference completed.")
    embedding = outputs.last_hidden_state.mean(dim=1)
    print("🔹 Embedding computed.")
    return embedding

  def semantic_similarity(self, text1: str, text2: str) -> float:
    print(f"🔹 Calculating semantic similarity between:\n   Text1: {text1}\n   Text2: {text2}")
    vec1 = self.encode(text1)
    vec2 = self.encode(text2)
    sim = F.cosine_similarity(vec1, vec2)
    print(f"🔹 Cosine similarity computed: {sim.item()}")
    return sim.item()
