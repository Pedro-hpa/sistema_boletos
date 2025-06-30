from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Usa a variável DATABASE_URL definida no ambiente
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://banco_boletos_user:PDnPFhK7EAvkClhNXlCTYkaK6HCR8ovE@dpg-d1hdvhidbo4c73da42pg-a/banco_boletos")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()
