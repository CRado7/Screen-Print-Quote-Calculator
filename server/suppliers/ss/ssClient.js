// NOTE:
// S&S API auth details vary by account + API version.
// This stub shows the pattern: server-side fetch with secrets.

export async function ssFetch(path, { method = "GET", query = {} } = {}) {
    const base = process.env.SS_API_BASE;
  
    const url = new URL(base + path);
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  
    // TODO: Replace with correct auth headers/params
    const headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": process.env.SS_API_KEY,
      "X-API-SECRET": process.env.SS_API_SECRET
    };
  
    const res = await fetch(url, { method, headers });
  
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`S&S API error ${res.status}: ${text}`);
    }
  
    return res.json();
  }