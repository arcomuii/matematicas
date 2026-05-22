import React, { useState } from 'react';
import { Printer, Settings, ZoomIn, ZoomOut, Info, AlertCircle, FileDown } from 'lucide-react';

export const Disenos = () => {
	const [stickerSize, setStickerSize] = useState(60); // mm
	const [spacing, setSpacing] = useState(8); // mm
	const [showSettings, setShowSettings] = useState(false);
	const [showPdfHint, setShowPdfHint] = useState(false);

	// Dimensiones Tabloide (11x17 pulgadas convertidas a mm)
	const sheetWidth = 279.4;
	const sheetHeight = 431.8;

	// Cálculos de cuadrícula (restando 15mm de margen de seguridad)
	const columns = Math.floor((sheetWidth - 15) / (stickerSize + spacing));
	const rows = Math.floor((sheetHeight - 15) / (stickerSize + spacing));
	const totalStickers = columns * rows;

	const handlePrint = () => {
		window.print();
	};

	const handleSavePDF = () => {
		setShowPdfHint(true);
		// Le damos 4 segundos al usuario para leer la instrucción antes de abrir el diálogo
		setTimeout(() => {
		setShowPdfHint(false);
		window.print();
		}, 4000); 
	};

	// Estilos de la cuadrícula compartidos para previsualización y para impresión
	const gridStyle = {
		width: `${sheetWidth}mm`,
		height: `${sheetHeight}mm`,
		gridTemplateColumns: `repeat(${columns}, ${stickerSize}mm)`,
		gridTemplateRows: `repeat(${rows}, ${stickerSize}mm)`,
		gap: `${spacing}mm`,
		padding: '10mm', 
		justifyContent: 'center',
		alignContent: 'start',
		backgroundColor: 'white',
		boxSizing: 'border-box'
	};

	return (
		<div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
			<style dangerouslySetInnerHTML={{ __html: `
				@media print {
				body { margin: 0; padding: 0; background: white; }
				.no-print { display: none !important; }
				.print-only { display: grid !important; }
				.print-area {
					position: absolute;
					left: 0;
					top: 0;
					width: 11in;
					height: 17in;
					margin: 0;
				}
				}
				@page {
				size: 11in 17in;
				margin: 0;
				}
			`}} />

			{/* Panel de Control */}
			<div className="max-w-5xl mx-auto mb-8 no-print">
				<div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-yellow-400 rounded-2xl shadow-inner">
						<img src="data:image/png;base64,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" alt="Tigres Logo" className="w-12 h-12 object-contain" />
						</div>
						<div>
						<h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Stickers de Pedro</h1>
						<p className="text-slate-500 font-medium">Plantilla Pro • Tamaño Tabloide</p>
						</div>
					</div>
					
					<div className="flex flex-wrap items-center justify-center gap-3">
						<button 
						onClick={() => setShowSettings(!showSettings)}
						className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
						title="Ajustes de tamaño"
						>
						<Settings size={22} />
						</button>
						<button 
						onClick={handleSavePDF}
						className="flex items-center gap-2 px-4 md:px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
						>
						<FileDown size={20} />
						<span className="hidden sm:inline">GUARDAR</span> PDF
						</button>
						<button 
						onClick={handlePrint}
						className="flex items-center gap-2 px-4 md:px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
						>
						<Printer size={20} />
						IMPRIMIR
						</button>
					</div>
				</div>

				{showPdfHint && (
					<div className="mb-4 bg-slate-800 text-white p-5 rounded-2xl shadow-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
						<Info size={28} className="text-blue-400 shrink-0" />
						<div>
						<h4 className="font-bold text-lg">Preparando tu PDF...</h4>
						<p className="text-sm text-slate-300 mt-1 leading-relaxed">
							En la ventana que se abrirá en un momento, busca la opción <strong>"Destino"</strong> (o Impresora) y selecciona <strong>"Guardar como PDF"</strong>.<br/>
							Asegúrate de que el tamaño de papel esté configurado en <strong>Tabloide (11x17)</strong> y los márgenes en <strong>Ninguno</strong>.
						</p>
						</div>
					</div>
				)}

				{showSettings && (
					<div className="mt-4 bg-white p-6 rounded-3xl shadow-lg border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-200">
						<div className="space-y-4">
						<div className="flex justify-between items-end">
							<label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Diámetro del Sticker</label>
							<span className="text-blue-700 font-black">{stickerSize}mm</span>
						</div>
						<div className="flex items-center gap-4">
							<ZoomOut size={18} className="text-slate-400" />
							<input 
							type="range" min="40" max="90" value={stickerSize} 
							onChange={(e) => setStickerSize(parseInt(e.target.value))}
							className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
							/>
							<ZoomIn size={18} className="text-slate-400" />
						</div>
						</div>
						<div className="space-y-4">
						<div className="flex justify-between items-end">
							<label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Espacio entre Stickers</label>
							<span className="text-blue-700 font-black">{spacing}mm</span>
						</div>
						<input 
							type="range" min="2" max="20" value={spacing} 
							onChange={(e) => setSpacing(parseInt(e.target.value))}
							className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
						/>
						</div>
						<div className="col-span-full flex items-center gap-3 text-sm font-medium text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-100">
						<Info size={20} />
						<span>Se generarán <strong>{totalStickers} stickers</strong> automáticamente para optimizar tu hoja tabloide.</span>
						</div>
					</div>
				)}
			</div>

			{/* Previsualización de la Hoja */}
			<div className="flex justify-center pb-20 no-print">
				<div className="relative group">
				<div className="absolute -inset-4 bg-blue-500/10 blur-xl rounded-[2rem] -z-10"></div>
				<div 
					className="grid bg-white shadow-2xl border border-slate-200 overflow-hidden"
					style={gridStyle}
				>
					{Array.from({ length: totalStickers }).map((_, i) => (
					<Sticker key={i} size={stickerSize} />
					))}
				</div>
				</div>
			</div>

			{/* Layout invisible para impresión real si la previsualización difiere */}
			<div className="hidden print-only print-area" style={gridStyle}>
				{Array.from({ length: totalStickers }).map((_, i) => (
					<Sticker key={i} size={stickerSize} />
				))}
			</div>
		</div>
	);
};

	const Sticker = ({ size }) => {
	const primaryYellow = "#fdb913"; // El amarillo oficial de Tigres
	const primaryBlue = "#004a99";   // El azul oficial de Tigres

	const handleImageError = (e) => {
		e.currentTarget.style.display = 'none';
		if (e.currentTarget.nextElementSibling) {
		e.currentTarget.nextElementSibling.style.display = 'block';
		}
	};

	return (
		<div 
		className="rounded-full relative flex items-center justify-center select-none overflow-hidden shadow-sm"
		style={{ 
			width: `${size}mm`, 
			height: `${size}mm`, 
			backgroundColor: primaryYellow,
		}}
		>
		{/* Imagen del Tigre como fondo completo respetando las proporciones */}
		<img 
			src="data:image/png;base64,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" 
			alt="Tigres UANL"
			className="absolute inset-0 w-full h-full object-cover z-0"
			onError={handleImageError}
		/>
		<div className="hidden text-[8px] font-bold text-blue-900 text-center relative z-0">
			LOGO TIGRES
		</div>

		{/* Borde exterior fino para enmarcar el sticker */}
		<div className="absolute inset-0 border-[3px] border-[#004a99] rounded-full z-10 pointer-events-none"></div>
		
		{/* Texto Circular superpuesto en el borde */}
		<svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100">
			<defs>
			{/* El camino circular ahora inicia desde la parte inferior para que el texto fluya sin cortes */}
			<path id="textPath" d="M 50,92 a 42,42 0 1,1 0,-84 a 42,42 0 1,1 0,84" />
			</defs>
			<text fill="white" className="font-[900] uppercase" style={{ textShadow: '0px 0px 1.5px rgba(0,0,0,0.8)' }}>
			<textPath 
				href="#textPath" 
				startOffset="50%" 
				textAnchor="middle"
				textLength="255"
				lengthAdjust="spacing"
				style={{ fontSize: '7.5px' }}
			>
				¡Feliz Cumpleaños Pedro! • ¡Feliz Cumpleaños Pedro! •
			</textPath>
			</text>
		</svg>
		</div>
	);
};