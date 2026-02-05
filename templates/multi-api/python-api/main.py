from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, get_db
from app import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{settings.app_name} Python API",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "python-api"}


@app.get("/users")
async def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users


@app.get("/")
async def root():
    return {
        "service": f"{settings.app_name} Python API",
        "runtime": "Python + FastAPI",
        "orm": "SQLAlchemy",
        "endpoints": ["/", "/health", "/users"],
    }
