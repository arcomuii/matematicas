import { useState, useEffect, useRef } from "react"
import { saveRecord } from "../helpers/records"

function buildQuestions() {
	const questions = []
	for (let table = 1; table <= 9; table++) {
		for (let factor = 1; factor <= 10; factor++) {
			questions.push({ table, factor, answer: table * factor })
		}
	}
	return questions
}

const QUESTIONS = buildQuestions()
const TOTAL     = QUESTIONS.length

export function Tablas() {
	const [index,       setIndex]       = useState(0)
	const [input,       setInput]       = useState("")
	const [status,      setStatus]      = useState(null)  // null | "correct" | "wrong"
	const [score,       setScore]       = useState(0)
	const [done,        setDone]        = useState(false)
	const [wrongCount,  setWrongCount]  = useState(0)
	const [seconds,     setSeconds]     = useState(0)
	const inputRef  = useRef(null)
	const buttonRef = useRef(null)
	const timerRef  = useRef(null)

	useEffect(() => {
		timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
		return () => clearInterval(timerRef.current)
	}, [])

	useEffect(() => {
		if (done) clearInterval(timerRef.current)
	}, [done])

	const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

	const current = QUESTIONS[index]

	useEffect(() => {
		if (done) return
		if (status === null) inputRef.current?.focus()
		else buttonRef.current?.focus()
	}, [index, status, done])

	const handleSubmit = (e) => {
		e.preventDefault()
		if (status !== null) {
			advance()
			return
		}
		const val = parseInt(input)
		if (isNaN(val)) return
		if (val === current.answer) {
			setStatus("correct")
			setScore(s => s + 1)
		} else {
			setStatus("wrong")
			setWrongCount(w => w + 1)
		}
	}

	const advance = () => {
		const next = index + 1
		if (next >= TOTAL) {
			saveRecord('tablas', Math.round((score / TOTAL) * 100), seconds)
			setDone(true)
		} else {
			setIndex(next)
			setInput("")
			setStatus(null)
		}
	}

	const reset = () => {
		setIndex(0)
		setInput("")
		setStatus(null)
		setScore(0)
		setWrongCount(0)
		setDone(false)
		setSeconds(0)
		clearInterval(timerRef.current)
		timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
	}

	const pct        = Math.round((score / TOTAL) * 100)
	const tablesDone = Math.floor(index / 10)
	const qInTable   = (index % 10) + 1

	if (done) {
		const color = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-500" : "text-red-500"
		const bg    = pct >= 80 ? "bg-green-50 border-green-300" : pct >= 60 ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300"
		const msg   = pct === 100 ? "¡Perfecto! 🏆" : pct >= 80 ? "¡Muy bien! 🎉" : pct >= 60 ? "Sigue practicando 💪" : "Hay que repasar más 📚"

		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
				<div className="max-w-md w-full text-center">
					<div className={`rounded-2xl border-2 p-10 mb-6 ${bg}`}>
						<p className="text-6xl mb-4">🧮</p>
						<p className={`text-8xl font-black mb-2 ${color}`}>{pct}%</p>
						<p className="text-lg text-gray-600 mb-1">
							{score} correctas · {wrongCount} incorrectas · de {TOTAL}
						</p>
						<p className="text-2xl font-bold text-gray-500 mt-2">⏱ {fmt(seconds)}</p>
						<p className={`text-xl font-bold mt-4 ${color}`}>{msg}</p>
					</div>
					<button
						onClick={reset}
						className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition active:scale-95"
					>
						Intentar de nuevo
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-10 px-4">
			<div className="max-w-md mx-auto">

				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-indigo-700 mb-1">Tablas de multiplicar</h1>
					<p className="text-gray-400 text-sm">Del 1 al 9 · {TOTAL} preguntas</p>
				</div>

				{/* Progreso general */}
				<div className="mb-6">
					<div className="flex justify-between text-xs text-gray-400 mb-1">
						<span>Pregunta {index + 1} de {TOTAL}</span>
						<span className="flex gap-3">
							<span>⏱ {fmt(seconds)}</span>
							<span>{score} correctas</span>
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-indigo-500 h-2 rounded-full transition-all"
							style={{ width: `${((index) / TOTAL) * 100}%` }}
						/>
					</div>
				</div>

				{/* Indicador de tabla actual */}
				<div className="flex gap-1 justify-center mb-6">
					{Array.from({ length: 9 }, (_, i) => (
						<div
							key={i}
							className={`flex-1 h-1.5 rounded-full transition-all ${
								i < tablesDone
									? "bg-green-400"
									: i === tablesDone
									? "bg-indigo-500"
									: "bg-gray-200"
							}`}
						/>
					))}
				</div>

				{/* Tarjeta de pregunta */}
				<form onSubmit={handleSubmit}>
					<div className={`bg-white rounded-2xl shadow-sm border-2 p-8 mb-4 text-center transition-all ${
						status === "correct" ? "border-green-400 bg-green-50"
						: status === "wrong"   ? "border-red-400 bg-red-50"
						: "border-gray-100"
					}`}>
						<p className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-4">
							Tabla del {current.table} · {qInTable}/10
						</p>

						<p className="font-mono text-5xl font-black text-indigo-700 mb-6">
							{current.table} × {current.factor} =
							{status !== null && (
								<span className={status === "correct" ? " text-green-600" : " text-red-500"}>
									{" "}{current.answer}
								</span>
							)}
						</p>

						{status === null ? (
							<input
								ref={inputRef}
								type="number"
								value={input}
								onChange={e => setInput(e.target.value)}
								className="w-36 text-center text-3xl font-mono font-bold border-2 border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 bg-white"
								placeholder="?"
								autoComplete="off"
							/>
						) : (
							<div className="text-2xl font-bold mt-2">
								{status === "correct"
									? <span className="text-green-600">✓ ¡Correcto!</span>
									: <span className="text-red-500">✗ Era {current.answer}</span>
								}
							</div>
						)}
					</div>

					<button
						ref={buttonRef}
						type="submit"
						className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition active:scale-95 focus:outline-none ${
							status === null
								? "bg-indigo-600 hover:bg-indigo-700"
								: "bg-gray-700 hover:bg-gray-800"
						}`}
					>
						{status === null ? "Comprobar" : index + 1 < TOTAL ? "Siguiente →" : "Ver resultado"}
					</button>
				</form>

			</div>
		</div>
	)
}
