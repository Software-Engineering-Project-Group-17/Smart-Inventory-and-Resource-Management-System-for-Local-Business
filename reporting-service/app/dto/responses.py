from pydantic import BaseModel
from typing import List, Optional, Any

class InventoryLevel(BaseModel):
    item_id: str
    item_name: str
    category: Optional[str] = None
    stock: int

class SalesPoint(BaseModel):
    period: str
    total_sales: float
    orders: int

class PopularItem(BaseModel):
    item_id: str
    item_name: str
    quantity_sold: int
    revenue: float

class SummaryCard(BaseModel):
    title: str
    value: float | int
    unit: Optional[str] = None
    extra: Optional[Any] = None

class DashboardSummary(BaseModel):
    cards: List[SummaryCard]
