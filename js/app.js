/* =====================================================
   MAIN APP - Application orchestration and initialization
   ===================================================== */

class AIKidsVideoStudio {
    constructor() {
        this.initialized = false;
        this.config = {
            autoSaveInterval: 60000,
            maxProjectSize: 100 * 1024 * 1024, // 100MB
            videoResolution: '1920x1080',
            videoFramerate: 30
        };
    }

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async init() {
        try {
            console.log('Initializing AI Kids Video Studio...');

            // Load settings from storage
            await this.loadSettings();

            // Initialize managers
            this.initializeManagers();

            // Setup event listeners
            this.setupEventListeners();

            // Load recent projects
            await this.loadRecentProjects();

            // Show dashboard
            uiManager.switchView('dashboard');

            // Enable auto-save
            stateManager.enableAutoSave(this.config.autoSaveInterval);

            // Subscribe to state changes
            this.subscribeToStateChanges();

            this.initialized = true;
            console.log('AI Kids Video Studio initialized successfully');

            return { success: true };
        } catch (error) {
            console.error('Initialization error:', error);
            uiManager.showMessage('project-message', `Initialization error: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    initializeManagers() {
        // Managers are already instantiated globally
        // This just ensures they're ready
        if (!stateManager) throw new Error('State manager not initialized');
        if (!storageManager) throw new Error('Storage manager not initialized');
        if (!uiManager) throw new Error('UI manager not initialized');
        if (!projectManager) throw new Error('Project manager not initialized');
        if (!scriptAnalyzer) throw new Error('Script analyzer not initialized');
    }

    async loadSettings() {
        try {
            const settings = storageManager.getSettings();
            if (settings) {
                Object.assign(this.config, settings);
                
                // Initialize script analyzer with API key
                if (settings.googleApiKey) {
                    scriptAnalyzer.initialize(settings.googleApiKey);
                    if (settings.googleTextModel) {
                        scriptAnalyzer.setModel(settings.googleTextModel);
                    }
                }
            }
        } catch (error) {
            console.warn('Error loading settings:', error);
        }
    }

    /* =====================================================
       PROJECT MANAGEMENT
       ===================================================== */

    async newProject(name = 'Untitled Project') {
        const result = projectManager.createNewProject(name);
        if (result.success) {
            uiManager.switchView('project');
        }
        return result;
    }

    async openProject(projectId) {
        return projectManager.loadProject(projectId);
    }

    async saveProject() {
        return projectManager.saveCurrentProject();
    }

    async deleteProject(projectId) {
        return projectManager.deleteProject(projectId);
    }

    async duplicateProject(projectId, newName) {
        return projectManager.duplicateProject(projectId, newName);
    }

    async loadRecentProjects() {
        try {
            const recent = projectManager.getRecentProjects(5);
            uiManager.displayRecentProjects(recent);
        } catch (error) {
            console.warn('Error loading recent projects:', error);
        }
    }

    /* =====================================================
       SCRIPT OPERATIONS
       ===================================================== */

    async analyzeScript() {
        const project = stateManager.getCurrentProject();
        if (!project) {
            uiManager.showMessage('project-message', 'No project loaded', 'error');
            return { success: false };
        }

        const scriptContent = uiManager.getScriptContent();
        const result = await scriptAnalyzer.analyzeScript(scriptContent, project.ageGroup);

        if (result.success) {
            return projectManager.projectManager.applyAnalysisToProject(project, result);
        }

        uiManager.showMessage('project-message', result.error, 'error');
        return result;
    }

    updateScript(content) {
        return projectManager.updateScript(content);
    }

    /* =====================================================
       CHARACTER OPERATIONS
       ===================================================== */

    addCharacter(name) {
        return projectManager.addCharacter(name);
    }

    updateCharacter(characterId, updates) {
        return projectManager.updateCharacter(characterId, updates);
    }

    deleteCharacter(characterId) {
        return projectManager.deleteCharacter(characterId);
    }

    getCharacter(characterId) {
        return projectManager.getCharacter(characterId);
    }

    /* =====================================================
       LOCATION OPERATIONS
       ===================================================== */

    addLocation(name) {
        return projectManager.addLocation(name);
    }

    updateLocation(locationId, updates) {
        return projectManager.updateLocation(locationId, updates);
    }

    deleteLocation(locationId) {
        return projectManager.deleteLocation(locationId);
    }

    getLocation(locationId) {
        return projectManager.getLocation(locationId);
    }

    /* =====================================================
       SCENE OPERATIONS
       ===================================================== */

    addScene(title) {
        return projectManager.addScene(title);
    }

    updateScene(sceneId, updates) {
        return projectManager.updateScene(sceneId, updates);
    }

    deleteScene(sceneId) {
        return projectManager.deleteScene(sceneId);
    }

    getScene(sceneId) {
        return projectManager.getScene(sceneId);
    }

    /* =====================================================
       VOICE OPERATIONS
       ===================================================== */

    addVoice(name) {
        return projectManager.addVoice(name);
    }

    updateVoice(voiceId, updates) {
        return projectManager.updateVoice(voiceId, updates);
    }

    deleteVoice(voiceId) {
        return projectManager.deleteVoice(voiceId);
    }

    /* =====================================================
       ASSET OPERATIONS
       ===================================================== */

    addAsset(type, sceneId, filename, url, size) {
        return projectManager.addAsset(type, sceneId, filename, url, size);
    }

    updateAsset(assetId, updates) {
        return projectManager.updateAsset(assetId, updates);
    }

    deleteAsset(assetId) {
        return projectManager.deleteAsset(assetId);
    }

    /* =====================================================
       SETTINGS
       ===================================================== */

    updateSettings(newSettings) {
        try {
            Object.assign(this.config, newSettings);
            storageManager.saveSettings(newSettings);

            // Update script analyzer if API key changed
            if (newSettings.googleApiKey) {
                scriptAnalyzer.initialize(newSettings.googleApiKey);
            }
            if (newSettings.googleTextModel) {
                scriptAnalyzer.setModel(newSettings.googleTextModel);
            }

            uiManager.showMessage('settings-message', 'Settings saved successfully', 'success');
            return { success: true };
        } catch (error) {
            console.error('Error updating settings:', error);
            uiManager.showMessage('settings-message', `Error saving settings: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    getSettings() {
        return { ...this.config };
    }

    /* =====================================================
       UNDO/REDO
       ===================================================== */

    undo() {
        projectManager.undo();
    }

    redo() {
        projectManager.redo();
    }

    canUndo() {
        return projectManager.canUndo();
    }

    canRedo() {
        return projectManager.canRedo();
    }

    /* =====================================================
       BACKUP/EXPORT
       ===================================================== */

    exportProject() {
        const project = stateManager.getCurrentProject();
        if (!project) return { success: false, error: 'No project loaded' };
        return projectManager.exportProject(project.id);
    }

    importProject(jsonData) {
        return projectManager.importProject(jsonData);
    }

    createBackup() {
        return projectManager.createBackup();
    }

    restoreBackup(backupJson) {
        return projectManager.restoreBackup(backupJson);
    }

    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    setupEventListeners() {
        // Project buttons
        const newProjectBtn = document.getElementById('new-project-btn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.handleNewProject());
        }

        const openProjectBtn = document.getElementById('open-project-btn');
        if (openProjectBtn) {
            openProjectBtn.addEventListener('click', () => this.handleOpenProject());
        }

        const duplicateProjectBtn = document.getElementById('duplicate-project-btn');
        if (duplicateProjectBtn) {
            duplicateProjectBtn.addEventListener('click', () => this.handleDuplicateProject());
        }

        const deleteProjectBtn = document.getElementById('delete-project-btn');
        if (deleteProjectBtn) {
            deleteProjectBtn.addEventListener('click', () => this.handleDeleteProject());
        }

        // Script editor buttons
        const analyzeScriptBtn = document.getElementById('analyze-script-btn');
        if (analyzeScriptBtn) {
            analyzeScriptBtn.addEventListener('click', () => this.analyzeScript());
        }

        const clearScriptBtn = document.getElementById('clear-script-btn');
        if (clearScriptBtn) {
            clearScriptBtn.addEventListener('click', () => this.handleClearScript());
        }

        const saveScriptBtn = document.getElementById('save-script-btn');
        if (saveScriptBtn) {
            saveScriptBtn.addEventListener('click', () => this.handleSaveScript());
        }

        // Project management buttons
        const saveProjectBtn = document.getElementById('save-project-btn');
        if (saveProjectBtn) {
            saveProjectBtn.addEventListener('click', () => this.handleSaveProject());
        }

        // Settings buttons
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
        }

        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.handleResetSettings());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Recent projects list
        document.addEventListener('click', (e) => {
            if (e.target.closest('.project-item')) {
                const projectId = e.target.closest('.project-item').dataset.id;
                this.openProject(projectId);
            }
        });

        // Character, location, scene actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="edit"]')) {
                this.handleEditItem(e);
            }
            if (e.target.closest('[data-action="delete"]')) {
                this.handleDeleteItem(e);
            }
            if (e.target.closest('[data-action="generate"]')) {
                this.handleGenerateScene(e);
            }
        });
    }

    /* =====================================================
       EVENT HANDLERS
       ===================================================== */

    handleNewProject() {
        const name = prompt('Enter project name:', 'Untitled Project');
        if (name) {
            this.newProject(name);
        }
    }

    handleOpenProject() {
        const projects = projectManager.getAllProjects();
        if (projects.length === 0) {
            uiManager.showMessage('project-message', 'No projects available', 'info');
            return;
        }

        const projectId = prompt(
            'Enter project ID:\n' + projects.map(p => `${p.id}: ${p.name}`).join('\n')
        );

        if (projectId) {
            this.openProject(projectId);
        }
    }

    handleDuplicateProject() {
        const project = stateManager.getCurrentProject();
        if (!project) {
            uiManager.showMessage('project-message', 'No project loaded', 'error');
            return;
        }

        const newName = prompt('Enter new project name:', `${project.name} (Copy)`);
        if (newName) {
            this.duplicateProject(project.id, newName);
        }
    }

    handleDeleteProject() {
        const project = stateManager.getCurrentProject();
        if (!project) {
            uiManager.showMessage('project-message', 'No project loaded', 'error');
            return;
        }

        uiManager.showConfirmDialog(
            'Delete Project',
            `Are you sure you want to delete "${project.name}"? This cannot be undone.`,
            () => this.deleteProject(project.id),
            null
        );
    }

    handleSaveProject() {
        // Update form values from UI
        const project = stateManager.getCurrentProject();
        if (project) {
            project.name = document.getElementById('project-name')?.value || project.name;
            project.description = document.getElementById('project-description')?.value || project.description;
            project.ageGroup = document.getElementById('project-age-group')?.value || project.ageGroup;
            project.visualStyle = document.getElementById('project-visual-style')?.value || project.visualStyle;
        }

        this.saveProject();
    }

    handleClearScript() {
        uiManager.showConfirmDialog(
            'Clear Script',
            'Are you sure you want to clear the script? This cannot be undone.',
            () => uiManager.clearScript(),
            null
        );
    }

    handleSaveScript() {
        const content = uiManager.getScriptContent();
        this.updateScript(content);
        uiManager.showMessage('project-message', 'Script saved successfully', 'success');
    }

    handleSaveSettings() {
        const settings = {
            googleApiKey: document.getElementById('google-api-key')?.value || '',
            googleTextModel: document.getElementById('google-text-model')?.value || 'gemini-2.0-flash',
            googleImageModel: document.getElementById('google-image-model')?.value || 'gemini-2.0-flash',
            googleVideoModel: document.getElementById('google-video-model')?.value || 'gemini-2.0-flash',
            defaultAgeGroup: document.getElementById('default-age-group')?.value || '5-8',
            defaultVisualStyle: document.getElementById('default-visual-style')?.value || 'cartoon',
            autoGenerateMusic: document.getElementById('auto-generate-music')?.checked || false,
            autoGenerateSfx: document.getElementById('auto-generate-sfx')?.checked || false,
            videoResolution: document.getElementById('video-resolution')?.value || '1920x1080',
            videoFramerate: parseInt(document.getElementById('video-framerate')?.value) || 30
        };

        this.updateSettings(settings);
    }

    handleResetSettings() {
        uiManager.showConfirmDialog(
            'Reset Settings',
            'Are you sure you want to reset all settings to defaults?',
            () => {
                const defaultSettings = {
                    googleApiKey: '',
                    googleTextModel: 'gemini-2.0-flash',
                    googleImageModel: 'gemini-2.0-flash',
                    googleVideoModel: 'gemini-2.0-flash',
                    defaultAgeGroup: '5-8',
                    defaultVisualStyle: 'cartoon',
                    autoGenerateMusic: false,
                    autoGenerateSfx: false,
                    videoResolution: '1920x1080',
                    videoFramerate: 30
                };
                this.updateSettings(defaultSettings);
            },
            null
        );
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.handleSaveProject();
                    break;
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 'n':
                    e.preventDefault();
                    this.handleNewProject();
                    break;
            }
        }
    }

    handleEditItem(e) {
        const card = e.target.closest('[data-id]');
        const id = card?.dataset.id;
        console.log('Edit item:', id);
        // TODO: Implement edit dialogs
    }

    handleDeleteItem(e) {
        const card = e.target.closest('[data-id]');
        const id = card?.dataset.id;
        if (card.classList.contains('character-card')) {
            this.deleteCharacter(id);
        } else if (card.classList.contains('location-card')) {
            this.deleteLocation(id);
        } else if (card.classList.contains('scene-card')) {
            this.deleteScene(id);
        }
    }

    handleGenerateScene(e) {
        const card = e.target.closest('[data-id]');
        const sceneId = card?.dataset.id;
        console.log('Generate scene:', sceneId);
        // TODO: Implement scene generation
    }

    /* =====================================================
       STATE SUBSCRIPTIONS
       ===================================================== */

    subscribeToStateChanges() {
        // Project changed
        stateManager.on('projectChanged', (project) => {
            console.log('Project changed:', project.name);
        });

        // View changed
        stateManager.on('viewChanged', (view) => {
            console.log('View changed to:', view);
        });

        // Generation state changed
        stateManager.on('generationStateChanged', (inProgress) => {
            if (inProgress) {
                uiManager.setButtonLoading(document.getElementById('analyze-script-btn'), true);
            } else {
                uiManager.enableButton(document.getElementById('analyze-script-btn'));
            }
        });

        // Auto save
        stateManager.on('autoSaved', (project) => {
            console.log('Project auto-saved:', project.name);
        });
    }

    /* =====================================================
       STATISTICS & ANALYTICS
       ===================================================== */

    getProjectStats() {
        return projectManager.getProjectStats();
    }

    getStorageStats() {
        return projectManager.getStorageStats();
    }

    /* =====================================================
       CLEANUP
       ===================================================== */

    destroy() {
        stateManager.disableAutoSave();
        stateManager.destroy();
        this.initialized = false;
    }
}

// Create global app instance
const app = new AIKidsVideoStudio();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    app.destroy();
});
