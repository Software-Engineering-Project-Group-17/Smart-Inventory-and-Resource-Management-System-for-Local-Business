from ..repository.reports_repository import ReportsRepository
from ..config.db import get_db

class ReportsService:
    def __init__(self): self.repo = ReportsRepository(get_db())
    async def inventory_levels(self, category): return await self.repo.inventory_levels(category)
    async def sales_trends(self, df, dt, cat, bucket): return await self.repo.sales_trends(df, dt, cat, bucket)
    async def popular_items(self, df, dt, cat, limit=10): return await self.repo.popular_items(df, dt, cat, limit)
    async def dashboard_summary(self, df, dt, cat): return await self.repo.dashboard_summary(df, dt, cat)
