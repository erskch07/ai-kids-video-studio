/* =====================================================
   UI MANAGER - DOM manipulation and view rendering
   ===================================================== */

class UIManager {
    constructor() {
        this.views = new Map();
        this.currentView = null;
        this.modals = new Map();
        this.toasts = [];
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
    }

    /* =====================================================
       ELEMENT CACHING
       ===================================================== */

    cacheElements() {
        this.elements = {
            // Navigation
            navItems: document.querySelectorAll('.nav-item'),
            
            // Header
            pageTitle: document.getElementById('page-title'),
            currentProject: document.getElementById('current-project'),
            
            // Views
            viewsContainer: document.querySelector('.views-container'),
            dashboardView: document.getElementById('dashboard-view'),
            projectView: document.getElementById('project-view'),
            scriptView: document.getElementById('script-view'),
            charactersView: document.getElementById('characters-view'),
            locationsView: document.getElementById('locations-view'),
            scenesView: document.getElementById('scenes-view'),
            voicesView: document.getElementById('voices-view'),
            assetsView: document.getElementById('assets-view'),
            generationView: document.getElementById('generation-view'),
            timelineView: document.getElementById('timeline-view'),
            previewView: document.getElementById('preview-view'),
            exportView: document.getElementById('export-view'),
            youtubeView: document.getElementById('youtube-view'),
            settingsView: document.getElementById('settings-view'),
            
            // Dashboard elements
            statScenes: document.getElementById('stat-scenes'),
            statCharacters: document.getElementById('stat-characters'),
            statLocations: document.getElementById('stat-locations'),
            estimatedDuration: document.getElementById('estimated-duration'),
            actualDuration: document.getElementById('actual-duration'),
            generationProgress: document.getElementById('generation-progress'),
            progressPercentage: document.getElementById('progress-percentage'),
            completedTasks: document.getElementById('completed-tasks'),
            failedTasks: document.getElementById('failed-tasks'),
            remainingTasks: document.getElementById('remaining-tasks'),
            recentProjectsList: document.getElementById('recent-projects-list'),
            
            // Script editor
            scriptEditor: document.getElementById('script-editor'),
            charCount: document.getElementById('char-count'),
            analyzeScriptBtn: document.getElementById('analyze-script-btn'),
            clearScriptBtn: document.getElementById('clear-script-btn'),
            importTxtBtn: document.getElementById('import-txt-btn'),
            saveScriptBtn: document.getElementById('save-script-btn'),
            
            // Project form
            projectName: document.getElementById('project-name'),
            projectDescription: document.getElementById('project-description'),
            projectAgeGroup: document.getElementById('project-age-group'),
            projectVisualStyle: document.getElementById('project-visual-style'),
            saveProjectBtn: document.getElementById('save-project-btn'),
            deleteProjectBtn: document.getElementById('delete-project-btn'),
            projectMessage: document.getElementById('project-message'),
            
            // Project management
            newProjectBtn: document.getElementById('new-project-btn'),
            openProjectBtn: document.getElementById('open-project-btn'),
            duplicateProjectBtn: document.getElementById('duplicate-project-btn'),
            
            // Settings
            googleApiKey: document.getElementById('google-api-key'),
            googleTextModel: document.getElementById('google-text-model'),
            googleImageModel: document.getElementById('google-image-model'),
            googleVideoModel: document.getElementById('google-video-model'),
            defaultAgeGroup: document.getElementById('default-age-group'),
            defaultVisualStyle: document.getElementById('default-visual-style'),
            autoGenerateMusic: document.getElementById('auto-generate-music'),
            autoGenerateSfx: document.getElementById('auto-generate-sfx'),
            videoResolution: document.getElementById('video-resolution'),
            videoFramerate: document.getElementById('video-framerate'),
            saveSettingsBtn: document.getElementById('save-settings-btn'),
            resetSettingsBtn: document.getElementById('reset-settings-btn'),
            settingsMessage: document.getElementById('settings-message'),
            
            // Lists
            charactersList: document.getElementById('characters-list'),
            locationsList: document.getElementById('locations-list'),
            scenesList: document.getElementById('scenes-list'),
            voicesList: document.getElementById('voices-list'),
            assetsList: document.getElementById('assets-list'),
            generationQueue: document.getElementById('generation-queue'),
            
            // Modals
            analysisModal: document.getElementById('analysis-modal'),
            analysisStatus: document.getElementById('analysis-status'),
            confirmModal: document.getElementById('confirm-modal'),
            confirmTitle: document.getElementById('confirm-title'),
            confirmMessage: document.getElementById('confirm-message'),
            confirmOk: document.getElementById('confirm-ok'),
            confirmCancel: document.getElementById('confirm-cancel')
        };
    }

    setupEventListeners() {
        // Navigation
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', () => this.handleNavClick(item));
        });

        // Script editor
        if (this.elements.scriptEditor) {
            this.elements.scriptEditor.addEventListener('input', () => this.updateCharCount());
        }
    }

    /* =====================================================
       VIEW MANAGEMENT
       ===================================================== */

    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.classList.add('active');
        }

        // Update navigation
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            }
        });

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            project: 'Project Management',
            script: 'Script Editor',
            characters: 'Character Bible',
            locations: 'Location Bible',
            scenes: 'Scene Breakdown',
            voices: 'Voice Bible',
            assets: 'Generated Assets',
            generation: 'Generation Queue',
            timeline: 'Timeline',
            preview: 'Preview',
            export: 'Export',
            youtube: 'YouTube Package',
            settings: 'Settings'
        };

        if (this.elements.pageTitle) {
            this.elements.pageTitle.textContent = titles[viewName] || viewName;
        }

        stateManager.setCurrentView(viewName);
    }

    /* =====================================================
       PROJECT DISPLAY
       ===================================================== */

    displayProject(project) {
        if (!project) return;

        if (this.elements.currentProject) {
            this.elements.currentProject.textContent = project.name;
        }

        // Update form fields
        if (this.elements.projectName) {
            this.elements.projectName.value = project.name;
        }
        if (this.elements.projectDescription) {
            this.elements.projectDescription.value = project.description;
        }
        if (this.elements.projectAgeGroup) {
            this.elements.projectAgeGroup.value = project.ageGroup;
        }
        if (this.elements.projectVisualStyle) {
            this.elements.projectVisualStyle.value = project.visualStyle;
        }

        // Update script editor
        if (this.elements.scriptEditor) {
            this.elements.scriptEditor.value = project.script;
            this.updateCharCount();
        }

        // Update dashboard stats
        this.updateDashboardStats(project);

        // Update lists
        this.displayCharactersList(project.characters);
        this.displayLocationsList(project.locations);
        this.displayScenesList(project.scenes);
        this.displayVoicesList(project.voices);
        this.displayAssetsList(project.assets);

        // Enable buttons
        if (this.elements.deleteProjectBtn) {
            this.elements.deleteProjectBtn.disabled = false;
        }
        if (this.elements.duplicateProjectBtn) {
            this.elements.duplicateProjectBtn.disabled = false;
        }
    }

    clearProjectDisplay() {
        if (this.elements.currentProject) {
            this.elements.currentProject.textContent = 'No project loaded';
        }
        if (this.elements.projectName) {
            this.elements.projectName.value = '';
        }
        if (this.elements.projectDescription) {
            this.elements.projectDescription.value = '';
        }
        if (this.elements.scriptEditor) {
            this.elements.scriptEditor.value = '';
            this.updateCharCount();
        }
        this.displayCharactersList([]);
        this.displayLocationsList([]);
        this.displayScenesList([]);
        this.displayVoicesList([]);
        this.displayAssetsList([]);

        if (this.elements.deleteProjectBtn) {
            this.elements.deleteProjectBtn.disabled = true;
        }
        if (this.elements.duplicateProjectBtn) {
            this.elements.duplicateProjectBtn.disabled = true;
        }
    }

    updateDashboardStats(project) {
        if (this.elements.statScenes) {
            this.elements.statScenes.textContent = project.scenes.length;
        }
        if (this.elements.statCharacters) {
            this.elements.statCharacters.textContent = project.characters.length;
        }
        if (this.elements.statLocations) {
            this.elements.statLocations.textContent = project.locations.length;
        }
        if (this.elements.estimatedDuration) {
            this.elements.estimatedDuration.textContent = formatDuration(project.metadata.estimatedDuration);
        }
        if (this.elements.actualDuration) {
            this.elements.actualDuration.textContent = formatDuration(project.metadata.actualDuration);
        }

        this.updateGenerationProgress(project.metadata);
    }

    updateGenerationProgress(metadata) {
        if (this.elements.generationProgress) {
            this.elements.generationProgress.style.width = `${metadata.generationProgress}%`;
        }
        if (this.elements.progressPercentage) {
            this.elements.progressPercentage.textContent = `${Math.round(metadata.generationProgress)}%`;
        }
        if (this.elements.completedTasks) {
            this.elements.completedTasks.textContent = metadata.completedTasks;
        }
        if (this.elements.failedTasks) {
            this.elements.failedTasks.textContent = metadata.failedTasks;
        }
        if (this.elements.remainingTasks) {
            const remaining = (this.elements.remainingTasks.parentElement?.querySelectorAll('.stat-row').length || 0) - metadata.completedTasks - metadata.failedTasks;
            this.elements.remainingTasks.textContent = Math.max(0, remaining);
        }
    }

    /* =====================================================
       CHARACTERS, LOCATIONS, VOICES, SCENES
       ===================================================== */

    displayCharactersList(characters) {
        if (!this.elements.charactersList) return;

        if (characters.length === 0) {
            this.elements.charactersList.innerHTML = '<p class="empty-state">No characters yet. Analyze your script to auto-extract characters.</p>';
            return;
        }

        this.elements.charactersList.innerHTML = characters.map(char => `
            <div class="character-card" data-id="${char.id}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${char.name}</div>
                        <div class="card-subtitle">${char.role || 'Character'}</div>
                    </div>
                    <span class="card-badge">${char.age || 'Age TBD'}</span>
                </div>
                <div class="card-content">
                    <div class="card-detail">
                        <span class="card-label">Voice:</span> ${char.voice.name || 'Not assigned'}
                    </div>
                    <div class="card-detail">
                        <span class="card-label">Personality:</span> ${char.personality.join(', ') || 'TBD'}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" data-action="edit">Edit</button>
                    <button class="btn-icon" data-action="delete">Delete</button>
                </div>
            </div>
        `).join('');
    }

    displayLocationsList(locations) {
        if (!this.elements.locationsList) return;

        if (locations.length === 0) {
            this.elements.locationsList.innerHTML = '<p class="empty-state">No locations yet. Analyze your script to auto-extract locations.</p>';
            return;
        }

        this.elements.locationsList.innerHTML = locations.map(loc => `
            <div class="location-card" data-id="${loc.id}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${loc.name}</div>
                        <div class="card-subtitle">${loc.timeOfDay} - ${loc.weather}</div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-detail">
                        <span class="card-label">Mood:</span> ${loc.mood || 'TBD'}
                    </div>
                    <div class="card-detail">
                        <span class="card-label">Colors:</span> ${loc.colorPalette.join(', ') || 'TBD'}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" data-action="edit">Edit</button>
                    <button class="btn-icon" data-action="delete">Delete</button>
                </div>
            </div>
        `).join('');
    }

    displayScenesList(scenes) {
        if (!this.elements.scenesList) return;

        if (scenes.length === 0) {
            this.elements.scenesList.innerHTML = '<p class="empty-state">No scenes yet. Analyze your script to auto-generate scenes.</p>';
            return;
        }

        this.elements.scenesList.innerHTML = scenes.map(scene => `
            <div class="scene-card" data-id="${scene.id}">
                <div class="card-header">
                    <div>
                        <div class="card-title">Scene ${scene.number}: ${scene.title}</div>
                        <div class="card-subtitle">${scene.location}</div>
                    </div>
                    <span class="card-badge">${scene.generationStatus}</span>
                </div>
                <div class="card-content">
                    <div class="card-detail">
                        <span class="card-label">Characters:</span> ${scene.characters.join(', ') || 'None'}
                    </div>
                    <div class="card-detail">
                        <span class="card-label">Duration:</span> ${formatDuration(scene.actualDuration || scene.estimatedDuration)}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" data-action="edit">Edit</button>
                    <button class="btn-icon" data-action="generate">Generate</button>
                </div>
            </div>
        `).join('');
    }

    displayVoicesList(voices) {
        if (!this.elements.voicesList) return;

        if (voices.length === 0) {
            this.elements.voicesList.innerHTML = '<p class="empty-state">No voices yet. Voices will be assigned during script analysis.</p>';
            return;
        }

        this.elements.voicesList.innerHTML = voices.map(voice => `
            <div class="voice-card" data-id="${voice.id}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${voice.name}</div>
                        <div class="card-subtitle">${voice.ageCategory} - ${voice.tone}</div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-detail">
                        <span class="card-label">Pitch:</span> ${voice.pitch}
                    </div>
                    <div class="card-detail">
                        <span class="card-label">Speed:</span> ${voice.speed}x
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" data-action="edit">Edit</button>
                    <button class="btn-icon" data-action="delete">Delete</button>
                </div>
            </div>
        `).join('');
    }

    displayAssetsList(assets) {
        if (!this.elements.assetsList) return;

        if (assets.length === 0) {
            this.elements.assetsList.innerHTML = '<p class="empty-state">No assets generated yet.</p>';
            return;
        }

        this.elements.assetsList.innerHTML = assets.map(asset => `
            <div class="asset-card" data-id="${asset.id}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${asset.filename}</div>
                        <div class="card-subtitle">${asset.type}</div>
                    </div>
                    <span class="card-badge">${asset.generationStatus}</span>
                </div>
                <div class="card-content">
                    <div class="card-detail">
                        <span class="card-label">Size:</span> ${(asset.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" data-action="download">Download</button>
                    <button class="btn-icon" data-action="delete">Delete</button>
                </div>
            </div>
        `).join('');
    }

    displayRecentProjects(projects) {
        if (!this.elements.recentProjectsList) return;

        if (projects.length === 0) {
            this.elements.recentProjectsList.innerHTML = '<p class="empty-state">No recent projects. Create a new one to begin.</p>';
            return;
        }

        this.elements.recentProjectsList.innerHTML = projects.map(proj => `
            <div class="project-item" data-id="${proj.id}">
                <div class="project-item-name">${proj.name}</div>
                <div class="project-item-date">Updated ${new Date(proj.updatedAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    /* =====================================================
       SCRIPT EDITOR
       ===================================================== */

    updateCharCount() {
        if (this.elements.scriptEditor && this.elements.charCount) {
            this.elements.charCount.textContent = this.elements.scriptEditor.value.length;
        }
    }

    getScriptContent() {
        return this.elements.scriptEditor ? this.elements.scriptEditor.value : '';
    }

    setScriptContent(content) {
        if (this.elements.scriptEditor) {
            this.elements.scriptEditor.value = content;
            this.updateCharCount();
        }
    }

    clearScript() {
        if (this.elements.scriptEditor) {
            this.elements.scriptEditor.value = '';
            this.updateCharCount();
        }
    }

    /* =====================================================
       MODALS
       ===================================================== */

    showAnalysisModal() {
        if (this.elements.analysisModal) {
            this.elements.analysisModal.style.display = 'flex';
        }
    }

    hideAnalysisModal() {
        if (this.elements.analysisModal) {
            this.elements.analysisModal.style.display = 'none';
        }
    }

    updateAnalysisStatus(status) {
        if (this.elements.analysisStatus) {
            this.elements.analysisStatus.textContent = status;
        }
    }

    showConfirmDialog(title, message, onConfirm, onCancel) {
        if (this.elements.confirmModal) {
            this.elements.confirmTitle.textContent = title;
            this.elements.confirmMessage.textContent = message;

            this.elements.confirmOk.onclick = () => {
                onConfirm();
                this.hideConfirmDialog();
            };

            this.elements.confirmCancel.onclick = () => {
                if (onCancel) onCancel();
                this.hideConfirmDialog();
            };

            this.elements.confirmModal.style.display = 'flex';
        }
    }

    hideConfirmDialog() {
        if (this.elements.confirmModal) {
            this.elements.confirmModal.style.display = 'none';
        }
    }

    /* =====================================================
       MESSAGES
       ===================================================== */

    showMessage(elementId, message, type = 'info', duration = 4000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.textContent = message;
        element.className = `message show ${type}`;

        if (duration > 0) {
            setTimeout(() => {
                element.classList.remove('show');
            }, duration);
        }
    }

    /* =====================================================
       UTILITIES
       ===================================================== */

    handleNavClick(navItem) {
        const viewName = navItem.dataset.view;
        this.switchView(viewName);
    }

    disableButton(button) {
        if (button) button.disabled = true;
    }

    enableButton(button) {
        if (button) button.disabled = false;
    }

    setButtonLoading(button, isLoading) {
        if (button) {
            button.disabled = isLoading;
            button.style.opacity = isLoading ? '0.6' : '1';
        }
    }
}

// Create global instance
const uiManager = new UIManager();
