import { api } from './api';

export const checkAPI = async () => {
    try {
        const response = await api.get("/health/api");
        return response.data === true;
    } catch (error) {
        return false;
    }
}

export const checkWorker = async () => {
    try {
        const response = await api.get("/health/worker");
        return response.data === true;
    } catch (error) {
        return false;
    }
};

export const checkWPP = async () => {
    try {
        const response = await api.get("/health/wpp");
        return response.data === true;
    } catch (error) {
        return false;
    }
};