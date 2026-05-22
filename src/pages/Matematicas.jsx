import { useState, useEffect, useRef } from "react"
import { saveRecord } from "../helpers/records"

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function getDigits(n) {
	const abs = Math.abs(n)
	return {
		h: Math.floor(abs / 100),
		t: Math.floor((abs % 100) / 10),
		u: abs % 10,
	}
}

const TEMPLATES = [
	(a, b) => ({ text: `María tiene ${a} cajas con ${b} manzanas cada una. ¿Cuántas manzanas tiene en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `En una tienda hay ${a} estantes con ${b} productos en cada uno. ¿Cuántos productos hay en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `Un autobús hace ${a} viajes al día y lleva ${b} pasajeros en cada viaje. ¿Cuántos pasajeros transporta en un día?`, answer: a * b, a, b }),
	(a, b) => ({ text: `Una granja tiene ${a} gallinas y cada una pone ${b} huevos por semana. ¿Cuántos huevos se recolectan en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `En el salón hay ${a} mesas con ${b} sillas cada una. ¿Cuántas sillas hay en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `Un maestro reparte ${b} lápices a cada uno de sus ${a} alumnos. ¿Cuántos lápices reparte en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `Hay ${a} paquetes de galletas con ${b} galletas cada uno. ¿Cuántas galletas hay en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `Una tienda recibe ${a} cajas con ${b} refrescos cada una. ¿Cuántos refrescos recibe en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `Pedro tiene ${a} amigos y a cada uno le regala ${b} estampas. ¿Cuántas estampas regala en total?`, answer: a * b, a, b }),
	(a, b) => ({ text: `En el cine hay ${a} filas con ${b} asientos cada una. ¿Cuántos asientos hay en total?`, answer: a * b, a, b }),
]

function generateProblems() {
	const sumas = Array.from({ length: 5 }, () => {
		const a = rand(100, 999)
		const b = rand(100, 999)
		return { a, b, answer: a + b }
	})

	const restas = Array.from({ length: 5 }, () => {
		const a = rand(300, 999)
		const b = rand(100, a - 1)
		return { a, b, answer: a - b }
	})

	const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 5)
	const multiplicaciones = shuffled.map(tmpl => {
		const a = rand(2, 20)
		const b = rand(2, 15)
		return tmpl(a, b)
	})

	return { sumas, restas, multiplicaciones }
}

function InputCell({ value, onChange, disabled, correct }) {
	let borderClass = "border-gray-200 focus:border-indigo-400 bg-white"
	if (disabled && correct === true)  borderClass = "border-green-400 bg-green-50 text-green-700"
	if (disabled && correct === false) borderClass = "border-red-400 bg-red-50 text-red-700"

	return (
		<input
			type="number"
			value={value}
			onChange={onChange}
			disabled={disabled}
			className={`w-28 border-2 rounded-lg px-3 py-1.5 text-center font-mono text-lg outline-none transition ${borderClass}`}
		/>
	)
}

// ─── Column header label ───
function ColHeader({ label, color }) {
	const colors = {
		C: "bg-purple-100 text-purple-700",
		D: "bg-yellow-100 text-yellow-700",
		U: "bg-orange-100 text-orange-700",
	}
	return (
		<div className={`w-10 h-8 flex items-center justify-center rounded-md text-xs font-bold ${colors[color] ?? "bg-gray-100 text-gray-600"}`}>
			{label}
		</div>
	)
}

// ─── Suma step-by-step guide ───
function SumaGuide({ a, b }) {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState(0)

	const dA = getDigits(a)
	const dB = getDigits(b)
	const dR = getDigits(a + b)

	const sumU = dA.u + dB.u
	const carryT = Math.floor(sumU / 10)
	const writeU = sumU % 10

	const sumT = dA.t + dB.t + carryT
	const carryH = Math.floor(sumT / 10)
	const writeT = sumT % 10

	const sumH = dA.h + dB.h + carryH
	const writeH = sumH % 10
	const extraC = Math.floor(sumH / 10)

	const steps = [
		{
			title: "Paso 1: Suma las unidades 🟠",
			body: (
				<div className="space-y-2">
					<p className="text-gray-600">Empieza por la columna de las <strong className="text-orange-600">Unidades</strong>.</p>
					<div className="flex items-end gap-1 font-mono text-2xl justify-center my-3">
						<span className="text-orange-600 font-bold">{dA.u}</span>
						<span className="text-gray-400 text-lg">+</span>
						<span className="text-orange-600 font-bold">{dB.u}</span>
						<span className="text-gray-400 text-lg">=</span>
						<span className="text-indigo-700 font-bold">{sumU}</span>
					</div>
					{carryT > 0 ? (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
							<strong>{sumU}</strong> tiene dos dígitos. Escribimos <strong>{writeU}</strong> en unidades
							y <strong>llevamos {carryT}</strong> a las decenas.
						</div>
					) : (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
							El resultado es <strong>{writeU}</strong>. Lo escribimos en las unidades. No hay llevada.
						</div>
					)}
				</div>
			),
		},
		{
			title: "Paso 2: Suma las decenas 🟡",
			body: (
				<div className="space-y-2">
					<p className="text-gray-600">Ahora la columna de las <strong className="text-yellow-600">Decenas</strong>.</p>
					<div className="flex items-end gap-1 font-mono text-2xl justify-center my-3">
						<span className="text-yellow-600 font-bold">{dA.t}</span>
						<span className="text-gray-400 text-lg">+</span>
						<span className="text-yellow-600 font-bold">{dB.t}</span>
						{carryT > 0 && <><span className="text-gray-400 text-lg">+</span><span className="text-orange-500 font-bold text-lg">{carryT}</span><span className="text-gray-400 text-xs">(llevada)</span></>}
						<span className="text-gray-400 text-lg">=</span>
						<span className="text-indigo-700 font-bold">{sumT}</span>
					</div>
					{carryH > 0 ? (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
							Escribimos <strong>{writeT}</strong> en decenas y <strong>llevamos {carryH}</strong> a las centenas.
						</div>
					) : (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
							Escribimos <strong>{writeT}</strong> en las decenas. No hay llevada.
						</div>
					)}
				</div>
			),
		},
		{
			title: "Paso 3: Suma las centenas 🟣",
			body: (
				<div className="space-y-2">
					<p className="text-gray-600">Por último, la columna de las <strong className="text-purple-600">Centenas</strong>.</p>
					<div className="flex items-end gap-1 font-mono text-2xl justify-center my-3">
						<span className="text-purple-600 font-bold">{dA.h}</span>
						<span className="text-gray-400 text-lg">+</span>
						<span className="text-purple-600 font-bold">{dB.h}</span>
						{carryH > 0 && <><span className="text-gray-400 text-lg">+</span><span className="text-yellow-500 font-bold text-lg">{carryH}</span><span className="text-gray-400 text-xs">(llevada)</span></>}
						<span className="text-gray-400 text-lg">=</span>
						<span className="text-indigo-700 font-bold">{sumH}</span>
					</div>
					{extraC > 0 && (
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
							Escribimos <strong>{writeH}</strong> en centenas y <strong>{extraC}</strong> en la columna de miles.
						</div>
					)}
				</div>
			),
		},
	]

	return (
		<div className="mt-3">
			<button
				onClick={() => { setOpen(o => !o); setStep(0) }}
				className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition"
			>
				{open ? "Ocultar guía" : "¿Cómo se resuelve? →"}
			</button>
			{open && (
				<div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
					<div className="flex gap-2 mb-4 justify-center">
						{["U 🟠", "D 🟡", "C 🟣"].map((lbl, i) => (
							<div key={i} className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${step === i ? "bg-indigo-600 text-white" : "bg-white text-indigo-400 border border-indigo-200"}`} onClick={() => setStep(i)}>
								{lbl}
							</div>
						))}
					</div>

					<div className="min-h-[140px]">
						<p className="text-sm font-bold text-indigo-700 mb-2">{steps[step].title}</p>
						{steps[step].body}
					</div>

					<div className="flex justify-between mt-4">
						<button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="text-xs px-4 py-1.5 rounded-full border border-indigo-300 text-indigo-600 disabled:opacity-30 hover:bg-indigo-100 transition">
							← Anterior
						</button>
						<button disabled={step === steps.length - 1} onClick={() => setStep(s => s + 1)} className="text-xs px-4 py-1.5 rounded-full bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition">
							Siguiente →
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

// ─── Resta step-by-step guide ───
function RestaGuide({ a, b }) {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState(0)

	const dA = { ...getDigits(a) }
	const dB = getDigits(b)

	// Simulate borrowing
	let { h: ah, t: at, u: au } = dA
	let { h: bh, t: bt, u: bu } = dB

	// Units
	const borrowedForU = au < bu
	if (borrowedForU) { au += 10; at -= 1 }
	const resU = au - bu

	// Tens
	const borrowedForT = at < bt
	if (borrowedForT) { at += 10; ah -= 1 }
	const resT = at - bt

	// Hundreds
	const resH = ah - bh

	const origDig = getDigits(a)

	const steps = [
		{
			title: "Paso 1: Resta las unidades 🟠",
			body: (
				<div className="space-y-2">
					<p className="text-gray-600">Empieza por las <strong className="text-orange-600">Unidades</strong>.</p>
					<div className="flex items-end gap-1 font-mono text-2xl justify-center my-3">
						<span className="text-orange-600 font-bold">{origDig.u}</span>
						<span className="text-gray-400 text-lg">−</span>
						<span className="text-orange-600 font-bold">{bu}</span>
					</div>
					{borrowedForU ? (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 space-y-1">
							<p>⚠️ <strong>{origDig.u}</strong> es menor que <strong>{bu}</strong>, no podemos restar directamente.</p>
							<p>Le <strong>pedimos prestado 10</strong> a las decenas. Ahora tenemos <strong>{origDig.u} + 10 = {au}</strong>.</p>
							<p className="font-bold">{au} − {bu} = {resU} ✅</p>
						</div>
					) : (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
							{origDig.u} ≥ {bu}, podemos restar directamente: <strong>{origDig.u} − {bu} = {resU}</strong>
						</div>
					)}
				</div>
			),
		},
		{
			title: "Paso 2: Resta las decenas 🟡",
			body: (
				<div className="space-y-2">
					<p className="text-gray-600">Ahora las <strong className="text-yellow-600">Decenas</strong>.</p>
					{borrowedForU && (
						<div className="text-xs bg-orange-100 rounded-lg px-3 py-1 text-orange-700 mb-2">
							Recuerda: le prestamos 1 a las decenas de {a}, así que ahora valen <strong>{origDig.t} − 1 = {origDig.t - 1}</strong>.
						</div>
					)}
					<div className="flex items-end gap-1 font-mono text-2xl justify-center my-3">
						<span className="text-yellow-600 font-bold">{borrowedForU ? origDig.t - 1 : origDig.t}</span>
						<span className="text-gray-400 text-lg">−</span>
						<span className="text-yellow-600 font-bold">{bt}</span>
					</div>
					{borrowedForT ? (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 space-y-1">
							<p>⚠️ <strong>{borrowedForU ? origDig.t - 1 : origDig.t}</strong> es menor que <strong>{bt}</strong>.</p>
							<p>Le pedimos prestado 10 a las centenas. Ahora tenemos <strong>{(borrowedForU ? origDig.t - 1 : origDig.t) + 10}</strong>.</p>
							<p className="font-bold">{(borrowedForU ? origDig.t - 1 : origDig.t) + 10} − {bt} = {resT} ✅</p>
						</div>
					) : (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
							Podemos restar directamente: <strong>{borrowedForU ? origDig.t - 1 : origDig.t} − {bt} = {resT}</strong>
						</div>
					)}
				</div>
			),
		},
		{
			title: "Paso 3: Resta las centenas 🟣",
			body: (
				<div className="space-y-2">
					<p className="text-gray-600">Por último las <strong className="text-purple-600">Centenas</strong>.</p>
					{borrowedForT && (
						<div className="text-xs bg-yellow-100 rounded-lg px-3 py-1 text-yellow-700 mb-2">
							Le prestamos 1 a las centenas de {a}, así que ahora valen <strong>{origDig.h} − 1 = {origDig.h - 1}</strong>.
						</div>
					)}
					<div className="flex items-end gap-1 font-mono text-2xl justify-center my-3">
						<span className="text-purple-600 font-bold">{borrowedForT ? origDig.h - 1 : origDig.h}</span>
						<span className="text-gray-400 text-lg">−</span>
						<span className="text-purple-600 font-bold">{bh}</span>
						<span className="text-gray-400 text-lg">=</span>
						<span className="text-indigo-700 font-bold">{resH}</span>
					</div>
				</div>
			),
		},
	]

	return (
		<div className="mt-3">
			<button
				onClick={() => { setOpen(o => !o); setStep(0) }}
				className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition"
			>
				{open ? "Ocultar guía" : "¿Cómo se resuelve? →"}
			</button>
			{open && (
				<div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
					<div className="flex gap-2 mb-4 justify-center">
						{["U 🟠", "D 🟡", "C 🟣"].map((lbl, i) => (
							<div key={i} className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${step === i ? "bg-indigo-600 text-white" : "bg-white text-indigo-400 border border-indigo-200"}`} onClick={() => setStep(i)}>
								{lbl}
							</div>
						))}
					</div>
					<div className="min-h-[160px]">
						<p className="text-sm font-bold text-indigo-700 mb-2">{steps[step].title}</p>
						{steps[step].body}
					</div>
					<div className="flex justify-between mt-4">
						<button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="text-xs px-4 py-1.5 rounded-full border border-indigo-300 text-indigo-600 disabled:opacity-30 hover:bg-indigo-100 transition">
							← Anterior
						</button>
						<button disabled={step === steps.length - 1} onClick={() => setStep(s => s + 1)} className="text-xs px-4 py-1.5 rounded-full bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition">
							Siguiente →
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

// ─── Multiplicación step-by-step guide ───
function MultiGuide({ a, b }) {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState(0)

	// Ensure a is the larger factor for distributive decomposition
	const big = a >= b ? a : b
	const small = a >= b ? b : a

	const bigH = Math.floor(big / 10) * 10
	const bigU = big % 10
	const isTwoDigit = big >= 10

	const partH = bigH * small
	const partU = bigU * small
	const total = big * small

	const steps = isTwoDigit
		? [
			{
				title: "Paso 1: Descompon el número mayor ✂️",
				body: (
					<div className="space-y-2">
						<p className="text-gray-600">Separamos <strong className="text-indigo-700">{big}</strong> en decenas y unidades.</p>
						<div className="flex items-center gap-3 justify-center my-4 font-mono text-2xl">
							<span className="text-indigo-700 font-bold">{big}</span>
							<span className="text-gray-400">=</span>
							<span className="text-yellow-600 font-bold">{bigH}</span>
							<span className="text-gray-400">+</span>
							<span className="text-orange-600 font-bold">{bigU}</span>
						</div>
						<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
							Ahora multiplicaremos <strong>{small}</strong> por <strong className="text-yellow-700">{bigH}</strong> y por <strong className="text-orange-700">{bigU}</strong> por separado.
						</div>
					</div>
				),
			},
			{
				title: `Paso 2: Multiplica ${small} × ${bigH} 🟡`,
				body: (
					<div className="space-y-2">
						<p className="text-gray-600">Multiplicamos <strong>{small}</strong> por las <strong className="text-yellow-600">decenas ({bigH})</strong>.</p>
						<div className="flex items-center gap-2 justify-center my-4 font-mono text-2xl">
							<span className="text-yellow-600 font-bold">{bigH}</span>
							<span className="text-gray-400">×</span>
							<span className="text-indigo-700 font-bold">{small}</span>
							<span className="text-gray-400">=</span>
							<span className="text-green-600 font-bold">{partH}</span>
						</div>
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
							Truco: <strong>{Math.floor(bigH / 10)} × {small} = {Math.floor(bigH / 10) * small}</strong>, y como son decenas le ponemos un 0 → <strong>{partH}</strong>
						</div>
					</div>
				),
			},
			{
				title: `Paso 3: Multiplica ${small} × ${bigU} 🟠`,
				body: (
					<div className="space-y-2">
						<p className="text-gray-600">Ahora multiplicamos <strong>{small}</strong> por las <strong className="text-orange-600">unidades ({bigU})</strong>.</p>
						<div className="flex items-center gap-2 justify-center my-4 font-mono text-2xl">
							<span className="text-orange-600 font-bold">{bigU}</span>
							<span className="text-gray-400">×</span>
							<span className="text-indigo-700 font-bold">{small}</span>
							<span className="text-gray-400">=</span>
							<span className="text-green-600 font-bold">{partU}</span>
						</div>
					</div>
				),
			},
			{
				title: "Paso 4: Suma los dos resultados ➕",
				body: (
					<div className="space-y-2">
						<p className="text-gray-600">Por último, sumamos las dos partes.</p>
						<div className="flex items-center gap-2 justify-center my-4 font-mono text-2xl">
							<span className="text-yellow-600 font-bold">{partH}</span>
							<span className="text-gray-400">+</span>
							<span className="text-orange-600 font-bold">{partU}</span>
							<span className="text-gray-400">=</span>
							<span className="text-gray-400">?</span>
						</div>
					</div>
				),
			},
		]
		: [
			{
				title: "Multiplicación directa ⚡",
				body: (
					<div className="space-y-2">
						<p className="text-gray-600">Ambos números son de un solo dígito. ¡Podemos multiplicar directo!</p>
						<div className="flex items-center gap-2 justify-center my-4 font-mono text-2xl">
							<span className="text-indigo-700 font-bold">{a}</span>
							<span className="text-gray-400">×</span>
							<span className="text-indigo-700 font-bold">{b}</span>
							<span className="text-gray-400">=</span>
							<span className="text-gray-400">?</span>
						</div>
					</div>
				),
			},
		]

	return (
		<div className="mt-3">
			<button
				onClick={() => { setOpen(o => !o); setStep(0) }}
				className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition"
			>
				{open ? "Ocultar guía" : "¿Cómo se resuelve? →"}
			</button>
			{open && (
				<div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
					{isTwoDigit && (
						<div className="flex gap-1 mb-4 justify-center flex-wrap">
							{steps.map((s, i) => (
								<div key={i} className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${step === i ? "bg-indigo-600 text-white" : "bg-white text-indigo-400 border border-indigo-200"}`} onClick={() => setStep(i)}>
									{i + 1}
								</div>
							))}
						</div>
					)}
					<div className="min-h-[150px]">
						<p className="text-sm font-bold text-indigo-700 mb-2">{steps[step].title}</p>
						{steps[step].body}
					</div>
					{steps.length > 1 && (
						<div className="flex justify-between mt-4">
							<button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="text-xs px-4 py-1.5 rounded-full border border-indigo-300 text-indigo-600 disabled:opacity-30 hover:bg-indigo-100 transition">
								← Anterior
							</button>
							<button disabled={step === steps.length - 1} onClick={() => setStep(s => s + 1)} className="text-xs px-4 py-1.5 rounded-full bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition">
								Siguiente →
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export function Matematicas() {
	const [problems, setProblems] = useState(() => generateProblems())
	const [answers, setAnswers] = useState({
		sumas: ["", "", "", "", ""],
		restas: ["", "", "", "", ""],
		multiplicaciones: ["", "", "", "", ""],
	})
	const [graded,   setGraded]   = useState(false)
	const [score,    setScore]    = useState(null)
	const [seconds,  setSeconds]  = useState(0)
	const timerRef = useRef(null)

	const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

	useEffect(() => {
		timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
		return () => clearInterval(timerRef.current)
	}, [])

	const handleAnswer = (section, index, value) => {
		setAnswers(prev => ({
			...prev,
			[section]: prev[section].map((v, i) => (i === index ? value : v)),
		}))
	}

	const isCorrect = (section, index) => {
		if (!graded) return null
		return parseInt(answers[section][index]) === problems[section][index].answer
	}

	const handleGrade = () => {
		clearInterval(timerRef.current)
		let correct = 0
		;["sumas", "restas", "multiplicaciones"].forEach(section => {
			problems[section].forEach((p, i) => {
				if (parseInt(answers[section][i]) === p.answer) correct++
			})
		})
		const total = 15
		const pct = Math.round((correct / total) * 100)
		saveRecord('matematicas', pct, seconds)
		setScore({ correct, incorrect: total - correct, total, value: pct })
		setGraded(true)
		setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100)
	}

	const handleReset = () => {
		setProblems(generateProblems())
		setAnswers({ sumas: ["","","","",""], restas: ["","","","",""], multiplicaciones: ["","","","",""] })
		setGraded(false)
		setScore(null)
		setSeconds(0)
		clearInterval(timerRef.current)
		timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	const scoreColor =
		score?.value >= 70 ? "text-green-700" : score?.value >= 50 ? "text-yellow-600" : "text-red-600"
	const scoreBg =
		score?.value >= 70 ? "bg-green-50 border-green-300" : score?.value >= 50 ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300"
	const scoreMsg =
		score?.value >= 90 ? "¡Excelente trabajo!" : score?.value >= 70 ? "¡Muy bien!" : score?.value >= 50 ? "Sigue practicando." : "Necesitas repasar más."

	return (
		<div className="min-h-screen bg-gray-50 py-10 px-4">
			<div className="max-w-2xl mx-auto">

				<div className="text-center mb-10">
					<h1 className="text-4xl font-bold text-indigo-700 mb-2">Matemáticas</h1>
					<p className="text-gray-500">Resuelve los ejercicios y presiona <strong>Calificar</strong> al terminar.</p>
					<p className="text-xs text-indigo-400 mt-1">Haz clic en <em>¿Cómo se resuelve?</em> debajo de cada ejercicio para ver la guía paso a paso.</p>
					{!graded && (
						<p className="text-sm font-mono font-bold text-indigo-500 mt-3">⏱ {fmt(seconds)}</p>
					)}
				</div>

				{/* SUMAS */}
				<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
					<h2 className="text-lg font-bold text-indigo-600 mb-1">Sumas</h2>
					<p className="text-sm text-gray-400 mb-5">Suma los siguientes números de 3 dígitos.</p>
					<div className="space-y-5">
						{problems.sumas.map((p, i) => (
							<div key={i}>
								<div className="flex items-center gap-4">
									<span className="text-gray-400 text-sm w-5">{i + 1}.</span>
									<span className="font-mono text-lg w-36 text-right tabular-nums">
										{p.a} + {p.b}
									</span>
									<span className="text-gray-400 text-xl">=</span>
									<InputCell
										value={answers.sumas[i]}
										onChange={e => handleAnswer("sumas", i, e.target.value)}
										disabled={graded}
										correct={isCorrect("sumas", i)}
									/>
									{graded && (
										<span className={`text-sm font-semibold ${isCorrect("sumas", i) ? "text-green-600" : "text-red-500"}`}>
											{isCorrect("sumas", i) ? "✓" : `✗  (${p.answer})`}
										</span>
									)}
								</div>
								<div className="pl-8">
									<SumaGuide a={p.a} b={p.b} />
								</div>
							</div>
						))}
					</div>
				</section>

				{/* RESTAS */}
				<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
					<h2 className="text-lg font-bold text-indigo-600 mb-1">Restas</h2>
					<p className="text-sm text-gray-400 mb-5">Resta los siguientes números de 3 dígitos.</p>
					<div className="space-y-5">
						{problems.restas.map((p, i) => (
							<div key={i}>
								<div className="flex items-center gap-4">
									<span className="text-gray-400 text-sm w-5">{i + 1}.</span>
									<span className="font-mono text-lg w-36 text-right tabular-nums">
										{p.a} − {p.b}
									</span>
									<span className="text-gray-400 text-xl">=</span>
									<InputCell
										value={answers.restas[i]}
										onChange={e => handleAnswer("restas", i, e.target.value)}
										disabled={graded}
										correct={isCorrect("restas", i)}
									/>
									{graded && (
										<span className={`text-sm font-semibold ${isCorrect("restas", i) ? "text-green-600" : "text-red-500"}`}>
											{isCorrect("restas", i) ? "✓" : `✗  (${p.answer})`}
										</span>
									)}
								</div>
								<div className="pl-8">
									<RestaGuide a={p.a} b={p.b} />
								</div>
							</div>
						))}
					</div>
				</section>

				{/* MULTIPLICACIONES RAZONADAS */}
				<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
					<h2 className="text-lg font-bold text-indigo-600 mb-1">Problemas de Multiplicación</h2>
					<p className="text-sm text-gray-400 mb-5">Lee cada problema y escribe tu respuesta.</p>
					<div className="space-y-5">
						{problems.multiplicaciones.map((p, i) => {
							const correct = isCorrect("multiplicaciones", i)
							const cardBg = !graded
								? "bg-gray-50 border-gray-100"
								: correct
								? "bg-green-50 border-green-200"
								: "bg-red-50 border-red-200"

							return (
								<div key={i} className={`rounded-xl border-2 p-4 transition ${cardBg}`}>
									<p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Problema {i + 1}</p>
									<p className="text-gray-700 mb-4 leading-snug">{p.text}</p>
									<div className="flex items-center gap-3">
										<span className="text-sm text-gray-500">Respuesta:</span>
										<InputCell
											value={answers.multiplicaciones[i]}
											onChange={e => handleAnswer("multiplicaciones", i, e.target.value)}
											disabled={graded}
											correct={correct}
										/>
										{graded && (
											<span className={`text-sm font-semibold ${correct ? "text-green-600" : "text-red-500"}`}>
												{correct ? "✓ Correcto" : `✗  La respuesta es ${p.answer}`}
											</span>
										)}
									</div>
									<MultiGuide a={p.a} b={p.b} />
								</div>
							)
						})}
					</div>
				</section>

				{/* CALIFICAR / RESULTADOS */}
				{!graded ? (
					<button
						onClick={handleGrade}
						className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-lg transition"
					>
						Calificar
					</button>
				) : (
					<>
						<div className={`rounded-2xl border-2 p-8 mb-5 text-center ${scoreBg}`}>
							<p className={`text-7xl font-black mb-3 ${scoreColor}`}>{score.value}</p>
							<p className="text-base font-semibold text-gray-600 mb-1">
								{score.correct} correctas &nbsp;·&nbsp; {score.incorrect} incorrectas &nbsp;·&nbsp; de {score.total} preguntas
							</p>
							<p className={`text-lg font-bold mt-3 ${scoreColor}`}>{scoreMsg}</p>
						</div>
						<button
							onClick={handleReset}
							className="w-full py-4 rounded-2xl bg-gray-700 hover:bg-gray-800 active:scale-95 text-white font-bold text-lg transition"
						>
							Nueva prueba
						</button>
					</>
				)}
			</div>
		</div>
	)
}
