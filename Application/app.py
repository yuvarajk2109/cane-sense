from flask import Flask, render_template, request, jsonify, session, redirect, url_for

from werkzeug.utils import secure_filename
import os
import json
from pathlib import Path
from PIL import Image
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from langdetect import detect, LangDetectException

import torch
from torch import nn
import torchvision.transforms as transforms

from sentence_transformers import SentenceTransformer
import faiss

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

img_size = 224
seq_len = 3
feature_dim = 512
hidden_dim = 256
num_layers = 2
dropout = 0.3

class_names = ['BacterialBlights', 'Healthy', 'Mosaic', 'RedRot', 'Rust', 'Yellow']
num_classes = len(class_names)

transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5],
                         [0.5, 0.5, 0.5])
])

def conv_block(cin, cout, k=3, s=1, p=1):
    return nn.Sequential(
        nn.Conv2d(cin, cout, kernel_size=k, stride=s, padding=p, bias=False),
        nn.BatchNorm2d(cout),
        nn.ReLU(inplace=True),
    )

class SymNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.stem = nn.Sequential(
            conv_block(3, 32),
            conv_block(32, 32),
            nn.MaxPool2d(2),
        )
        self.stage2 = nn.Sequential(
            conv_block(32, 64),
            conv_block(64, 64),
            nn.MaxPool2d(2),
        )
        self.stage3 = nn.Sequential(
            conv_block(64, 128),
            conv_block(128, 128),
            nn.MaxPool2d(2),
        )
        self.stage4 = nn.Sequential(
            conv_block(128, 256),
            conv_block(256, 256),
            nn.MaxPool2d(2),
        )
        self.stage5 = nn.Sequential(
            conv_block(256, 512),
            conv_block(512, 512),
            nn.AdaptiveAvgPool2d(1),
        )

    def forward(self, x):
        x = self.stem(x)
        x = self.stage2(x)
        x = self.stage3(x)
        x = self.stage4(x)
        x = self.stage5(x)
        return x.view(x.size(0), -1) 
    
class ProgNet(nn.Module):
    def __init__(self, feature_dim=feature_dim, hidden_dim=hidden_dim, num_layers=num_layers,
                 num_classes=num_classes, dropout=dropout):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=feature_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
            bidirectional=True
        )
        self.fc = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(hidden_dim * 2, num_classes)
        )

    def forward(self, x):
        out, (hn, cn) = self.lstm(x)
        last_hidden = torch.cat((hn[-2], hn[-1]), dim=1)
        return self.fc(last_hidden)
    
class CaneSight(nn.Module):
    def __init__(self, symnet, prognet):
        super().__init__()
        self.symnet = symnet
        self.prognet = prognet

    def forward(self, x_seq):
        batch_size, seq_len, C, H, W = x_seq.size()
        features = []

        for t in range(seq_len):
            img = x_seq[:, t, :, :, :]
            feat = self.symnet(img)
            features.append(feat)

        features = torch.stack(features, dim=1)
        return self.prognet(features)
    
model_name = "main"
folder_name = "Main"
model_dir = os.path.join("..", f"Saved_Models\\{folder_name}")
model_path = os.path.join(model_dir, "cane_sight_final.pth")

symnet = SymNet()
prognet = ProgNet(num_classes=num_classes, dropout=dropout)
model = CaneSight(symnet, prognet).to(device)

model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

embedder = SentenceTransformer("all-MiniLM-L6-v2")

def predict_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img_tensor = transform(img)
    img_seq = img_tensor.unsqueeze(0).repeat(seq_len, 1, 1, 1)
    img_seq = img_seq.unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_seq)
        probs = torch.softmax(output, dim=1)
        pred_idx = probs.argmax(dim=1).item()
        confidence = probs[0, pred_idx].item()

    print(f"Predicted Class: {class_names[pred_idx]}")
    print(f"Confidence: {confidence:.4f}")
    return class_names[pred_idx], confidence

app = Flask(__name__)
app.secret_key = "warspinix"
BASE_DIR = Path(__file__).resolve().parent
PARENT_DIR = BASE_DIR.parent

UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

MODEL_PATH = PARENT_DIR / "Saved_Models" / "Main.pth" / 'cane_sight.pth'

MAPPER_PATH = BASE_DIR / "static" / "json" / "mapper.json"

with open(MAPPER_PATH, "r", encoding="utf-8") as f:
    MAPPER = json.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload-image", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    save_path = UPLOAD_FOLDER / filename
    file.save(save_path)

    predicted_class, confidence = predict_image(save_path)
    session["last_image"] = f"/static/uploads/{filename}"
    session["predicted_class"] = predicted_class

    return jsonify({"success": True, "filename": session["last_image"], "predicted_class": predicted_class, "confidence": confidence})

def find_best_answer(question_text, lang_detected, top_k=1, disease_name="Healthy"):
    candidates = []
    for entry in MAPPER:
        disease = entry.get("disease")
        if disease.lower() == disease_name.lower() or disease.lower() == "healthy":
            print(disease, disease_name)
            for qa in entry.get("quesans", []):
                subs_dict = qa.get("sub_questions", {})
                if isinstance(subs_dict, dict):
                    for lang_key, sub_list in subs_dict.items():
                        for sq in sub_list:
                            candidates.append({
                                "canonical": qa.get("canonical_question", ""),
                                "sub_question": sq,
                                "answer": qa.get("answer", {}),
                                "lang_key": lang_key
                            })
                elif isinstance(subs_dict, list):
                    for sq in subs_dict:
                        candidates.append({
                            "canonical": qa.get("canonical_question", ""),
                            "sub_question": sq,
                            "answer": qa.get("answer", {}),
                            "lang_key": "en"
                        })

    if not candidates:
        return None
    
    print(candidates[0])

    corpus = []
    i = 0
    for c in candidates:
        corpus.append(c["canonical"])
        corpus.append(c["sub_question"])
        if (i==3):
            print(corpus)
            i+=1
        
    corpus_embeddings = embedder.encode(corpus, convert_to_numpy=True)
    d = corpus_embeddings.shape[1]
    index = faiss.IndexFlatIP(d)
    faiss.normalize_L2(corpus_embeddings)
    index.add(corpus_embeddings)

    q = question_text
    q_emb = embedder.encode([q], convert_to_numpy=True)
    faiss.normalize_L2(q_emb)

    scores, idx = index.search(q_emb, k=5)

    print("Best Match:", corpus[idx[0][0]])
    print("Similarity Score:", scores[0][0])  

    best_corpus_idx = int(idx[0][0])      
    best_cand_idx = best_corpus_idx // 2  

    return {
        "canonical_question": candidates[best_cand_idx]["canonical"],
        "sub_question": candidates[best_cand_idx]["sub_question"],
        "answer": candidates[best_cand_idx]["answer"],
        "score": float(scores[0][0]),
        "lang_key": candidates[best_cand_idx]["lang_key"],
        "detected_lang": lang_detected
    }  

    # tfidf = TfidfVectorizer().fit(corpus + [question_text])
    # corpus_vecs = tfidf.transform(corpus)
    # q_vec = tfidf.transform([question_text])
    # sims = cosine_similarity(q_vec, corpus_vecs).flatten()
    # best_idx = int(sims.argmax())
    # return {
    #     "canonical_question": candidates[best_idx]["canonical"],
    #     "answer": candidates[best_idx]["answer"],
    #     "score": float(sims[best_idx]),
    #     "lang_key": candidates[best_idx]["lang_key"],
    #     "detected_lang": lang_detected
    # }

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({"success": False, "error": "No question provided"}), 400
    qtext = data["question"].strip()
    disease = session.get("predicted_class", "Healthy")
    print("Session Disease:", disease)

    try:
        lang = detect(qtext)
    except LangDetectException:
        lang = "en"

    result = find_best_answer(qtext, lang, disease_name=disease)
    print("Matched Question: ", result['canonical_question'])
    print("Score: ", result['score'])
    if not result or result['score'] < 0.5:
        reply_text = {
            "en": f'''
                    Sorry — I couldn't find any information for this question. 
                    Could you please rephrase your question?
                    Or maybe you would like to contact our regional Agri-Expert?
                    (Score = {result['score']*100:.2f}%)
                    ''',
        }
        answer_text = reply_text.get(lang, reply_text.get("en"))
        return jsonify({
            "success": True,
            "language": lang,
            "answer": answer_text,
            "canonical_question": None,
            "score": 0.0
        })
    
    answer_field = result["answer"]
    if isinstance(answer_field, str):
        answer_field = {"en": answer_field}

    answer_text = answer_field.get(lang) or answer_field.get("en") or list(answer_field.values())[0]

    return jsonify({
        "success": True,
        "language": lang,
        "answer": answer_text,
        "canonical_question": result["canonical_question"],
        "score": result["score"]
    })

@app.route("/clear-session", methods=["POST"])
def clear_session():
    session.clear()
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)