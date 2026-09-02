/* =====================================================
   STATE MANAGER - Global application state management
   ===================================================== */

class StateManager {
    constructor() {
        this.currentProject = null;
        this.previousProject = null;
        this.currentView = 'dashboard';
        this.selectedSceneId = null;
        this.selectedCharacterId = null;
        this.selectedLocationId = null;
        this.generationInProgress = false;
        this.autoSaveInterval = null;
        this.listeners = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySteps = 50;
    }

    /* =====================================================
       PROJECT STATE
       ===================================================== */

    setCurrentProject(project) {
        this.previousProject = this.currentProject;
        this.currentProject = project;
        this.selectedSceneId = null;
        this.selectedCharacterId = null;
        this.selectedLocationId = null;
        this.emit('projectChanged', project);
    }

    getCurrentProject() {
        return this.currentProject;
    }

    clearCurrentProject() {
        this.previousProject = this.currentProject;
        this.currentProject = null;
        this.emit('projectCleared');
    }

    /* =====================================================
       VIEW STATE
       ===================================================== */

    setCurrentView(viewName) {
        this.currentView = viewName;
        this.emit('viewChanged', viewName);
    }

    getCurrentView() {
        return this.currentView;
    }

    /* =====================================================
       SELECTION STATE
       ===================================================== */

    selectScene(sceneId) {
        if (this.currentProject) {
            this.selectedSceneId = sceneId;
            const scene = this.currentProject.scenes.find(s => s.id === sceneId);
            this.emit('sceneSelected', scene);
        }
    }

    getSelectedScene() {
        if (!this.currentProject || !this.selectedSceneId) return null;
        return this.currentProject.scenes.find(s => s.id === this.selectedSceneId);
    }

    selectCharacter(characterId) {
        if (this.currentProject) {
            this.selectedCharacterId = characterId;
            const character = this.currentProject.characters.find(c => c.id === characterId);
            this.emit('characterSelected', character);
        }
    }

    getSelectedCharacter() {
        if (!this.currentProject || !this.selectedCharacterId) return null;
        return this.currentProject.characters.find(c => c.id === this.selectedCharacterId);
    }

    selectLocation(locationId) {
        if (this.currentProject) {
            this.selectedLocationId = locationId;
            const location = this.currentProject.locations.find(l => l.id === locationId);
            this.emit('locationSelected', location);
        }
    }

    getSelectedLocation() {
        if (!this.currentProject || !this.selectedLocationId) return null;
        return this.currentProject.locations.find(l => l.id === this.selectedLocationId);
    }

    /* =====================================================
       GENERATION STATE
       ===================================================== */

    setGenerationInProgress(value) {
        this.generationInProgress = value;
        this.emit('generationStateChanged', value);
    }

    isGenerationInProgress() {
        return this.generationInProgress;
    }

    /* =====================================================
       AUTO-SAVE
       ===================================================== */

    enableAutoSave(interval = 60000) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (this.currentProject) {
                storageManager.saveProject(this.currentProject);
                this.emit('autoSaved', this.currentProject);
            }
        }, interval);
    }

    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /* =====================================================
       UNDO/REDO
       ===================================================== */

    saveState() {
        if (this.currentProject) {
            this.historyIndex++;
            this.history = this.history.slice(0, this.historyIndex);
            this.history.push(JSON.parse(JSON.stringify(this.currentProject.toJSON())));
            
            if (this.history.length > this.maxHistorySteps) {
                this.history.shift();
            } else {
                this.historyIndex++;
            }
            
            this.emit('stateSaved');
        }
    }

    undo() {
        if (this.canUndo()) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.currentProject = Project.fromJSON(state);
            this.emit('undone', this.currentProject);
        }
    }

    redo() {
        if (this.canRedo()) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.currentProject = Project.fromJSON(state);
            this.emit('redone', this.currentProject);
        }
    }

    canUndo() {
        return this.historyIndex > 0;
    }

    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    clearHistory() {
        this.history = [];
        this.historyIndex = -1;
    }

    /* =====================================================
       EVENT SYSTEM
       ===================================================== */

    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
        
        return () => {
            this.off(eventName, callback);
        };
    }

    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            const callbacks = this.listeners.get(eventName);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    once(eventName, callback) {
        const unsubscribe = this.on(eventName, (...args) => {
            callback(...args);
            unsubscribe();
        });
    }

    emit(eventName, ...args) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }

    /* =====================================================
       PROJECT MODIFICATIONS
       ===================================================== */

    addScene(scene) {
        if (this.currentProject) {
            this.saveState();
            this.currentProject.scenes.push(scene);
            this.emit('sceneAdded', scene);
            storageManager.saveProject(this.currentProject);
        }
    }

    updateScene(sceneId, updates) {
        if (this.currentProject) {
            const scene = this.currentProject.scenes.find(s => s.id === sceneId);
            if (scene) {
                this.saveState();
                Object.assign(scene, updates);
                this.emit('sceneUpdated', scene);
                storageManager.saveProject(this.currentProject);
            }
        }
    }

    deleteScene(sceneId) {
        if (this.currentProject) {
            this.saveState();
            this.currentProject.scenes = this.currentProject.scenes.filter(s => s.id !== sceneId);
            this.emit('sceneDeleted', sceneId);
            storageManager.saveProject(this.currentProject);
        }
    }

    addCharacter(character) {
        if (this.currentProject) {
            this.saveState();
            this.currentProject.characters.push(character);
            this.emit('characterAdded', character);
            storageManager.saveProject(this.currentProject);
        }
    }

    updateCharacter(characterId, updates) {
        if (this.currentProject) {
            const character = this.currentProject.characters.find(c => c.id === characterId);
            if (character) {
                this.saveState();
                Object.assign(character, updates);
                this.emit('characterUpdated', character);
                storageManager.saveProject(this.currentProject);
            }
        }
    }

    deleteCharacter(characterId) {
        if (this.currentProject) {
            this.saveState();
            this.currentProject.characters = this.currentProject.characters.filter(c => c.id !== characterId);
            this.emit('characterDeleted', characterId);
            storageManager.saveProject(this.currentProject);
        }
    }

    addLocation(location) {
        if (this.currentProject) {
            this.saveState();
            this.currentProject.locations.push(location);
            this.emit('locationAdded', location);
            storageManager.saveProject(this.currentProject);
        }
    }

    updateLocation(locationId, updates) {
        if (this.currentProject) {
            const location = this.currentProject.locations.find(l => l.id === locationId);
            if (location) {
                this.saveState();
                Object.assign(location, updates);
                this.emit('locationUpdated', location);
                storageManager.saveProject(this.currentProject);
            }
        }
    }

    deleteLocation(locationId) {
        if (this.currentProject) {
            this.saveState();
            this.currentProject.locations = this.currentProject.locations.filter(l => l.id !== locationId);
            this.emit('locationDeleted', locationId);
            storageManager.saveProject(this.currentProject);
        }
    }

    /* =====================================================
       PROJECT METADATA
       ===================================================== */

    updateProjectMetadata(updates) {
        if (this.currentProject) {
            this.saveState();
            Object.assign(this.currentProject.metadata, updates);
            this.emit('metadataUpdated', this.currentProject.metadata);
            storageManager.saveProject(this.currentProject);
        }
    }

    getProjectStats() {
        if (!this.currentProject) return null;
        
        return {
            sceneCount: this.currentProject.scenes.length,
            characterCount: this.currentProject.characters.length,
            locationCount: this.currentProject.locations.length,
            voiceCount: this.currentProject.voices.length,
            assetCount: this.currentProject.assets.length,
            scriptLength: this.currentProject.script.length,
            estimatedDuration: this.currentProject.metadata.estimatedDuration,
            completedTasks: this.currentProject.metadata.completedTasks,
            failedTasks: this.currentProject.metadata.failedTasks,
            generationProgress: this.currentProject.metadata.generationProgress
        };
    }

    /* =====================================================
       CLEANUP
       ===================================================== */

    reset() {
        this.clearCurrentProject();
        this.clearHistory();
        this.disableAutoSave();
        this.selectedSceneId = null;
        this.selectedCharacterId = null;
        this.selectedLocationId = null;
        this.generationInProgress = false;
    }

    destroy() {
        this.reset();
        this.listeners.clear();
    }
}

// Create global instance
const stateManager = new StateManager();
