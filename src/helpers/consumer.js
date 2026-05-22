import axios from "axios";
axios.defaults.timeout = 10000;
const API = import.meta.env.VITE_API_URL;

const i = axios.create({
    baseURL: API,
    headers: {
        "Content-Type": "multipart/form-data",
    },
    validateStatus: function (status) {
        return status;
    },
});

// Contacto
    // Send
    export const send = (data) => i.post("/contacto/send", data, { timeout: 30000 }).catch((error) => error);