import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = "sqlite:///./recipes.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class RecipeRecord(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    servings = Column(String, nullable=True)
    prep_time = Column(String, nullable=True)
    cook_time = Column(String, nullable=True)
    ingredients = Column(Text, nullable=False)   # JSON string
    steps = Column(Text, nullable=False)          # JSON string
    source_url = Column(String, nullable=False)
    screenshot_base64 = Column(Text, nullable=True)
    language = Column(String, nullable=False, default="en")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
