const COINGECKO_BASE = "https://api.coingecko.com";
const CG_API_KEY     = process.env.CG_API_KEY || "";   // opcional: demo key de CoinGecko

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin",  "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const segments   = req.query.path || [];
    const targetPath = "/" + (Array.isArray(segments) ? segments.join("/") : segments);

    const parsed = new URL(req.url, "http://localhost");
    const targetUrl = `${COINGECKO_BASE}${targetPath}${parsed.search}`;

    const headers = {
        "Accept"     : "application/json",
        "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };
    if (CG_API_KEY) headers["x-cg-demo-api-key"] = CG_API_KEY;

    try {
        const upstream = await fetch(targetUrl, { headers });
        const text = await upstream.text();
        res.setHeader("Content-Type", "application/json");
        res.status(upstream.status);
        try {
            res.json(JSON.parse(text));
        } catch {
            res.json({ raw: text });
        }
    } catch (err) {
        res.status(502).json({ error: err.message, url: targetUrl });
    }
}
