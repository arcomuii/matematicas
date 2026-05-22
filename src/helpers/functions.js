export const formatPrice = precio => {
    const formateado = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(precio);
    return formateado
}

export const formatDate = date => {
    const fecha = new Date(date);
    const opciones = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const fechaFormateada = new Intl.DateTimeFormat('es-MX', opciones).format(fecha);

    // Capitalizar primera letra
    const resultado = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
    
    const ajusteFormato = resultado.split(" de ")[0] + " de " + resultado.split(" de ")[1] + ", " + resultado.split(" de ")[2]

    return ajusteFormato; // "Miércoles 10 de enero, 2024"
}