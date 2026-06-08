import { createHash } from "node:crypto";

const BITUNIX_API_KEY      = process.env.BITUNIX_API_KEY || "e6aea4343b38c0568e524558020afbe2";
const BITUNIX_SECRET       = process.env.BITUNIX_SECRET  || "fb29ee282e536d6dc05a7c3fa7479146";
const BITUNIX_FUTURES_BASE = "https://fapi.bitunix.com";
const BITUNIX_SPOT_BASE    = "https://openapi.bitunix.com";

export default async function handler(req, res) {
    // CORS – permite llamadas desde el mismo dominio y localhost
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const nonce     = String(Math.floor(Math.random() * 900000 + 100000));
    const timestamp = String(Date.now());

    // Reconstruir el path de destino desde los segmentos catch-all
    const segments   = req.query.path || [];
    const targetPath = "/" + (Array.isArray(segments) ? segments.join("/") : segments);

    // Parsear query string (req.url contiene la URL completa de la request)
    const parsed = new URL(req.url, "http://localhost");

    // Ordenar query params ASCII ascendente para la firma (igual que el proxy de Vite)
    const queryParams = [...parsed.searchParams.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}${v}`)
        .join("");

    const body      = "";
    const digest    = createHash("sha256")
        .update(nonce + timestamp + BITUNIX_API_KEY + queryParams + body)
        .digest("hex");
    const signature = createHash("sha256")
        .update(digest + BITUNIX_SECRET)
        .digest("hex");

    const base      = targetPath.startsWith("/api/spot/") ? BITUNIX_SPOT_BASE : BITUNIX_FUTURES_BASE;
    const targetUrl = `${base}${targetPath}${parsed.search}`;

    try {
        const upstream = await fetch(targetUrl, {
            method: req.method,
            headers: {
                "api-key"      : BITUNIX_API_KEY,
                "sign"         : signature,
                "nonce"        : nonce,
                "timestamp"    : timestamp,
                "Content-Type" : "application/json",
                "Accept"       : "application/json",
                "User-Agent"   : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            },
        });

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
