from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import APP_ENV, PORT

# Import routers
from src.routers import resume, chat

# Create FastAPI app instance
app = FastAPI(
    title="JobPrep Backend API",
    description="Backend API for JobPrep application",
    version="1.0.0",
    docs_url="/docs" if APP_ENV == "development" else None,
    redoc_url="/redoc" if APP_ENV == "development" else None
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/test")
async def test_endpoint():
    """
    Test endpoint to verify backend is running
    """
    return {"message": "Backend is up and running"}

@app.get("/healthz")
async def health_check():
    """
    Health check endpoint for deployment
    """
    return {"status": "healthy", "service": "jobprep-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=APP_ENV == "development"
    )
