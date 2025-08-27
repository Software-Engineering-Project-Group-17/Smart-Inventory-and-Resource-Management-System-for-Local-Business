from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DateRange(BaseModel):
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    category: Optional[str] = None
    bucket: Optional[str] = "month"
