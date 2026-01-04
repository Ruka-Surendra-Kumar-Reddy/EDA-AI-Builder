// Application data
const appData = {
    "eda_software_options": [
        { "name": "KiCad", "format": ".kicad_sym/.kicad_mod", "popular": true },
        { "name": "Altium Designer", "format": ".SchLib/.PcbLib", "popular": true },
        { "name": "Eagle", "format": ".lbr", "popular": true },
        { "name": "EasyEDA", "format": ".json", "popular": false },
        { "name": "OrCAD", "format": ".olb/.dra", "popular": false },
        { "name": "Fusion 360", "format": ".f3d", "popular": false }
    ],
    "gemini_models": [
        { "id": "gemini-3-pro-preview", "name": "Gemini 3 Pro Preview", "new": true },
        { "id": "gemini-3-flash-preview", "name": "Gemini 3 Flash Preview", "new": true },
        { "id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro (Default)", "new": true },
        { "id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "new": true },
        { "id": "gemini-2.0-flash-exp", "name": "Gemini 2.0 Flash Experimental", "new": false },
        { "id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "new": false },
        { "id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "new": false }
    ],
    "package_types": [
        "Auto-detect from datasheet",
        "QFP (Quad Flat Package)",
        "BGA (Ball Grid Array)",
        "SOIC (Small Outline IC)",
        "DIP (Dual In-line Package)",
        "SSOP (Shrink Small Outline Package)",
        "TQFP (Thin Quad Flat Package)",
        "SOP (Small Outline Package)",
        "PLCC (Plastic Leaded Chip Carrier)",
        "QFN (Quad Flat No-leads)",
        "DFN (Dual Flat No-leads)",
        "Custom/Other"
    ],
    "sample_part_numbers": [
        "STM32F407VGT6",
        "LM358",
        "74HC595",
        "ESP32-WROOM-32",
        "ATMEGA328P-PU",
        "TL071CP"
    ]
};

// DOM Elements
const elements = {
    partNumber: null,
    edaSoftware: null,
    packageType: null,
    modelSelect: null,
    apiKey: null,
    toggleApiKey: null,
    toggleSettings: null,
    settingsPanel: null,
    componentForm: null,
    generateBtn: null,
    sampleParts: null,

    // Chat & Upload
    uploadZone: null,
    datasheetInput: null,
    fileInfo: null,
    removeFileBtn: null,
    chatMessages: null,
    chatInput: null,
    sendMessageBtn: null,

    // Preview
    previewContainer: null,
    previewCanvas: null,
    generationStatus: null,
    downloadBtn: null
};

// Application state
let geminiClient = null;
let currentFile = null; // { mimeType, data }
let isGenerating = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Gemini Client
    geminiClient = new GeminiClient();

    initializeElements();
    initializeDropdowns();
    populateSampleParts();
    setupEventListeners();

    // Load saved preferences
    loadPreferences();

    // Auto-resize textarea
    if (elements.chatInput) {
        elements.chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
});

// Initialize DOM element references
function initializeElements() {
    elements.partNumber = document.getElementById('partNumber');
    elements.edaSoftware = document.getElementById('edaSoftware');
    elements.packageType = document.getElementById('packageType');
    elements.modelSelect = document.getElementById('modelSelect');
    elements.apiKey = document.getElementById('apiKey');
    elements.toggleApiKey = document.getElementById('toggleApiKey');
    elements.toggleSettings = document.getElementById('toggleSettings');
    elements.settingsPanel = document.getElementById('settingsPanel');
    elements.componentForm = document.getElementById('componentForm');
    elements.generateBtn = document.getElementById('generateBtn');
    elements.sampleParts = document.getElementById('sampleParts');

    elements.uploadZone = document.getElementById('uploadZone');
    elements.datasheetInput = document.getElementById('datasheetInput');
    elements.fileInfo = document.getElementById('fileInfo');
    elements.removeFileBtn = document.getElementById('removeFile');
    elements.chatMessages = document.getElementById('chatMessages');
    elements.chatInput = document.getElementById('chatInput');
    elements.sendMessageBtn = document.getElementById('sendMessageBtn');

    elements.previewContainer = document.getElementById('previewContainer');
    elements.previewCanvas = document.getElementById('previewCanvas');
    elements.generationStatus = document.getElementById('generationStatus');
    elements.downloadBtn = document.getElementById('downloadBtn');
}

// Initialize dropdown menus
function initializeDropdowns() {
    // Populate EDA Software dropdown
    appData.eda_software_options.forEach(software => {
        const option = document.createElement('option');
        option.value = software.name;
        option.textContent = `${software.name} (${software.format})`;
        if (software.popular) {
            option.style.fontWeight = 'bold';
        }
        elements.edaSoftware.appendChild(option);
    });

    // Populate Package Type dropdown
    appData.package_types.forEach(packageType => {
        const option = document.createElement('option');
        option.value = packageType;
        option.textContent = packageType;
        elements.packageType.appendChild(option);
    });

    // Populate Model dropdown
    if (elements.modelSelect) {
        appData.gemini_models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            if (model.id === 'gemini-2.5-pro') {
                option.selected = true;
            }
            elements.modelSelect.appendChild(option);
        });
    }
}

// Populate sample part numbers
function populateSampleParts() {
    elements.sampleParts.innerHTML = '';
    appData.sample_part_numbers.forEach(partNumber => {
        const tag = document.createElement('span');
        tag.className = 'suggestion-tag';
        tag.textContent = partNumber;
        tag.addEventListener('click', function (e) {
            e.preventDefault();
            elements.partNumber.value = partNumber;
            elements.partNumber.focus();
        });
        elements.sampleParts.appendChild(tag);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Settings Toggle
    if (elements.toggleSettings) {
        elements.toggleSettings.addEventListener('click', () => {
            elements.settingsPanel.classList.toggle('hidden');
        });
    }

    // API Key Toggle
    if (elements.toggleApiKey) {
        elements.toggleApiKey.addEventListener('click', () => {
            const isPassword = elements.apiKey.type === 'password';
            elements.apiKey.type = isPassword ? 'text' : 'password';
            elements.toggleApiKey.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    // File Upload
    if (elements.uploadZone) {
        elements.uploadZone.addEventListener('click', () => elements.datasheetInput.click());
        elements.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadZone.style.backgroundColor = 'var(--color-secondary-hover)';
        });
        elements.uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            elements.uploadZone.style.backgroundColor = '';
        });
        elements.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadZone.style.backgroundColor = '';
            handleFileUpload(e.dataTransfer.files[0]);
        });
    }

    if (elements.datasheetInput) {
        elements.datasheetInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files[0]);
        });
    }

    if (elements.removeFileBtn) {
        elements.removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentFile = null;
            elements.fileInfo.classList.add('hidden');
            elements.uploadZone.querySelector('.upload-content').classList.remove('hidden');
            elements.datasheetInput.value = '';
        });
    }

    // Chat
    if (elements.sendMessageBtn) {
        elements.sendMessageBtn.addEventListener('click', sendMessage);
    }
    if (elements.chatInput) {
        elements.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Generate Button
    if (elements.generateBtn) {
        elements.generateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            startGeneration();
        });
    }

    // Save preferences
    [elements.apiKey, elements.modelSelect, elements.edaSoftware].forEach(element => {
        if (element) {
            element.addEventListener('change', savePreferences);
            if (element === elements.apiKey) {
                element.addEventListener('blur', savePreferences);
            }
        }
    });
}

// Handle File Upload
async function handleFileUpload(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
    }

    try {
        currentFile = await GeminiClient.fileToBase64(file);

        // Update UI
        elements.uploadZone.querySelector('.upload-content').classList.add('hidden');
        elements.fileInfo.classList.remove('hidden');
        elements.fileInfo.querySelector('.file-name').textContent = file.name;

        addMessage('system', `Uploaded: ${file.name}`);
    } catch (error) {
        console.error('File upload error:', error);
        alert('Error processing file.');
    }
}

// Send Chat Message
async function sendMessage() {
    const text = elements.chatInput.value.trim();
    if (!text && !currentFile) return;

    // Clear input
    elements.chatInput.value = '';
    elements.chatInput.style.height = 'auto';

    // Add user message
    addMessage('user', text);

    // Show typing indicator
    const typingId = addMessage('ai', 'Thinking...');

    try {
        // Construct prompt with context
        let prompt = text;
        if (elements.partNumber.value) {
            prompt = `Context: Component is ${elements.partNumber.value}. ${prompt}`;
        }

        const response = await geminiClient.generateContent(prompt, currentFile);

        // Update AI message
        updateMessage(typingId, response);
    } catch (error) {
        updateMessage(typingId, `Error: ${error.message}. Please check your API key.`);
    }
}

// Add Message to Chat
function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message--${role}`;
    messageDiv.id = `msg-${Date.now()}`;

    const avatar = role === 'user' ? '👤' : '🤖';

    messageDiv.innerHTML = `
        <div class="message__avatar">${avatar}</div>
        <div class="message__content">${formatMessage(text)}</div>
    `;

    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    return messageDiv.id;
}

// Update existing message
function updateMessage(id, text) {
    const messageDiv = document.getElementById(id);
    if (messageDiv) {
        messageDiv.querySelector('.message__content').innerHTML = formatMessage(text);
    }
}

// Simple markdown formatter
function formatMessage(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Start Generation Process
async function startGeneration() {
    if (isGenerating) return;

    const partNumber = elements.partNumber.value;
    const software = elements.edaSoftware.value;

    if (!partNumber || !software) {
        alert('Please enter a component name and select EDA software.');
        return;
    }

    isGenerating = true;
    elements.generateBtn.disabled = true;
    elements.generateBtn.querySelector('.btn-text').classList.add('hidden');
    elements.generateBtn.querySelector('.btn-loader').classList.remove('hidden');

    elements.generationStatus.classList.remove('hidden');

    try {
        // Step 1: Analyze
        updateStatus(1, 'active');
        const prompt = `Generate a ${software} symbol and footprint for ${partNumber}. 
        Return ONLY a JSON object with the following structure:
        {
            "symbol_code": "...",
            "footprint_code": "...",
            "symbol_svg": "<svg>...</svg>",
            "footprint_svg": "<svg>...</svg>",
            "specs": { "package": "...", "pin_count": "..." }
        }
        The SVGs should be simple visual representations for preview purposes.
        If you have the datasheet context, use it.`;

        const response = await geminiClient.generateContent(prompt, currentFile);

        // Parse response (naive JSON extraction)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            console.log('Generated Data:', data);

            updateStatus(1, 'completed');
            updateStatus(2, 'completed');
            updateStatus(3, 'completed');
            updateStatus(4, 'completed');

            // Render Previews
            if (data.symbol_svg) {
                renderPreview('symbol', data.symbol_svg);
            }
            if (data.footprint_svg) {
                renderPreview('footprint', data.footprint_svg);
            }

            // Show success in chat
            addMessage('ai', `Successfully generated library for ${partNumber}! You can now download it.`);

            // Enable download
            elements.downloadBtn.disabled = false;
        } else {
            throw new Error('Failed to parse generation result');
        }

    } catch (error) {
        console.error(error);
        addMessage('ai', `Generation failed: ${error.message}`);
    } finally {
        isGenerating = false;
        elements.generateBtn.disabled = false;
        elements.generateBtn.querySelector('.btn-text').classList.remove('hidden');
        elements.generateBtn.querySelector('.btn-loader').classList.add('hidden');
    }
}

function renderPreview(type, svgContent) {
    // Store SVG content for tab switching
    if (!window.previewData) window.previewData = {};
    window.previewData[type] = svgContent;

    // If currently active tab matches, render immediately
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    if (activeTab === type) {
        elements.previewContainer.innerHTML = svgContent;
        // Ensure SVG scales correctly
        const svg = elements.previewContainer.querySelector('svg');
        if (svg) {
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.maxHeight = '400px';
        }
    }
}

// Update tab switching logic to show stored previews
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('tab-btn')) {
        e.preventDefault();
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');

        const tabType = e.target.getAttribute('data-tab');

        if (window.previewData && window.previewData[tabType]) {
            elements.previewContainer.innerHTML = window.previewData[tabType];
            const svg = elements.previewContainer.querySelector('svg');
            if (svg) {
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.maxHeight = '400px';
            }
        } else {
            // Show placeholder
            elements.previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <span class="preview-icon">⚡</span>
                    <p>Generated ${tabType} will appear here</p>
                </div>
            `;
        }
    }
});

function updateStatus(step, status) {
    const el = document.getElementById(`statusStep${step}`);
    if (el) {
        el.className = `status-step ${status}`;
        if (status === 'completed') el.innerHTML += ' ✅';
    }
}

// Save/Load Preferences (Same as before)
function savePreferences() {
    if (elements.apiKey) localStorage.setItem('eda_builder_api_key', elements.apiKey.value);
    if (elements.modelSelect) localStorage.setItem('eda_builder_model', elements.modelSelect.value);
    if (elements.edaSoftware) localStorage.setItem('eda_builder_software', elements.edaSoftware.value);

    if (geminiClient) {
        geminiClient.setApiKey(elements.apiKey.value);
        geminiClient.setModel(elements.modelSelect.value);
    }
}

function loadPreferences() {
    const savedApiKey = localStorage.getItem('eda_builder_api_key');
    const savedModel = localStorage.getItem('eda_builder_model');
    const savedSoftware = localStorage.getItem('eda_builder_software');

    if (savedApiKey && elements.apiKey) {
        elements.apiKey.value = savedApiKey;
        if (geminiClient) geminiClient.setApiKey(savedApiKey);
    }
    if (savedModel && elements.modelSelect) {
        elements.modelSelect.value = savedModel;
        if (geminiClient) geminiClient.setModel(savedModel);
    }
    if (savedSoftware && elements.edaSoftware) {
        elements.edaSoftware.value = savedSoftware;
    }
}
