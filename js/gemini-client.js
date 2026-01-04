/**
 * Client for interacting with the Google Gemini API via REST
 */
class GeminiClient {
    constructor() {
        this.apiKey = '';
        this.model = 'gemini-2.5-pro';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    setModel(model) {
        this.model = model;
    }

    /**
     * Generate content from a text prompt and optional file
     * @param {string} prompt - The user's prompt
     * @param {Object} [fileData] - Optional file data { mimeType, data } (base64)
     * @returns {Promise<string>} - The generated text
     */
    async generateContent(prompt, fileData = null) {
        if (!this.apiKey) {
            throw new Error('API Key is not set');
        }

        const url = `${this.baseUrl}${this.model}:generateContent?key=${this.apiKey}`;

        const parts = [{ text: prompt }];

        if (fileData) {
            parts.push({
                inline_data: {
                    mime_type: fileData.mimeType,
                    data: fileData.data
                }
            });
        }

        const payload = {
            contents: [{
                parts: parts
            }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API Error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return ''; // No content generated
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    /**
     * Helper to convert File object to Base64
     * @param {File} file 
     * @returns {Promise<{mimeType: string, data: string}>}
     */
    static async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve({
                    mimeType: file.type,
                    data: base64String
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Export for usage in app.js
window.GeminiClient = GeminiClient;
