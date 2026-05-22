const KEY = 'mauricio_records'

export function saveRecord(section, score, seconds) {
	try {
		const data = JSON.parse(localStorage.getItem(KEY) ?? '{}')
		const list = data[section] ?? []
		list.unshift({
			score,
			time: `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`,
			date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
		})
		data[section] = list.slice(0, 20)
		localStorage.setItem(KEY, JSON.stringify(data))
	} catch {}
}

export function getRecords() {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}')
	} catch {
		return {}
	}
}
