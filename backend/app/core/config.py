from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI_First_CRM_HCP"
    API_V1_STR: str = "/api"
    
    # Database Configuration
    DATABASE_URL: str
    
    # LangGraph/LLM Configuration
    GROQ_API_KEY: str
    
    # Environment
    APP_ENV: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
