import { BrowserRouter, Routes, Route } from "react-router"
import { Analytics } from "@vercel/analytics/react"
import Layout from "./components/Layout"

import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';

import { MantineProvider } from '@mantine/core';

import {
	Home,
	Disenos,
	Matematicas,
	Tablas,
	Criptos,
	Bitunix,
	BitunixBalance,
	Acciones,
	Prospectos,
	BMV,
} from "./pages"

const App = () => {
	return (
		<>
			<MantineProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Layout />}>
							<Route index element={<Home />} />
							<Route path="/disenos" element={<Disenos />} />
							<Route path="/matematicas" element={<Matematicas />} />
							<Route path="/tablas" element={<Tablas />} />
							<Route path="/criptos" element={<Criptos />} />
							<Route path="/bitunix" element={<Bitunix />} />
							<Route path="/bitunix/balance" element={<BitunixBalance />} />
							<Route path="/acciones" element={<Acciones />} />
							<Route path="/prospectos" element={<Prospectos />} />
							<Route path="/bmv" element={<BMV />} />
							{/* <Route path="/contacto" element={<Contacto />} /> */}
						</Route>
					</Routes>
				</BrowserRouter>
			</MantineProvider>
			<Analytics />
		</>
	)
}
export default App