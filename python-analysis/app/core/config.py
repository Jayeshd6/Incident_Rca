from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "python-analysis"
    python_port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()