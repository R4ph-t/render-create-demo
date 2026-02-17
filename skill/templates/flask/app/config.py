import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    APP_NAME = "{{PROJECT_NAME}}"
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
