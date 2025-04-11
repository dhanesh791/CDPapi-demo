def segment_user(user: dict) -> list:
    segments = []

    # --- Normalize fields ---
    try:
        income = int(user.get("income", 0))
    except (ValueError, TypeError):
        income = 0

    interests = [i.strip().lower() for i in user.get("interests", []) if i]
    education = (user.get("education") or "").strip().lower()
    country = (user.get("country") or "").strip().lower()
    state = (user.get("state") or "").strip().lower()
    age = int(user.get("age", 0)) if str(user.get("age", "")).isdigit() else None

    # --- Income-based segmentation ---
    if income >= 200000:
        segments.append("elite_spender")
    elif income >= 150000:
        if any(i in interests for i in ["fashion", "luxury", "lifestyle"]):
            segments.append("luxury_spender")
        else:
            segments.append("high_spender")
    elif income >= 100000:
        segments.append("high_spender")
    elif income < 30000 and income > 0:
        segments.append("budget_shopper")

    # --- Interest-based segmentation ---
    if "tech" in interests:
        segments.append("techie")
    if "gaming" in interests:
        segments.append("gamer")
    if "travel" in interests:
        segments.append("traveler")
    if any(i in interests for i in ["books", "education", "reading"]):
        segments.append("learner")
    if "finance" in interests:
        segments.append("investor")
    if "health" in interests or "fitness" in interests:
        segments.append("health_conscious")

    # --- Education-based segmentation ---
    if any(level in education for level in ["phd", "doctorate"]):
        segments.append("academic")
    elif any(level in education for level in ["some college", "bachelor"]):
        segments.append("student")

    # --- Location-based segmentation ---
    if country not in ["usa", "canada", "uk"] and country:
        segments.append("global_user")
    if country in ["usa", "canada"] and state in ["california", "new york", "texas"]:
        segments.append("urban_consumer")

    # --- Age-based segmentation ---
    if age is not None:
        if age >= 60:
            segments.append("senior")
    
    listseg =[]
    for i in set(segments):
        listseg.append(i)
    
    return listseg
