export const BASE_URL = 'http://localhost:8080/api';
export const delay = (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, timeout);
    })
}