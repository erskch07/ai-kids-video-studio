/* =====================================================
   STORAGE MANAGER - Local storage and project persistence
   ===================================================== */

class StorageManager {
    constructor() {
        this.storageKey = 'aiKidsVideoStudio';
        this.projectsKey = `${this.storageKey}_projects`;
        this.settingsKey = `${this.storageKey}_settings`;
        this.init();
    }

    init() {
        if (!this.getAllProjects()) {
            this.saveProjects([]);
        }
        if (!this.getSettings()) {
            this.saveSettings(this.getDefaultSettings());
        }
    }

    /* =====================================================
       PROJECT MANAGEMENT
       ===================================================== */

    saveProject(project) {
        try {
            const projects = this.getAllProjects() || [];
            const index = projects.findIndex(p => p.id === project.id);
            
            const projectData = project.toJSON ? project.toJSON() : project;
            projectData.updatedAt = new Date().toISOString();
            
            if (index >= 0) {
                projects[index] = projectData;
            } else {
                projects.push(projectData);
            }
            
            this.saveProjects(projects);
            return { success: true, id: projectData.id };
        } catch (error) {
            console.error('Error saving project:', error);
            return { success: false, error: error.message };
        }
    }

    getProject(projectId) {
        try {
            const projects = this.getAllProjects() || [];
            const projectData = projects.find(p => p.id === projectId);
            
            if (projectData) {
                return Project.fromJSON(projectData);
            }
            return null;
        } catch (error) {
            console.error('Error loading project:', error);
            return null;
        }
    }

    getAllProjects() {
        try {
            const data = localStorage.getItem(this.projectsKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    }

    deleteProject(projectId) {
        try {
            const projects = this.getAllProjects() || [];
            const filtered = projects.filter(p => p.id !== projectId);
            this.saveProjects(filtered);
            return { success: true };
        } catch (error) {
            console.error('Error deleting project:', error);
            return { success: false, error: error.message };
        }
    }

    getRecentProjects(limit = 5) {
        try {
            const projects = this.getAllProjects() || [];
            return projects
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting recent projects:', error);
            return [];
        }
    }

    duplicateProject(projectId, newName) {
        try {
            const original = this.getProject(projectId);
            if (!original) {
                return { success: false, error: 'Project not found' };
            }

            const duplicate = new Project(newName || `${original.name} (Copy)`);
            Object.assign(duplicate, original);
            duplicate.id = generateID('proj');
            duplicate.createdAt = new Date().toISOString();
            duplicate.updatedAt = new Date().toISOString();

            this.saveProject(duplicate);
            return { success: true, id: duplicate.id };
        } catch (error) {
            console.error('Error duplicating project:', error);
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       PROJECT EXPORT/IMPORT
       ===================================================== */

    exportProject(projectId) {
        try {
            const project = this.getProject(projectId);
            if (!project) {
                return { success: false, error: 'Project not found' };
            }

            const json = JSON.stringify(project.toJSON(), null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            return {
                success: true,
                url: url,
                filename: `${project.name.replace(/\s+/g, '_')}_${new Date().getTime()}.json`
            };
        } catch (error) {
            console.error('Error exporting project:', error);
            return { success: false, error: error.message };
        }
    }

    importProject(jsonString) {
        try {
            const validation = validateJSON(jsonString);
            if (!validation.valid) {
                return { success: false, error: `Invalid JSON: ${validation.error}` };
            }

            const data = JSON.parse(jsonString);
            const project = Project.fromJSON(data);
            
            this.saveProject(project);
            return { success: true, id: project.id };
        } catch (error) {
            console.error('Error importing project:', error);
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       SETTINGS MANAGEMENT
       ===================================================== */

    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return { success: true };
        } catch (error) {
            console.error('Error saving settings:', error);
            return { success: false, error: error.message };
        }
    }

    getSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            googleApiKey: '',
            googleTextModel: 'gemini-2.0-flash',
            googleImageModel: 'imagen-3',
            googleVideoModel: 'vids-1',
            defaultAgeGroup: '5-8',
            defaultVisualStyle: '2d-cartoon',
            autoGenerateMusic: true,
            autoGenerateSfx: true,
            videoResolution: '1080p',
            videoFramerate: 30,
            autoSave: true,
            autoSaveInterval: 60000
        };
    }

    updateSetting(key, value) {
        try {
            const settings = this.getSettings();
            settings[key] = value;
            return this.saveSettings(settings);
        } catch (error) {
            console.error('Error updating setting:', error);
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       AUTO-SAVE
       ===================================================== */

    setupAutoSave(project, interval = 60000) {
        return setInterval(() => {
            this.saveProject(project);
            console.log(`Auto-saved project: ${project.name}`);
        }, interval);
    }

    clearAutoSave(autoSaveInterval) {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
        }
    }

    /* =====================================================
       BACKUP & RECOVERY
       ===================================================== */

    createBackup() {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                projects: this.getAllProjects(),
                settings: this.getSettings()
            };
            const json = JSON.stringify(backup, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            return {
                success: true,
                url: url,
                filename: `backup_${new Date().getTime()}.json`
            };
        } catch (error) {
            console.error('Error creating backup:', error);
            return { success: false, error: error.message };
        }
    }

    restoreBackup(backupJson) {
        try {
            const validation = validateJSON(backupJson);
            if (!validation.valid) {
                return { success: false, error: `Invalid JSON: ${validation.error}` };
            }

            const backup = JSON.parse(backupJson);
            
            if (backup.projects && Array.isArray(backup.projects)) {
                this.saveProjects(backup.projects);
            }
            
            if (backup.settings) {
                this.saveSettings(backup.settings);
            }

            return { success: true };
        } catch (error) {
            console.error('Error restoring backup:', error);
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       PRIVATE METHODS
       ===================================================== */

    saveProjects(projects) {
        try {
            localStorage.setItem(this.projectsKey, JSON.stringify(projects));
            return { success: true };
        } catch (error) {
            console.error('Error saving projects:', error);
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded. Consider cleaning up old projects.');
            }
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       SEARCH & FILTER
       ===================================================== */

    searchProjects(query) {
        try {
            const projects = this.getAllProjects() || [];
            const lowerQuery = query.toLowerCase();
            
            return projects.filter(p => 
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery)
            );
        } catch (error) {
            console.error('Error searching projects:', error);
            return [];
        }
    }

    filterProjectsByDate(startDate, endDate) {
        try {
            const projects = this.getAllProjects() || [];
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            
            return projects.filter(p => {
                const time = new Date(p.updatedAt).getTime();
                return time >= start && time <= end;
            });
        } catch (error) {
            console.error('Error filtering projects by date:', error);
            return [];
        }
    }

    /* =====================================================
       STATISTICS
       ===================================================== */

    getStorageStats() {
        try {
            const projects = this.getAllProjects() || [];
            const settings = this.getSettings();
            
            let totalSize = 0;
            let totalCharacters = 0;
            let totalScenes = 0;

            projects.forEach(p => {
                totalSize += JSON.stringify(p).length;
                totalCharacters += p.characters ? p.characters.length : 0;
                totalScenes += p.scenes ? p.scenes.length : 0;
            });

            return {
                projectCount: projects.length,
                totalSizeKB: Math.round(totalSize / 1024),
                totalCharacters,
                totalScenes,
                estimatedStorageUsed: `${Math.round((totalSize / 1024 / 1024) * 100) / 100} MB`
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }

    /* =====================================================
       CLEANUP
       ===================================================== */

    deleteOldProjects(daysOld = 30) {
        try {
            const projects = this.getAllProjects() || [];
            const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
            
            const filtered = projects.filter(p => 
                new Date(p.updatedAt) > cutoffDate
            );

            const deleted = projects.length - filtered.length;
            this.saveProjects(filtered);
            
            return { success: true, deleted };
        } catch (error) {
            console.error('Error deleting old projects:', error);
            return { success: false, error: error.message };
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.projectsKey);
            localStorage.removeItem(this.settingsKey);
            return { success: true };
        } catch (error) {
            console.error('Error clearing data:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const storageManager = new StorageManager();
