import datetime
import os

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

# ------------------------------------------------------------------
# Engine — Turso (production) or local SQLite (development)
# ------------------------------------------------------------------

_TURSO_URL   = os.environ.get("TURSO_DATABASE_URL")
_TURSO_TOKEN = os.environ.get("TURSO_AUTH_TOKEN")


def _build_engine():
    if _TURSO_URL and _TURSO_TOKEN:
        import libsql_experimental as libsql  # only imported when Turso vars present

        def _creator():
            conn = libsql.connect(database=_TURSO_URL, auth_token=_TURSO_TOKEN)
            # SQLAlchemy's pysqlite dialect calls create_function() on every
            # new connection to register REGEXP support. libsql doesn't
            # implement this method, so we add a no-op stub to avoid the crash.
            if not hasattr(conn, "create_function"):
                conn.create_function = lambda *args, **kwargs: None
            return conn

        return create_engine(
            "sqlite+pysqlite:///",
            creator=_creator,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    # Local dev — plain SQLite file
    return create_engine(
        "sqlite:///./recipes.db",
        connect_args={"check_same_thread": False},
    )


engine       = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class RecipeRecord(Base):
    __tablename__ = "recipes"

    id                = Column(Integer, primary_key=True, index=True)
    title             = Column(String,  nullable=False, index=True)
    description       = Column(Text,    nullable=True)
    servings          = Column(String,  nullable=True)
    prep_time         = Column(String,  nullable=True)
    cook_time         = Column(String,  nullable=True)
    ingredients       = Column(Text,    nullable=False)  # JSON string
    steps             = Column(Text,    nullable=False)  # JSON string
    source_url        = Column(String,  nullable=False)
    screenshot_base64 = Column(Text,    nullable=True)
    language          = Column(String,  nullable=False, default="en")
    created_at        = Column(DateTime, default=datetime.datetime.utcnow)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
