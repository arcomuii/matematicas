import { NavLink, useLocation } from "react-router"
import { useState, useEffect } from "react"

const navClass = ({ isActive }) =>
	`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
		isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
	}`

const links = [
	{
		to: "/",
		end: true,
		label: "Inicio",
		icon: (
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<polyline points="9 22 9 12 15 12 15 22" />
			</svg>
		),
	},
	{
		to: "/matematicas",
		label: "Matemáticas",
		icon: (
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			</svg>
		),
	},
	{
		to: "/tablas",
		label: "Tablas",
		icon: (
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<path d="M3 9h18M3 15h18M9 3v18" />
			</svg>
		),
	},
]

const bitunixChildren = [
	{ to: "/bitunix",         label: "Operaciones" },
	{ to: "/bitunix/balance", label: "Balance"    },
	{ to: "/criptos",         label: "Criptos"    },
	{ to: "/acciones",        label: "Acciones"   },
	{ to: "/prospectos",      label: "Prospectos" },
	{ to: "/bmv",             label: "BMV"        },
]

function BitunixDropdown() {
	const { pathname } = useLocation()
	const isSection = pathname.startsWith("/bitunix") || pathname === "/criptos" || pathname === "/acciones" || pathname === "/prospectos" || pathname === "/bmv"
	const [open, setOpen] = useState(isSection)

	useEffect(() => {
		if (isSection) setOpen(true)
	}, [isSection])

	return (
		<div>
			<button
				onClick={() => setOpen(o => !o)}
				className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
					isSection ? "text-indigo-600 bg-indigo-50" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
				}`}
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
					<polyline points="16 7 22 7 22 13" />
				</svg>
				<span className="flex-1 text-left">Bitunix</span>
				<svg
					width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
					strokeLinecap="round" strokeLinejoin="round"
					className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{open && (
				<div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-gray-100 pl-3">
					{bitunixChildren.map(({ to, label }) => (
						<NavLink key={to} to={to} end className={navClass}>
							{label}
						</NavLink>
					))}
				</div>
			)}
		</div>
	)
}

export function Sidebar({ open, onToggle }) {
	return (
		<aside className={`fixed top-0 left-0 h-screen w-52 bg-white border-r border-gray-100 flex flex-col z-40
		                   transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
			<div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
				<span className="text-sm font-semibold tracking-widest text-gray-300 uppercase">Aprende</span>
				<button
					onClick={onToggle}
					title="Ocultar menú"
					className="text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
				>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
					     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
						<line x1="18" y1="6"  x2="6"  y2="18" />
						<line x1="6"  y1="6"  x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<nav className="flex-1 px-3 py-4 flex flex-col gap-1">
				{links.map(({ to, label, icon, end }) => (
					<NavLink key={to} to={to} end={end} className={navClass}>
						{icon}
						{label}
					</NavLink>
				))}
				<BitunixDropdown />
			</nav>
		</aside>
	)
}
