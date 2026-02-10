import { ssService } from "./ss/ssService.js";

export function getSupplierService(supplierId) {
  switch (supplierId) {
    case "ss":
      return ssService;
    default:
      throw new Error(`Unsupported supplier: ${supplierId}`);
  }
}