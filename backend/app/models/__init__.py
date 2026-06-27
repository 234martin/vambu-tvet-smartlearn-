"""
Import all models here so Base.metadata sees every table
(used by Alembic autogenerate and `Base.metadata.create_all`).
"""
from app.models.content import ContentItem  # noqa: F401
from app.models.course import Course, Unit  # noqa: F401
from app.models.progress import ProgressRecord  # noqa: F401
from app.models.quiz import Question, Quiz, QuizAttempt  # noqa: F401
from app.models.user import User  # noqa: F401
