import { useState, useEffect } from "react"
import { getRecords } from "../helpers/records"

const SECTIONS = [
	{ key: "matematicas", label: "Matemáticas", color: "indigo" },
	{ key: "tablas",      label: "Tablas",       color: "green"  },
]

const scoreColor = (s) =>
	s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-500" : "text-red-500"

const scoreBg = (s) =>
	s >= 80 ? "bg-green-100 text-green-700" : s >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"

function SectionRecords({ label, records, color }) {
	const ring = color === "indigo" ? "border-indigo-200" : "border-green-200"
	const title = color === "indigo" ? "text-indigo-700" : "text-green-700"
	const dot = color === "indigo" ? "bg-indigo-500" : "bg-green-500"

	return (
		<div className={`bg-white rounded-2xl border-2 ${ring} shadow-sm overflow-hidden`}>
			<div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
				<span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
				<h2 className={`text-lg font-bold ${title}`}>{label}</h2>
				<span className="ml-auto text-xs text-gray-400">{records.length} registro{records.length !== 1 ? "s" : ""}</span>
			</div>

			{records.length === 0 ? (
				<p className="text-gray-400 text-sm text-center py-10">Sin registros aún</p>
			) : (
				<div className="divide-y divide-gray-50">
					{records.map((r, i) => (
						<div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition">
							<span className="text-xs text-gray-300 w-5 text-right">{i + 1}</span>
							<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scoreBg(r.score)}`}>
								{r.score}%
							</span>
							<span className="font-mono text-sm text-gray-500">⏱ {r.time}</span>
							<span className="ml-auto text-xs text-gray-400">{r.date}</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export const Home = () => {
	const [records, setRecords] = useState({})

	useEffect(() => {
		setRecords(getRecords())
	}, [])

	return (
		<div className="min-h-screen bg-gray-50 py-10 px-6">
			<div className="max-w-2xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">Mis registros</h1>
					<p className="text-gray-400 text-sm mt-1">Historial de pruebas completadas</p>
				</div>

				<div className="flex flex-col gap-6">
					{SECTIONS.map(({ key, label, color }) => (
						<SectionRecords
							key={key}
							label={label}
							records={records[key] ?? []}
							color={color}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
