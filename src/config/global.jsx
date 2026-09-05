import { message } from "antd"

window.toast = (msg, type) => {
    message[type](msg)
}

window.apiURL = import.meta.env.VITE_API_URL

window.isValidEmail = (email) => {
    const emailRegex =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    return emailRegex.test(String(email).trim());
};