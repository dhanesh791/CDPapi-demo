import re

class DataCleaner:
    def __init__(self, user):
        self.user = user

    def clean(self):
        return {
            "cookie": self.user.cookie.strip() if self.user.cookie else None,
            "email": self.clean_email(self.user.email),
            "phone_number": self.clean_phone(self.user.phone_number),
            "age": self.clean_age(self.user.age),
            "city": self.title_case(self.user.city),
            "state": self.title_case(self.user.state),
            "country": self.title_case(self.user.country),
            "gender": self.standardize_gender(self.user.gender),
            "education": self.standardize_education(self.user.education),
            "income": str(self.normalize_income(self.user.income)),
            "interests": self.clean_interests(self.user.interests)
        }

    def clean_email(self, email):
        return email.strip().lower() if email and isinstance(email, str) else None

    def clean_phone(self, phone):
        if phone and isinstance(phone, str):
            digits = re.sub(r"\D", "", phone)
            return digits if len(digits) >= 7 else None
        return "Uknown"

    def title_case(self, value):
        return value.strip().title() if value and isinstance(value, str) else "Unknown"

    def standardize_gender(self, gender):
        if not gender or not isinstance(gender, str) or gender.strip().lower() in ['prefer not to say', '', 'null']:
            return "Unknown"
        gender = gender.strip().lower()
        if gender in ['m', 'male']:
            return 'Male'
        elif gender in ['f', 'female']:
            return 'Female'
        return gender.capitalize()

    def standardize_education(self, education):
        if not education or not isinstance(education, str):
            return "unknown"
        education = education.strip().lower()
        mappings = {
            'high school': 'High School',
            'some college': 'Some College',
            'bachelor': "Bachelor's",
            'master': "Master's",
            'phd': 'PhD',
            'trade': 'Trade School',
        }
        for key, value in mappings.items():
            if key in education:
                return value
        return education.title()

    def normalize_income(self, income):
        if not income or not isinstance(income, str):
            return 0
        income = income.replace('$', '').replace(',', '').strip()

        range_match = re.match(r'(\d+)\s*-\s*(\d+)', income)
        if range_match:
            low = int(range_match.group(1))
            high = int(range_match.group(2))
            return (low + high) // 2

        single_match = re.match(r'(\d+)', income)
        if single_match:
            return int(single_match.group(1))

        return 0


    def clean_interests(self, interests):
        if not interests:
            return "others"

        cleaned = []

        # Normalize and strip brackets/quotes
        if isinstance(interests, str):
            # Remove brackets, normalize quotes
            normalized = interests.replace('[', '').replace(']', '')
            normalized = re.sub(r'[\"\']', '', normalized)

            # Split by comma and strip whitespace
            parts = [p.strip().lower() for p in normalized.split(',') if p.strip()]
            cleaned.extend(parts)

        elif isinstance(interests, list):
            for i in interests:
                if isinstance(i, str):
                    parts = [p.strip().lower() for p in i.split('|') if p.strip()]
                    cleaned.extend(parts)
                else:
                    cleaned.append(str(i).strip().lower())

        unique = list(set(cleaned)) or ["others"]
        return ", ".join(unique)
    
    def clean_age(self, age):
        if age is None:
            return "uknown"

        try:
            # Normalize and extract digits even from messy strings like "45 years"
            age_str = str(age).strip()
            digits = re.findall(r'\d+', age_str)
            if digits:
                age_val = int(digits[0])
                if 5 <= age_val <= 120:  # filter out obviously invalid ages
                    return age_val
        except:
            pass

        return "unknown"