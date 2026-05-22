import { NavLink } from "react-router"

const links = [
	{
		to: "/",
		label: "Inicio",
		end: true,
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

export function Sidebar() {
	return (
		<aside className="fixed top-0 left-0 h-screen w-52 bg-white border-r border-gray-100 flex flex-col z-40">
			<div className="px-6 py-7 border-b border-gray-100">
				<span className="text-sm font-semibold tracking-widest text-gray-300 uppercase">Aprende</span>
			</div>

			<nav className="flex-1 px-3 py-4 flex flex-col gap-1">
				{links.map(({ to, label, icon, end }) => (
					<NavLink
						key={to}
						to={to}
						end={end}
						className={({ isActive }) =>
							`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
								isActive
									? "bg-indigo-50 text-indigo-600"
									: "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
							}`
						}
					>
						{icon}
						{label}
					</NavLink>
				))}
			</nav>
		</aside>
	)
}
