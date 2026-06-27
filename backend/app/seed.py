"""
Seed the database with demo data: an admin, a teacher, sample courses
across CBET levels, common units, course-specific units, and a sample quiz.

Run with: python -m app.seed
"""
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.course import Course, Unit
from app.models.enums import CBETLevel, QuestionType, UserRole
from app.models.quiz import Question, Quiz
from app.models.user import User


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).filter(User.email == "admin@vsl.ac.ke").first():
            print("Seed data already exists. Skipping.")
            return

        # --- Users ---
        admin = User(
            full_name="System Administrator",
            email="admin@vsl.ac.ke",
            hashed_password=hash_password("Admin@123"),
            role=UserRole.ADMIN,
        )
        teacher = User(
            full_name="Mwalimu Jane Wanjiru",
            email="teacher@vsl.ac.ke",
            hashed_password=hash_password("Teacher@123"),
            role=UserRole.TEACHER,
        )
        db.add_all([admin, teacher])
        db.flush()

        # --- Courses across CBET levels ---
        plumbing = Course(name="Plumbing", level=CBETLevel.LEVEL_3, description="Artisan-level plumbing skills.")
        motor_vehicle = Course(name="Motor Vehicle Mechanics", level=CBETLevel.LEVEL_3, description="Vehicle repair and maintenance.")
        electrical = Course(name="Electrical Installation", level=CBETLevel.LEVEL_4, description="Craft-level electrical systems.")
        diploma_it = Course(name="Information Communication Technology", level=CBETLevel.LEVEL_6, description="Diploma-level ICT.")
        db.add_all([plumbing, motor_vehicle, electrical, diploma_it])
        db.flush()

        # --- Common units (visible to ALL students regardless of course) ---
        common_units = [
            Unit(title="Workshop Safety", description="General safety practices for all trades.", is_common=True, order_index=1),
            Unit(title="Mathematics Basics", description="Foundational numeracy for TVET trades.", is_common=True, order_index=2),
            Unit(title="English Communication Basics", description="Workplace communication skills.", is_common=True, order_index=3),
        ]
        db.add_all(common_units)
        db.flush()

        # --- Course-specific units ---
        plumbing_units = [
            Unit(title="Pipe Fitting Fundamentals", course_id=plumbing.id, order_index=1),
            Unit(title="Drainage Systems", course_id=plumbing.id, order_index=2),
        ]
        motor_units = [
            Unit(title="Engine Diagnostics", course_id=motor_vehicle.id, order_index=1),
            Unit(title="Braking Systems", course_id=motor_vehicle.id, order_index=2),
        ]
        electrical_units = [
            Unit(title="Domestic Wiring", course_id=electrical.id, order_index=1),
            Unit(title="Circuit Protection Devices", course_id=electrical.id, order_index=2),
        ]
        ict_units = [
            Unit(title="Networking Fundamentals", course_id=diploma_it.id, order_index=1),
            Unit(title="Database Systems", course_id=diploma_it.id, order_index=2),
        ]
        db.add_all(plumbing_units + motor_units + electrical_units + ict_units)
        db.flush()

        # --- Demo students ---
        student1 = User(
            full_name="Brian Otieno",
            email="student1@vsl.ac.ke",
            hashed_password=hash_password("Student@123"),
            role=UserRole.STUDENT,
            level=CBETLevel.LEVEL_3,
            course_id=plumbing.id,
        )
        student2 = User(
            full_name="Faith Chebet",
            email="student2@vsl.ac.ke",
            hashed_password=hash_password("Student@123"),
            role=UserRole.STUDENT,
            level=CBETLevel.LEVEL_3,
            course_id=motor_vehicle.id,
        )
        db.add_all([student1, student2])
        db.flush()

        # --- Sample quiz on a common unit ---
        safety_unit = common_units[0]
        quiz = Quiz(
            title="Workshop Safety Basics Quiz",
            description="Quick check on essential workshop safety knowledge.",
            unit_id=safety_unit.id,
            time_limit_minutes=10,
            created_by_id=teacher.id,
        )
        db.add(quiz)
        db.flush()

        questions = [
            Question(
                quiz_id=quiz.id,
                question_text="What should you wear before operating workshop machinery?",
                question_type=QuestionType.MCQ,
                options='["Personal Protective Equipment (PPE)", "Casual clothes", "Nothing extra", "Jewellery"]',
                correct_answer="Personal Protective Equipment (PPE)",
                points=1,
                order_index=1,
            ),
            Question(
                quiz_id=quiz.id,
                question_text="It is safe to leave a running machine unattended.",
                question_type=QuestionType.TRUE_FALSE,
                options='["True", "False"]',
                correct_answer="False",
                points=1,
                order_index=2,
            ),
        ]
        db.add_all(questions)

        db.commit()
        print("Seed data created successfully.")
        print("\nDemo accounts:")
        print("  Admin:    admin@vsl.ac.ke / Admin@123")
        print("  Teacher:  teacher@vsl.ac.ke / Teacher@123")
        print("  Student1: student1@vsl.ac.ke / Student@123 (Plumbing, Level 3)")
        print("  Student2: student2@vsl.ac.ke / Student@123 (Motor Vehicle Mechanics, Level 3)")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
