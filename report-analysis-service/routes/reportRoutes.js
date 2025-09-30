// routes/reportRoutes.ui.js
import { Router } from "express";
import {
  inventoryLowStock,
  ordersSummary,
  customerHistory,
  resourcesAssignments,
  restockSummary,
  supplierOrderDetails,
  inventoryRestockTracking
} from "../controllers/reportController.js";

const r = Router();

r.get("/inventory-low-stock",        inventoryLowStock);
r.get("/orders-summary",             ordersSummary);
r.get("/customer-history",           customerHistory);
r.get("/resources-assignments",      resourcesAssignments);
r.get("/restock-summary",            restockSummary);
r.get("/supplier-order-details",     supplierOrderDetails);
r.get("/inventory-restock-tracking", inventoryRestockTracking);

export default r;
