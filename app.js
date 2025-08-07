// Application data
const appData = {
  "eda_software_options": [
    {"name": "KiCad", "format": ".kicad_sym/.kicad_mod", "popular": true},
    {"name": "Altium Designer", "format": ".SchLib/.PcbLib", "popular": true}, 
    {"name": "Eagle", "format": ".lbr", "popular": true},
    {"name": "EasyEDA", "format": ".json", "popular": false},
    {"name": "OrCAD", "format": ".olb/.dra", "popular": false},
    {"name": "Fusion 360", "format": ".f3d", "popular": false}
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
  "workflow_steps": [
    {
      "id": 1,
      "title": "Search Datasheet",
      "description": "AI searches web and component databases for official datasheet",
      "icon": "🔍",
      "details": "Uses multiple sources including manufacturer websites, Mouser, DigiKey"
    },
    {
      "id": 2, 
      "title": "Extract Dimensions",
      "description": "Parse mechanical drawings and pin dimensions from datasheet PDF",
      "icon": "📏",
      "details": "OCR and AI extraction of package dimensions, pin pitch, body size"
    },
    {
      "id": 3,
      "title": "Generate Symbol", 
      "description": "Create schematic symbol with proper pin assignments",
      "icon": "⚡",
      "details": "Groups pins by function, follows EDA software conventions"
    },
    {
      "id": 4,
      "title": "Create Footprint",
      "description": "Generate PCB footprint following IPC-7351 standards", 
      "icon": "🔲",
      "details": "Includes solder mask, paste layers, and courtyard"
    },
    {
      "id": 5,
      "title": "Export Library",
      "description": "Package symbols and footprints for target EDA software",
      "icon": "📦", 
      "details": "Creates ready-to-import library files with metadata"
    }
  ],
  "key_features": [
    {
      "title": "Free with Gemini API",
      "description": "Uses Google's free Gemini Flash 2.0 API (1500 RPM limit)",
      "icon": "💎"
    },
    {
      "title": "Multiple EDA Support",
      "description": "Generates libraries for KiCad, Altium, Eagle, and more",
      "icon": "🎯"
    },
    {
      "title": "Automatic Datasheet Scraping",
      "description": "AI-powered search and extraction from manufacturer websites",
      "icon": "🤖"
    },
    {
      "title": "IPC-7351 Compliant",
      "description": "PCB footprints follow industry standards for reliability",
      "icon": "✅"
    },
    {
      "title": "Multi-unit Symbols",
      "description": "Automatically creates multi-part symbols for complex ICs",
      "icon": "🔀"
    },
    {
      "title": "Dimension Validation",
      "description": "Cross-references multiple sources to ensure accuracy",
      "icon": "🎯"
    }
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
  apiKey: null,
  toggleApiKey: null,
  toggleAdvanced: null,
  advancedOptions: null,
  componentForm: null,
  generateBtn: null,
  workflowSteps: null,
  featuresGrid: null,
  sampleParts: null,
  resultsSection: null
};

// Application state
let currentWorkflowStep = 0;
let isGenerating = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  initializeDropdowns();
  populateWorkflowSteps();
  populateFeatures();
  populateSampleParts();
  setupEventListeners();
  updateGenerateButtonState();
});

// Initialize DOM element references
function initializeElements() {
  elements.partNumber = document.getElementById('partNumber');
  elements.edaSoftware = document.getElementById('edaSoftware');
  elements.packageType = document.getElementById('packageType');
  elements.apiKey = document.getElementById('apiKey');
  elements.toggleApiKey = document.getElementById('toggleApiKey');
  elements.toggleAdvanced = document.getElementById('toggleAdvanced');
  elements.advancedOptions = document.getElementById('advancedOptions');
  elements.componentForm = document.getElementById('componentForm');
  elements.generateBtn = document.getElementById('generateBtn');
  elements.workflowSteps = document.getElementById('workflowSteps');
  elements.featuresGrid = document.getElementById('featuresGrid');
  elements.sampleParts = document.getElementById('sampleParts');
  elements.resultsSection = document.getElementById('resultsSection');
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
}

// Populate workflow steps
function populateWorkflowSteps() {
  elements.workflowSteps.innerHTML = '';
  appData.workflow_steps.forEach((step, index) => {
    const stepElement = document.createElement('div');
    stepElement.className = 'workflow-step';
    stepElement.innerHTML = `
      <div class="step-status pending" id="step-status-${step.id}">
        <span>${step.id}</span>
      </div>
      <span class="step-icon">${step.icon}</span>
      <h4 class="step-title">${step.title}</h4>
      <p class="step-description">${step.description}</p>
    `;
    stepElement.title = step.details;
    elements.workflowSteps.appendChild(stepElement);
  });
}

// Populate features grid
function populateFeatures() {
  elements.featuresGrid.innerHTML = '';
  appData.key_features.forEach(feature => {
    const featureElement = document.createElement('div');
    featureElement.className = 'feature-card';
    featureElement.innerHTML = `
      <span class="feature-icon">${feature.icon}</span>
      <h4 class="feature-title">${feature.title}</h4>
      <p class="feature-description">${feature.description}</p>
    `;
    elements.featuresGrid.appendChild(featureElement);
  });
}

// Populate sample part numbers
function populateSampleParts() {
  elements.sampleParts.innerHTML = '';
  appData.sample_part_numbers.forEach(partNumber => {
    const tag = document.createElement('span');
    tag.className = 'suggestion-tag';
    tag.textContent = partNumber;
    tag.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      elements.partNumber.value = partNumber;
      elements.partNumber.focus();
      validatePartNumber(partNumber);
      updateGenerateButtonState();
    });
    elements.sampleParts.appendChild(tag);
  });
}

// Setup event listeners
function setupEventListeners() {
  // API Key toggle
  if (elements.toggleApiKey) {
    elements.toggleApiKey.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isPassword = elements.apiKey.type === 'password';
      elements.apiKey.type = isPassword ? 'text' : 'password';
      elements.toggleApiKey.querySelector('.toggle-icon').textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Advanced options toggle
  if (elements.toggleAdvanced) {
    elements.toggleAdvanced.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = elements.advancedOptions.classList.contains('hidden');
      elements.advancedOptions.classList.toggle('hidden');
      
      const arrow = this.querySelector('.toggle-arrow');
      arrow.classList.toggle('rotated');
      
      this.querySelector('span').textContent = isHidden ? 'Hide Advanced Options' : 'Advanced Options';
    });
  }

  // Form submission - prevent default form submission
  if (elements.componentForm) {
    elements.componentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isGenerating && !elements.generateBtn.disabled) {
        startGeneration();
      }
    });
  }

  // Generate button click handler
  if (elements.generateBtn) {
    elements.generateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isGenerating && !this.disabled) {
        startGeneration();
      }
    });
  }

  // Tab switching in results
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab-btn')) {
      e.preventDefault();
      const tabs = document.querySelectorAll('.tab-btn');
      tabs.forEach(tab => tab.classList.remove('active'));
      e.target.classList.add('active');
      
      // Update preview content based on selected tab
      const tabType = e.target.getAttribute('data-tab');
      updatePreviewContent(tabType);
    }
  });

  // Part number input validation
  if (elements.partNumber) {
    elements.partNumber.addEventListener('input', function() {
      validatePartNumber(this.value);
      updateGenerateButtonState();
    });
  }

  // Real-time form validation
  [elements.partNumber, elements.edaSoftware, elements.apiKey].forEach(element => {
    if (element) {
      element.addEventListener('input', updateGenerateButtonState);
      element.addEventListener('change', updateGenerateButtonState);
    }
  });
}

// Validate part number format
function validatePartNumber(partNumber) {
  if (!elements.partNumber) return false;
  
  const partNumberRegex = /^[A-Z0-9-_]+$/i;
  const isValid = partNumberRegex.test(partNumber) && partNumber.length > 2;
  
  elements.partNumber.classList.toggle('error', !isValid && partNumber.length > 0);
  
  // Remove any existing error message
  const existingError = elements.partNumber.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Show error message for invalid format
  if (!isValid && partNumber.length > 0 && partNumber.length <= 2) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Part number must be at least 3 characters long';
    elements.partNumber.parentElement.appendChild(errorDiv);
  }
  
  return isValid;
}

// Update generate button state based on form validity
function updateGenerateButtonState() {
  if (!elements.generateBtn || !elements.partNumber || !elements.edaSoftware || !elements.apiKey) {
    return;
  }
  
  const isFormValid = 
    elements.partNumber.value.trim().length > 2 &&
    elements.edaSoftware.value &&
    elements.apiKey.value.trim().length > 10;
  
  elements.generateBtn.disabled = !isFormValid || isGenerating;
  elements.generateBtn.style.opacity = (isFormValid && !isGenerating) ? '1' : '0.6';
}

// Start the generation process
function startGeneration() {
  if (isGenerating || !elements.generateBtn) return;
  
  console.log('Starting generation process...');
  isGenerating = true;
  currentWorkflowStep = 0;
  
  // Update button state
  const btnText = elements.generateBtn.querySelector('.btn-text');
  const btnLoader = elements.generateBtn.querySelector('.btn-loader');
  
  if (btnText && btnLoader) {
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
  }
  elements.generateBtn.disabled = true;
  
  // Reset workflow steps
  resetWorkflowSteps();
  
  // Start workflow simulation
  runWorkflowStep();
}

// Reset all workflow steps to pending
function resetWorkflowSteps() {
  document.querySelectorAll('.workflow-step').forEach(step => {
    step.classList.remove('active', 'completed');
  });
  
  document.querySelectorAll('.step-status').forEach(status => {
    status.className = 'step-status pending';
    const stepId = status.id.split('-').pop();
    status.innerHTML = '<span>' + stepId + '</span>';
  });
}

// Run individual workflow step
function runWorkflowStep() {
  if (currentWorkflowStep >= appData.workflow_steps.length) {
    completeGeneration();
    return;
  }
  
  const stepId = currentWorkflowStep + 1;
  const stepElement = document.querySelector(`.workflow-step:nth-child(${stepId})`);
  const statusElement = document.getElementById(`step-status-${stepId}`);
  
  if (stepElement && statusElement) {
    // Set current step as active
    stepElement.classList.add('active');
    statusElement.className = 'step-status active';
    statusElement.innerHTML = '⚡';
    
    // Simulate processing time (2-4 seconds per step)
    const processingTime = Math.random() * 2000 + 2000;
    
    setTimeout(() => {
      // Mark as completed
      stepElement.classList.remove('active');
      stepElement.classList.add('completed');
      statusElement.className = 'step-status completed';
      statusElement.innerHTML = '✓';
      
      currentWorkflowStep++;
      
      // Move to next step
      setTimeout(() => {
        runWorkflowStep();
      }, 500);
      
    }, processingTime);
  }
}

// Complete the generation process
function completeGeneration() {
  isGenerating = false;
  
  // Reset button state
  const btnText = elements.generateBtn.querySelector('.btn-text');
  const btnLoader = elements.generateBtn.querySelector('.btn-loader');
  
  if (btnText && btnLoader) {
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
    btnText.textContent = 'Generate Another';
  }
  elements.generateBtn.disabled = false;
  updateGenerateButtonState();
  
  // Show results section
  if (elements.resultsSection) {
    elements.resultsSection.classList.remove('hidden');
    elements.resultsSection.classList.add('fade-in');
    
    // Update results with generated data
    updateResults();
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
  
  // Show success message
  showSuccessMessage('Library generation completed successfully!');
}

// Update results section with generated data
function updateResults() {
  if (!elements.partNumber || !elements.edaSoftware) return;
  
  const partNumber = elements.partNumber.value;
  const edaSoftware = elements.edaSoftware.value;
  
  // Update component specifications
  const specsContainer = document.querySelector('.specs-list');
  if (specsContainer) {
    // Simulate extracted specifications
    const mockSpecs = generateMockSpecs(partNumber);
    
    specsContainer.innerHTML = Object.entries(mockSpecs).map(([key, value]) => `
      <div class="spec-item">
        <span class="spec-label">${key}:</span>
        <span class="spec-value">${value}</span>
      </div>
    `).join('');
  }
  
  // Update download button with correct format
  const downloadBtn = document.querySelector('.download-buttons .btn--primary');
  if (downloadBtn) {
    const softwareOption = appData.eda_software_options.find(sw => sw.name === edaSoftware);
    const format = softwareOption ? softwareOption.format : '.lib';
    downloadBtn.innerHTML = `📦 Download ${edaSoftware} Library (${format})`;
  }
}

// Generate mock specifications based on part number
function generateMockSpecs(partNumber) {
  // Simple heuristics for common part types
  const specs = {};
  
  if (partNumber.includes('STM32')) {
    specs['Package'] = 'LQFP-100';
    specs['Pin Count'] = '100';
    specs['Body Size'] = '14.0 × 14.0 mm';
    specs['Pin Pitch'] = '0.5 mm';
    specs['Height'] = '1.6 mm';
  } else if (partNumber.includes('LM')) {
    specs['Package'] = 'DIP-8';
    specs['Pin Count'] = '8';
    specs['Body Size'] = '9.8 × 6.4 mm';
    specs['Pin Pitch'] = '2.54 mm';
    specs['Height'] = '4.3 mm';
  } else if (partNumber.includes('74HC')) {
    specs['Package'] = 'SOIC-16';
    specs['Pin Count'] = '16';
    specs['Body Size'] = '10.3 × 7.5 mm';
    specs['Pin Pitch'] = '1.27 mm';
    specs['Height'] = '2.65 mm';
  } else if (partNumber.includes('ESP32')) {
    specs['Package'] = 'Module';
    specs['Pin Count'] = '38';
    specs['Body Size'] = '18.0 × 25.5 mm';
    specs['Pin Pitch'] = '1.27 mm';
    specs['Height'] = '3.1 mm';
  } else {
    // Generic specs
    specs['Package'] = 'QFP-64';
    specs['Pin Count'] = '64';
    specs['Body Size'] = '10.0 × 10.0 mm';
    specs['Pin Pitch'] = '0.8 mm';
    specs['Height'] = '1.7 mm';
  }
  
  return specs;
}

// Update preview content based on tab
function updatePreviewContent(tabType) {
  const previewContent = document.querySelector('.preview-content');
  if (!previewContent) return;
  
  const iconMap = {
    'symbol': '⚡',
    'footprint': '🔲'
  };
  
  const textMap = {
    'symbol': 'Generated symbol will appear here',
    'footprint': 'Generated footprint will appear here'
  };
  
  previewContent.innerHTML = `
    <div class="preview-placeholder">
      <span class="preview-icon">${iconMap[tabType] || '⚡'}</span>
      <p>${textMap[tabType] || 'Generated content will appear here'}</p>
    </div>
  `;
}

// Show success message
function showSuccessMessage(message) {
  if (!elements.generateBtn) return;
  
  // Remove any existing messages
  const existingMessage = document.querySelector('.success-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message fade-in';
  messageDiv.innerHTML = `✅ ${message}`;
  
  // Insert after the generate button
  elements.generateBtn.parentElement.appendChild(messageDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove();
    }
  }, 5000);
}

// Show error message
function showErrorMessage(message) {
  if (!elements.generateBtn) return;
  
  // Remove any existing messages
  const existingMessage = document.querySelector('.error-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'error-message fade-in';
  messageDiv.innerHTML = `❌ ${message}`;
  
  // Insert after the generate button
  elements.generateBtn.parentElement.appendChild(messageDiv);
  
  // Auto-remove after 7 seconds
  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove();
    }
  }, 7000);
}

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + Enter to generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!isGenerating && elements.generateBtn && !elements.generateBtn.disabled) {
      e.preventDefault();
      startGeneration();
    }
  }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    appData,
    startGeneration,
    updateResults
  };
}