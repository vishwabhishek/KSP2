from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import SQL_DATABASE_URI

Base = declarative_base()

class Incident(Base):
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    fir_number = Column(String(100), unique=True, nullable=False, index=True)
    district = Column(String(150), nullable=True, index=True)
    police_station = Column(String(150), nullable=True, index=True)
    timestamp = Column(DateTime, nullable=True, default=datetime.utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    ipc_sections = Column(String(500), nullable=True)
    modus_operandi_text = Column(Text, nullable=True)
    processed = Column(Boolean, default=False)
    
    # Relationship to extracted entities
    entities = relationship("Entity", back_populates="incident", cascade="all, delete-orphan")

class Entity(Base):
    __tablename__ = 'entities'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(Integer, ForeignKey('incidents.id', ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False, index=True)
    type = Column(String(50), nullable=False) # 'Suspect', 'Victim', 'Vehicle', 'Stolen_Property'
    
    incident = relationship("Incident", back_populates="entities")

# Session management helper
engine = create_engine(SQL_DATABASE_URI, connect_args={"check_same_thread": False} if SQL_DATABASE_URI.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
