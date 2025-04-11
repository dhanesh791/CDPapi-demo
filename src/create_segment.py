import sqlite3

def add_segments_column():
    conn = sqlite3.connect("user_profiles.db")
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(user_profiles)")
    columns = [col[1] for col in cursor.fetchall()]

    if 'segments' not in columns:
        cursor.execute("ALTER TABLE user_profiles ADD COLUMN segments")
        print("segments' column added.")
    else:
        print("ℹ'segments' column already exists.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_segments_column()
