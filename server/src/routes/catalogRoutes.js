import { Router } from "express";
import { getSupplierService } from "../../suppliers/index.js";

export const catalogRoutes = Router();

// GET /api/catalog/search?supplier=ss&q=shirt
catalogRoutes.get("/search", async (req, res, next) => {
  try {
    const supplier = req.query.supplier || "ss";
    const q = req.query.q || "";

    const svc = getSupplierService(supplier);
    const results = await svc.searchProducts({ q });

    res.json({ results });
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/products/:productId?supplier=ss
catalogRoutes.get("/products/:productId", async (req, res, next) => {
  try {
    const supplier = req.query.supplier || "ss";
    const { productId } = req.params;

    const svc = getSupplierService(supplier);
    const product = await svc.getProductById({ productId });

    res.json({ product });
  } catch (err) {
    next(err);
  }
});