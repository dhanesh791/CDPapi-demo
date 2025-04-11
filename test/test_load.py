import os

base_dir = os.path.dirname(os.path.abspath(__file__))
print("Looking in:", os.path.join(base_dir, "models"))

print("Segment model exists:", os.path.exists(os.path.join(base_dir, "models", "interest_segment_model.pkl")))
print("Vectorizer exists:", os.path.exists(os.path.join(base_dir, "models", "interest_vectorizer.pkl")))
print("Label binarizer exists:", os.path.exists(os.path.join(base_dir, "models", "interest_label_binarizer.pkl")))



        # Predict cohorts and segments
        predicted_cohorts = predict_cohort(user_data.get("interests", []))
        predicted_segments = segment_user(user_data)

        user_data["cohorts"] = ", ".join([str(c) for c in predicted_cohorts]) if predicted_cohorts else "Mixed/Other"
        user_data["segments"] = ", ".join([str(s) for s in predicted_segments]) if predicted_segments else "General"

        print("✅ Cohorts:", user_data["cohorts"])
        print("✅ Segments:", user_data["segments"])
