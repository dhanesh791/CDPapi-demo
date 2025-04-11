import sqlite3
import ast
from rules_engine import assign_segments  # assumes you already have this function

def update_user_segments():
    conn = sqlite3.connect("user_profiles.db")
    cursor = conn.cursor()

    cursor.execute("SELECT cookie, email, phone_number, city, state, country, age, gender, income, education, interests FROM user_profiles")
    rows = cursor.fetchall()

    for row in rows:
        cookie, email, phone, city, state, country, age, gender, income, education, interests = row

        # Parse interests
        if isinstance(interests, str):
            try:
                interests = ast.literal_eval(interests)
            except Exception:
                interests = []

        # Normalize income
        try:
            income_val = int(income)
        except:
            income_val = 0

        user_data = {
            "cookie": cookie,
            "email": email,
            "phone_number": phone,
            "city": city,
            "state": state,
            "country": country,
            "age": int(age) if age and str(age).isdigit() else None,
            "gender": gender,
            "income": income_val,
            "education": education,
            "interests": interests or [],
        }

        segments = assign_segments(user_data)
        segments_str = ', '.join(segments)

        cursor.execute("UPDATE user_profiles SET segments = ? WHERE cookie = ?", (segments_str, cookie))

    conn.commit()
    conn.close()
    print("✅ Segments assigned to all users.")

if __name__ == "__main__":
    update_user_segments()
