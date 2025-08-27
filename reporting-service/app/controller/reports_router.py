from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/ping")
async def ping(): return {"msg":"ok"}
