# train_nlp_segmentation.py
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from transformers import DistilBertTokenizer, DistilBertModel
from torch.optim import AdamW
import joblib
import ast
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
import sqlite3
from sklearn.metrics import classification_report

# Load data from SQLite
sample_size = 2000  # Limit for faster training
data = pd.read_sql("SELECT cookie, interests FROM user_profiles", sqlite3.connect("user_profiles.db")).head(sample_size)
data["interests"] = data["interests"].apply(lambda x: ast.literal_eval(x) if x else [])
data["text"] = data["interests"].apply(lambda x: " ".join(x))

# Define segments (label space)
def map_interests_to_segments(interests):
    segments = set()
    for interest in interests:
        if any(x in interest.lower() for x in ["game", "gamer", "esports"]):
            segments.add("Gamers")
        if any(x in interest.lower() for x in ["tech", "ai", "robot", "code"]):
            segments.add("Tech Savvy")
        if any(x in interest.lower() for x in ["fashion", "style", "clothing"]):
            segments.add("Fashion & Lifestyle")
        if any(x in interest.lower() for x in ["invest", "finance", "crypto"]):
            segments.add("Finance Nerds")
        if any(x in interest.lower() for x in ["workout", "fitness", "gym"]):
            segments.add("Fitness Freaks")
    return list(segments or ["Unknown"])

data["segments"] = data["interests"].apply(map_interests_to_segments)

mlb = MultiLabelBinarizer()
y = mlb.fit_transform(data["segments"])

# Save label encoder
joblib.dump(mlb, "models/nlp_label_binarizer.pkl")

# Tokenize text using DistilBERT tokenizer
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

class UserDataset(Dataset):
    def __init__(self, texts, labels):
        self.texts = texts
        self.labels = labels

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = tokenizer(
            self.texts[idx],
            truncation=True,
            padding='max_length',
            max_length=64,
            return_tensors='pt'
        )
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.FloatTensor(self.labels[idx])
        }

X_train, X_val, y_train, y_val = train_test_split(data["text"].tolist(), y, test_size=0.2)

train_dataset = UserDataset(X_train, y_train)
val_dataset = UserDataset(X_val, y_val)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64)

class SegmentClassifier(nn.Module):
    def __init__(self, num_labels):
        super().__init__()
        self.bert = DistilBertModel.from_pretrained("distilbert-base-uncased")
        self.dropout = nn.Dropout(0.3)
        self.out = nn.Linear(self.bert.config.hidden_size, num_labels)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_output = outputs.last_hidden_state[:, 0, :]
        x = self.dropout(cls_output)
        return torch.sigmoid(self.out(x))

# Train the model
model = SegmentClassifier(num_labels=y.shape[1])
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

optimizer = AdamW(model.parameters(), lr=2e-5)
criterion = nn.BCELoss()

for epoch in range(2):  # Reduced epochs
    model.train()
    for batch_idx, batch in enumerate(train_loader):
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)

        outputs = model(input_ids, attention_mask)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if batch_idx % 5 == 0:
            print(f"[Epoch {epoch+1}] Batch {batch_idx}/{len(train_loader)} - Loss: {loss.item():.4f}")

print("Training finished. Saving model...")
torch.save(model.state_dict(), "models/bert_segment_model.pt")
print("Model training complete and saved!")

# Evaluation
model.eval()
all_preds = []
all_targets = []

with torch.no_grad():
    for batch in val_loader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].cpu().numpy()

        outputs = model(input_ids, attention_mask).cpu().numpy()
        preds = (outputs > 0.5).astype(int)

        all_preds.extend(preds)
        all_targets.extend(labels)

print("Validation Results:\n")
print(classification_report(all_targets, all_preds, target_names=mlb.classes_))
