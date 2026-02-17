import { create } from "zustand";

const LS_KEY = "quotes_v1";

function uid() {
  return Math.random().toString(16).slice(2);
}

function now() {
  return Date.now();
}

function loadQuotesFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQuotesToStorage(quotes) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch {
    // ignore
  }
}

export const useQuoteStore = create((set, get) => ({
  quotes: loadQuotesFromStorage(),
  activeQuoteId: null,

  // ---------- QUOTE CRUD ----------
  createQuote: (patch = {}) => {
    const currentQuotes = get().quotes;

    // Limit to 3 quotes
    if (currentQuotes.length >= 3) {
      alert("You have reached the maximum of 3 quotes. Please delete an existing quote first.");
      return null;
    }

    const id = `quote_${uid()}`;

    const quote = {
      id,
      name: patch.name || "Untitled Quote",
      createdAt: now(),
      updatedAt: now(),
      customer: {
        name: "",
        email: "",
        company: "",
        phone: "",
        ...(patch.customer || {}),
      },
      notes: patch.notes || "",
      lineItems: [],
    };

    set((state) => {
      const quotes = [quote, ...state.quotes];
      saveQuotesToStorage(quotes);
      return { quotes, activeQuoteId: id };
    });

    return id;
  },

  deleteQuote: (quoteId) => {
    set((state) => {
      const quotes = state.quotes.filter((q) => q.id !== quoteId);
      saveQuotesToStorage(quotes);

      const activeQuoteId =
        state.activeQuoteId === quoteId ? null : state.activeQuoteId;

      return { quotes, activeQuoteId };
    });
  },

  setActiveQuote: (quoteId) => set({ activeQuoteId: quoteId }),

  updateQuote: (quoteId, patch) => {
    set((state) => {
      const quotes = state.quotes.map((q) =>
        q.id === quoteId
          ? { ...q, ...patch, updatedAt: now() }
          : q
      );
      saveQuotesToStorage(quotes);
      return { quotes };
    });
  },

  // ---------- LINE ITEM CRUD ----------
  addLineItemToQuote: (quoteId, item) => {
    console.log("ADDING ITEM TO QUOTE:", item);
console.log("ADDING skuMetaBySize:", item?.skuMetaBySize);
console.log("ADDING skuMetaBySize keys:", Object.keys(item?.skuMetaBySize || {}));
    const lineId = `line_${uid()}`;


    set((state) => {
      const quotes = state.quotes.map((q) => {
        if (q.id !== quoteId) return q;

        return {
          ...q,
          updatedAt: now(),
          lineItems: [...q.lineItems, { ...item, id: lineId }],
        };
      });

      saveQuotesToStorage(quotes);
      return { quotes };
    });

    return lineId;
  },

  removeLineItem: (quoteId, lineItemId) => {
    set((state) => {
      const quotes = state.quotes.map((q) => {
        if (q.id !== quoteId) return q;
        return {
          ...q,
          updatedAt: now(),
          lineItems: q.lineItems.filter((li) => li.id !== lineItemId),
        };
      });

      saveQuotesToStorage(quotes);
      return { quotes };
    });
  },

  updateLineItem: (quoteId, lineItemId, patch) => {
    set((state) => {
      const quotes = state.quotes.map((q) => {
        if (q.id !== quoteId) return q;

        return {
          ...q,
          updatedAt: now(),
          lineItems: q.lineItems.map((li) =>
            li.id === lineItemId ? { ...li, ...patch } : li
          ),
        };
      });

      saveQuotesToStorage(quotes);
      return { quotes };
    });
  },
}));
