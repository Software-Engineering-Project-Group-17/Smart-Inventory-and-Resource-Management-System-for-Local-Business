# Repository with Mongo aggregation (see previous detailed implementation)
# Placeholder content here - full queries already shared
class ReportsRepository:
    def __init__(self, db): self.db = db
    async def inventory_levels(self, category): return []
    async def sales_trends(self, df, dt, cat, bucket): return []
    async def popular_items(self, df, dt, cat, limit=10): return []
    async def dashboard_summary(self, df, dt, cat): return {"cards":[]}
