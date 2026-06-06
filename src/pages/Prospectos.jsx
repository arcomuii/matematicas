import { useState, useEffect } from "react";

const MIN_CHANGE = 1;
const MAX_CHANGE = 5;

function fmt(n, decimals = 2) {
    if (n == null || isNaN(n)) return "—";
    return Number(n).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function fmtBig(n) {
    if (!n) return "—";
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)         return `$${(n / 1_000).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
}

export function Prospectos() {
    const [coins, setCoins]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [search, setSearch]     = useState("");

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                setError(null);

                // Traemos hasta 500 monedas (2 páginas de 250) para mayor cobertura
                const [p1, p2] = await Promise.all([
                    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=24h"),
                    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2&price_change_percentage=24h"),
                ]);

                const [data1, data2] = await Promise.all([p1.json(), p2.json()]);
                const all = [...(Array.isArray(data1) ? data1 : []), ...(Array.isArray(data2) ? data2 : [])];

                const filtered = all
                    .filter(c => {
                        const chg = c.price_change_percentage_24h;
                        return chg != null && chg >= MIN_CHANGE && chg <= MAX_CHANGE;
                    })
                    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);

                setCoins(filtered);
                setLastUpdate(new Date());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
        const id = setInterval(fetchCoins, 5 * 60_000);
        return () => clearInterval(id);
    }, []);

    const filtered = coins.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Prospectos</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Criptos con +{MIN_CHANGE}% a +{MAX_CHANGE}% en 24h · actualiza cada 5 min
                        {lastUpdate && <span> · {lastUpdate.toLocaleTimeString("es-MX")}</span>}
                    </p>
                </div>

                {loading && (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-lg">
                        Cargando prospectos...
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
                        <p className="font-semibold mb-1">Error al obtener datos</p>
                        <p className="text-sm font-mono">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="flex items-center gap-4 mb-5">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o símbolo..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm w-72"
                            />
                            <span className="text-sm text-gray-400">
                                {filtered.length} moneda{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center text-gray-400 py-20">
                                Ninguna moneda en el rango +{MIN_CHANGE}%–+{MAX_CHANGE}% en este momento.
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50">
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Moneda</th>
                                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">24h %</th>
                                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Cap. de mercado</th>
                                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Volumen 24h</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((coin, i) => (
                                                <tr key={coin.id} className="border-b border-gray-50 hover:bg-green-50 transition-colors">
                                                    <td className="px-5 py-3.5 text-gray-400 text-xs">{coin.market_cap_rank ?? i + 1}</td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={coin.image}
                                                                alt={coin.name}
                                                                className="w-7 h-7 rounded-full"
                                                                onError={e => e.target.style.display = 'none'}
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{coin.name}</p>
                                                                <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-mono text-gray-700">
                                                        ${fmt(coin.current_price, coin.current_price < 1 ? 6 : 2)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <span className="font-semibold text-green-600">
                                                            ▲ {fmt(coin.price_change_percentage_24h)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right text-gray-500">
                                                        {fmtBig(coin.market_cap)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right text-gray-500">
                                                        {fmtBig(coin.total_volume)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                                    Fuente: CoinGecko · Filtro: +{MIN_CHANGE}% a +{MAX_CHANGE}% en 24h
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
