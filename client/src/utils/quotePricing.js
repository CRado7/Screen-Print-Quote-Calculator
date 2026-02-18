function getPerItemAdjusterTotal(adjusters = []) {
    return (adjusters || [])
      .filter((a) => a?.type === "perItem")
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
  }
  
  function getFlatAdjusterTotal(adjusters = []) {
    return (adjusters || [])
      .filter((a) => a?.type === "flat")
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
  }
  
  function getUnitSell({ unitCost, markupType, markupPerItem, perItemAdjusters }) {
    let unitSell = Number(unitCost || 0);
  
    // markup
    if (markupType === "dollar") {
      unitSell += Number(markupPerItem || 0);
    } else {
      unitSell *= 1 + Number(markupPerItem || 0) / 100;
    }
  
    // per item adjusters (dollar)
    unitSell += Number(perItemAdjusters || 0);
  
    return unitSell;
  }
  
  export function getQuoteTotalsAdjusted(lineItems = []) {
    let totalQty = 0;
    let sellTotal = 0;
    let profit = 0;
  
    for (const li of lineItems) {
      const sizeQty = li.sizeQty || {};
      const costBySize = li.costBySize || {};
  
      const perItemAdjusters = getPerItemAdjusterTotal(li.adjusters || []);
      const flatAdjusters = getFlatAdjusterTotal(li.adjusters || []);
  
      // per-unit part
      for (const size of Object.keys(sizeQty)) {
        const qty = Number(sizeQty[size] || 0);
        if (qty <= 0) continue;
  
        const unitCost = Number(costBySize[size] || 0);
  
        const unitSell = getUnitSell({
          unitCost,
          markupType: li.markupType || "dollar",
          markupPerItem: li.markupPerItem || 0,
          perItemAdjusters,
        });
  
        totalQty += qty;
        sellTotal += unitSell * qty;
        profit += (unitSell - unitCost) * qty;
      }
  
      // flat part
      sellTotal += flatAdjusters;
      profit += flatAdjusters;
    }
  
    return { totalQty, sellTotal, profit };
  }
  

  export function getLineItemTotalsAdjusted(lineItem) {
    const sizeQty = lineItem.sizeQty || {};
    const costBySize = lineItem.costBySize || {};
  
    const adjusters = lineItem.adjusters || [];
  
    const perItemAdjusters = (adjusters || [])
      .filter((a) => a?.type === "perItem")
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
  
    const flatAdjusters = (adjusters || [])
      .filter((a) => a?.type === "flat")
      .reduce((sum, a) => sum + Number(a.amount || 0), 0);
  
    let qtyTotal = 0;
    let sellTotal = 0;
    let profit = 0;
    let costTotal = 0;
  
    for (const size of Object.keys(sizeQty)) {
      const qty = Number(sizeQty[size] || 0);
      if (qty <= 0) continue;
  
      const unitCost = Number(costBySize[size] || 0);
  
      let unitSell = unitCost;
  
      if ((lineItem.markupType || "dollar") === "dollar") {
        unitSell += Number(lineItem.markupPerItem || 0);
      } else {
        unitSell *= 1 + Number(lineItem.markupPerItem || 0) / 100;
      }
  
      unitSell += perItemAdjusters;
  
      qtyTotal += qty;
      costTotal += unitCost * qty;
      sellTotal += unitSell * qty;
      profit += (unitSell - unitCost) * qty;
    }
  
    // flat adjusters
    sellTotal += flatAdjusters;
    profit += flatAdjusters;
  
    const unitSellAvg = qtyTotal > 0 ? sellTotal / qtyTotal : 0;
  
    return {
      qtyTotal,
      sellTotal,
      profit,
      costTotal,
      unitSellAvg,
      perItemAdjusters,
      flatAdjusters,
    };
  }
  