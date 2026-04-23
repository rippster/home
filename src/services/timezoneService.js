const BASE_URL = '/api';

export const timezoneService = {
    async getTimezones() {
        const response = await fetch(`${BASE_URL}/TimeZones`);
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        return data;
    }
};
