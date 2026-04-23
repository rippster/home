const BASE_URL = '/api';

export const modelsService = {
    async getModels() {
        const response = await fetch(`${BASE_URL}/models`);
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        return data;
    },

    async saveModels(data) {
        const response = await fetch(`${BASE_URL}/models`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save models');
        }
        
        // The controller returns void, so we don't need to parse response
        return response;
    }
};
