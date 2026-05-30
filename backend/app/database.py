import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

SQLITE_URL = "sqlite:///./sql_app.db"

def _build_engine():
    if DATABASE_URL:
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Connected to PostgreSQL database.")
            return engine
        except Exception as e:
            print(f"WARNING: Could not connect to PostgreSQL ({e}). Falling back to SQLite.")
            return create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    else:
        print("DATABASE_URL not set. Using SQLite.")
        return create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
