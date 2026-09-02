/* =====================================================
   PROJECT MANAGER - High-level project operations
   ===================================================== */

class ProjectManager {
    constructor() {
        this.currentProject = null;
    }

    /* =====================================================
       PROJECT LIFECYCLE
       ===================================================== */

    createNewProject(name = 'Untitled Project') {
        try {
            const project = new Project(name);
            storageManager.saveProject(project);
            stateManager.setCurrentProject(project);
            uiManager.displayProject(project);
            uiManager.showMessage('project-message', 'Project created successfully', 'success');
            return { success: true, project };
        } catch (error) {
            console.error('Error creating project:', error);
            uiManager.showMessage('project-message', `Error creating project: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    loadProject(projectId) {
        try {
            const project = storageManager.getProject(projectId);
            if (!project) {
                throw new Error('Project not found');
            }
            stateManager.setCurrentProject(project);
            stateManager.clearHistory();
            uiManager.displayProject(project);
            uiManager.showMessage('project-message', 'Project loaded successfully', 'success');
            return { success: true, project };
        } catch (error) {
            console.error('Error loading project:', error);
            uiManager.showMessage('project-message', `Error loading project: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    saveCurrentProject() {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) {
                throw new Error('No project loaded');
            }
            
            project.updatedAt = new Date().toISOString();
            storageManager.saveProject(project);
            uiManager.showMessage('project-message', 'Project saved successfully', 'success');
            return { success: true };
        } catch (error) {
            console.error('Error saving project:', error);
            uiManager.showMessage('project-message', `Error saving project: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    deleteProject(projectId) {
        try {
            const result = storageManager.deleteProject(projectId);
            if (result.success) {
                if (stateManager.getCurrentProject()?.id === projectId) {
                    stateManager.clearCurrentProject();
                    uiManager.clearProjectDisplay();
                }
                uiManager.showMessage('project-message', 'Project deleted successfully', 'success');
            }
            return result;
        } catch (error) {
            console.error('Error deleting project:', error);
            return { success: false, error: error.message };
        }
    }

    duplicateProject(projectId, newName) {
        try {
            const result = storageManager.duplicateProject(projectId, newName);
            if (result.success) {
                uiManager.showMessage('project-message', 'Project duplicated successfully', 'success');
                return result;
            }
            throw new Error(result.error);
        } catch (error) {
            console.error('Error duplicating project:', error);
            uiManager.showMessage('project-message', `Error duplicating project: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    getAllProjects() {
        return storageManager.getAllProjects();
    }

    getRecentProjects(limit = 5) {
        return storageManager.getRecentProjects(limit);
    }

    /* =====================================================
       PROJECT UPDATES
       ===================================================== */

    updateProjectMetadata(updates) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            Object.assign(project, updates);
            project.updatedAt = new Date().toISOString();
            stateManager.updateProjectMetadata(project.metadata || {});
            return { success: true };
        } catch (error) {
            console.error('Error updating project metadata:', error);
            return { success: false, error: error.message };
        }
    }

    updateScript(scriptContent) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            project.script = scriptContent;
            project.metadata.estimatedDuration = calculateScriptDuration(scriptContent);
            
            stateManager.saveState();
            storageManager.saveProject(project);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating script:', error);
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       SCENE MANAGEMENT
       ===================================================== */

    addScene(title = '', sceneNumber = 0) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            const scene = new Scene(title, sceneNumber || project.scenes.length + 1);
            stateManager.addScene(scene);
            
            return { success: true, scene };
        } catch (error) {
            console.error('Error adding scene:', error);
            return { success: false, error: error.message };
        }
    }

    updateScene(sceneId, updates) {
        try {
            stateManager.updateScene(sceneId, updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating scene:', error);
            return { success: false, error: error.message };
        }
    }

    deleteScene(sceneId) {
        try {
            stateManager.deleteScene(sceneId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting scene:', error);
            return { success: false, error: error.message };
        }
    }

    getScene(sceneId) {
        const project = stateManager.getCurrentProject();
        if (!project) return null;
        return project.scenes.find(s => s.id === sceneId);
    }

    /* =====================================================
       CHARACTER MANAGEMENT
       ===================================================== */

    addCharacter(name = '') {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            const character = new Character(name);
            stateManager.addCharacter(character);
            
            return { success: true, character };
        } catch (error) {
            console.error('Error adding character:', error);
            return { success: false, error: error.message };
        }
    }

    updateCharacter(characterId, updates) {
        try {
            stateManager.updateCharacter(characterId, updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating character:', error);
            return { success: false, error: error.message };
        }
    }

    deleteCharacter(characterId) {
        try {
            stateManager.deleteCharacter(characterId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting character:', error);
            return { success: false, error: error.message };
        }
    }

    getCharacter(characterId) {
        const project = stateManager.getCurrentProject();
        if (!project) return null;
        return project.characters.find(c => c.id === characterId);
    }

    /* =====================================================
       LOCATION MANAGEMENT
       ===================================================== */

    addLocation(name = '') {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            const location = new Location(name);
            stateManager.addLocation(location);
            
            return { success: true, location };
        } catch (error) {
            console.error('Error adding location:', error);
            return { success: false, error: error.message };
        }
    }

    updateLocation(locationId, updates) {
        try {
            stateManager.updateLocation(locationId, updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating location:', error);
            return { success: false, error: error.message };
        }
    }

    deleteLocation(locationId) {
        try {
            stateManager.deleteLocation(locationId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting location:', error);
            return { success: false, error: error.message };
        }
    }

    getLocation(locationId) {
        const project = stateManager.getCurrentProject();
        if (!project) return null;
        return project.locations.find(l => l.id === locationId);
    }

    /* =====================================================
       VOICE MANAGEMENT
       ===================================================== */

    addVoice(name = '') {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            const voice = new Voice(name);
            project.voices.push(voice);
            stateManager.saveState();
            storageManager.saveProject(project);
            
            return { success: true, voice };
        } catch (error) {
            console.error('Error adding voice:', error);
            return { success: false, error: error.message };
        }
    }

    updateVoice(voiceId, updates) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            const voice = project.voices.find(v => v.id === voiceId);
            if (!voice) throw new Error('Voice not found');

            Object.assign(voice, updates);
            stateManager.saveState();
            storageManager.saveProject(project);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating voice:', error);
            return { success: false, error: error.message };
        }
    }

    deleteVoice(voiceId) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            project.voices = project.voices.filter(v => v.id !== voiceId);
            stateManager.saveState();
            storageManager.saveProject(project);
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting voice:', error);
            return { success: false, error: error.message };
        }
    }

    getVoice(voiceId) {
        const project = stateManager.getCurrentProject();
        if (!project) return null;
        return project.voices.find(v => v.id === voiceId);
    }

    /* =====================================================
       ASSET MANAGEMENT
       ===================================================== */

    addAsset(type, sceneId, filename, url, size) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            const asset = new Asset(type, sceneId);
            asset.filename = filename;
            asset.url = url;
            asset.size = size;
            
            project.assets.push(asset);
            stateManager.saveState();
            storageManager.saveProject(project);
            
            return { success: true, asset };
        } catch (error) {
            console.error('Error adding asset:', error);
            return { success: false, error: error.message };
        }
    }

    updateAsset(assetId, updates) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            const asset = project.assets.find(a => a.id === assetId);
            if (!asset) throw new Error('Asset not found');

            Object.assign(asset, updates);
            stateManager.saveState();
            storageManager.saveProject(project);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating asset:', error);
            return { success: false, error: error.message };
        }
    }

    deleteAsset(assetId) {
        try {
            const project = stateManager.getCurrentProject();
            if (!project) throw new Error('No project loaded');

            project.assets = project.assets.filter(a => a.id !== assetId);
            stateManager.saveState();
            storageManager.saveProject(project);
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting asset:', error);
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       EXPORT/IMPORT
       ===================================================== */

    exportProject(projectId) {
        try {
            const result = storageManager.exportProject(projectId);
            if (result.success) {
                uiManager.showMessage('project-message', 'Project exported successfully', 'success');
            }
            return result;
        } catch (error) {
            console.error('Error exporting project:', error);
            uiManager.showMessage('project-message', `Error exporting project: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    importProject(jsonString) {
        try {
            const result = storageManager.importProject(jsonString);
            if (result.success) {
                uiManager.showMessage('project-message', 'Project imported successfully', 'success');
                return result;
            }
            throw new Error(result.error);
        } catch (error) {
            console.error('Error importing project:', error);
            uiManager.showMessage('project-message', `Error importing project: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       BACKUP/RECOVERY
       ===================================================== */

    createBackup() {
        try {
            const result = storageManager.createBackup();
            if (result.success) {
                uiManager.showMessage('project-message', 'Backup created successfully', 'success');
            }
            return result;
        } catch (error) {
            console.error('Error creating backup:', error);
            return { success: false, error: error.message };
        }
    }

    restoreBackup(backupJson) {
        try {
            const result = storageManager.restoreBackup(backupJson);
            if (result.success) {
                uiManager.showMessage('project-message', 'Backup restored successfully', 'success');
            }
            return result;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       UNDO/REDO
       ===================================================== */

    undo() {
        stateManager.undo();
        const project = stateManager.getCurrentProject();
        if (project) {
            uiManager.displayProject(project);
        }
    }

    redo() {
        stateManager.redo();
        const project = stateManager.getCurrentProject();
        if (project) {
            uiManager.displayProject(project);
        }
    }

    canUndo() {
        return stateManager.canUndo();
    }

    canRedo() {
        return stateManager.canRedo();
    }

    /* =====================================================
       STATISTICS & REPORTING
       ===================================================== */

    getProjectStats() {
        return stateManager.getProjectStats();
    }

    getStorageStats() {
        return storageManager.getStorageStats();
    }

    searchProjects(query) {
        return storageManager.searchProjects(query);
    }

    filterProjectsByDate(startDate, endDate) {
        return storageManager.filterProjectsByDate(startDate, endDate);
    }
}

// Create global instance
const projectManager = new ProjectManager();
