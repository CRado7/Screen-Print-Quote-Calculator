import { create } from "zustand";

function uid() {
  return Math.random().toString(16).slice(2);
}

export const useQuoteStore = create((set, get) => ({
  lineItems: [],

  addLineItem: (item) => {
    const id = `line_${uid()}`;
    set((state) => ({
      lineItems: [...state.lineItems, { ...item, id }]
    }));
  },

  removeLineItem: (lineItemId) => {
    set((state) => ({
      lineItems: state.lineItems.filter((li) => li.id !== lineItemId)
    }));
  },

  updateLineItem: (lineItemId, patch) => {
    set((state) => ({
      lineItems: state.lineItems.map((li) =>
        li.id === lineItemId ? { ...li, ...patch } : li
      )
    }));
  },

  clearQuote: () => set({ lineItems: [] })
}));