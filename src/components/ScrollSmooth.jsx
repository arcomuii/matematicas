import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollSmooth = () => {
    const location = useLocation()
    useEffect(() => {
		// Verifica si hay un hash en la URL
		if (location.hash) {
		  // Obtén el id del hash (elimina el #)
		  const id = location.hash.replace('#', '');
		  const element = document.getElementById(id);
	
		  // Desplázate a la sección si el elemento existe
		  if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		  }
		}
	}, [location]); 

    return (<></>)
}
