"""
Shared enum types used across the data model.
"""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


class CBETLevel(str, enum.Enum):
    LEVEL_2 = "level_2"  # Pre-Vocational Foundation
    LEVEL_3 = "level_3"  # Artisan Certificate
    LEVEL_4 = "level_4"  # Craft Certificate
    LEVEL_5 = "level_5"  # Technician Level
    LEVEL_6 = "level_6"  # Diploma Level


CBET_LEVEL_LABELS = {
    CBETLevel.LEVEL_2: "Level 2 \u2013 Pre-Vocational Foundation",
    CBETLevel.LEVEL_3: "Level 3 \u2013 Artisan Certificate",
    CBETLevel.LEVEL_4: "Level 4 \u2013 Craft Certificate",
    CBETLevel.LEVEL_5: "Level 5 \u2013 Technician Level",
    CBETLevel.LEVEL_6: "Level 6 \u2013 Diploma Level",
}


class ContentType(str, enum.Enum):
    NOTE = "note"
    PAST_PAPER = "past_paper"
    MARKING_SCHEME = "marking_scheme"
    VIDEO = "video"


class QuestionType(str, enum.Enum):
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
