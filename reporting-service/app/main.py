from fastapi import FastAPI
from .controller import reports_router
from .config.settings import get_settings

def create_app() -> FastAPI:
    app = FastAPI(title=get_settings().app_name)
    app.include_router(reports_router.router)
    return app

app = create_app()
