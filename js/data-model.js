/* =====================================================
   DATA MODEL - Core data structures for the application
   ===================================================== */

class Project {
    constructor(name = 'Untitled Project') {
        this.id = generateID('proj');
        this.name = name;
        this.description = '';
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.ageGroup = 'auto';
        this.visualStyle = 'auto';
        this.script = '';
        this.analysis = null;
        this.characters = [];
        this.locations = [];
        this.voices = [];
        this.scenes = [];
        this.assets = [];
        this.generationTasks = [];
        this.timeline = null;
        this.metadata = {
            estimatedDuration: 0,
            actualDuration: 0,
            completedTasks: 0,
            failedTasks: 0,
            generationProgress: 0
        };
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            ageGroup: this.ageGroup,
            visualStyle: this.visualStyle,
            script: this.script,
            analysis: this.analysis,
            characters: this.characters,
            locations: this.locations,
            voices: this.voices,
            scenes: this.scenes,
            assets: this.assets,
            generationTasks: this.generationTasks,
            timeline: this.timeline,
            metadata: this.metadata
        };
    }

    static fromJSON(data) {
        const project = new Project(data.name);
        Object.assign(project, data);
        return project;
    }
}

class ScriptAnalysis {
    constructor() {
        this.title = '';
        this.mainIdea = '';
        this.genre = '';
        this.targetAge = '';
        this.characters = [];
        this.locations = [];
        this.objects = [];
        this.actions = [];
        this.dialogue = [];
        this.narration = [];
        this.emotionalMoments = [];
        this.storyBeats = {
            beginning: '',
            middle: '',
            ending: ''
        };
        this.visualMoments = [];
        this.educationalElements = [];
        this.music = [];
        this.soundEffects = [];
        this.suggestedDuration = 0;
        this.complexity = 'medium';
        this.inferred = {};
    }
}

class Character {
    constructor(name = '') {
        this.id = generateID('char');
        this.name = name;
        this.age = '';
        this.role = '';
        this.personality = [];
        this.appearance = {
            hair: '',
            clothing: '',
            colors: [],
            height: '',
            proportions: ''
        };
        this.voice = {
            id: '',
            name: '',
            ageCategory: '',
            tone: '',
            pitch: '',
            speed: '',
            energy: ''
        };
        this.emotionRange = [];
        this.relationships = [];
        this.arc = '';
        this.visualReference = null;
        this.locked = false;
        this.createdAt = new Date().toISOString();
    }
}

class Voice {
    constructor(name = '') {
        this.id = generateID('voice');
        this.name = name;
        this.characterId = '';
        this.ageCategory = 'child';
        this.tone = 'neutral';
        this.pitch = 'medium';
        this.speed = 1.0;
        this.energy = 'medium';
        this.emotionalStyle = 'natural';
        this.language = 'en';
        this.accent = '';
        this.provider = 'google';
        this.modelId = '';
        this.createdAt = new Date().toISOString();
    }
}

class Location {
    constructor(name = '') {
        this.id = generateID('loc');
        this.name = name;
        this.description = '';
        this.colorPalette = [];
        this.architecture = '';
        this.timeOfDay = 'day';
        this.weather = 'clear';
        this.objects = [];
        this.lighting = 'natural';
        this.mood = '';
        this.visualReference = null;
        this.continuityNotes = '';
        this.createdAt = new Date().toISOString();
    }
}

class Scene {
    constructor(title = '', sceneNumber = 0) {
        this.id = generateID('scene');
        this.number = sceneNumber;
        this.title = title;
        this.characters = [];
        this.location = '';
        this.action = '';
        this.dialogue = [];
        this.narration = '';
        this.emotion = '';
        this.visualDescription = '';
        this.camera = {
            type: 'medium',
            movement: 'static',
            angles: []
        };
        this.lighting = {
            type: 'natural',
            mood: '',
            colors: []
        };
        this.animation = {
            movements: [],
            expressions: [],
            interactions: []
        };
        this.videoPrompt = '';
        this.audioPrompt = '';
        this.music = {
            mood: '',
            intensity: 'medium',
            description: ''
        };
        this.sfx = [];
        this.subtitles = [];
        this.continuityNotes = '';
        this.estimatedDuration = 0;
        this.actualDuration = 0;
        this.generationStatus = 'pending';
        this.videoAssets = [];
        this.audioAssets = [];
        this.createdAt = new Date().toISOString();
    }
}

class DialogueLine {
    constructor(speaker = '', text = '') {
        this.id = generateID('dial');
        this.speaker = speaker;
        this.characterId = '';
        this.text = text;
        this.emotion = 'neutral';
        this.duration = 0;
        this.startPosition = 0;
        this.endPosition = 0;
        this.animationAction = '';
        this.voiceId = '';
    }
}

class Subtitle {
    constructor(text = '', startTime = 0, endTime = 0) {
        this.id = generateID('sub');
        this.text = text;
        this.startTime = startTime;
        this.endTime = endTime;
        this.speaker = '';
        this.type = 'dialogue';
    }
}

class Asset {
    constructor(type = '', sceneId = '') {
        this.id = generateID('asset');
        this.type = type;
        this.sceneId = sceneId;
        this.filename = '';
        this.url = '';
        this.size = 0;
        this.mimeType = '';
        this.metadata = {};
        this.createdAt = new Date().toISOString();
        this.generationStatus = 'pending';
        this.error = null;
    }
}

class GenerationTask {
    constructor(sceneId = '', taskType = '') {
        this.id = generateID('task');
        this.sceneId = sceneId;
        this.type = taskType;
        this.status = 'waiting';
        this.progress = 0;
        this.startTime = null;
        this.endTime = null;
        this.error = null;
        this.retries = 0;
        this.maxRetries = 3;
    }
}

class AudioTrack {
    constructor(name = '', type = '') {
        this.id = generateID('audio');
        this.name = name;
        this.type = type;
        this.url = '';
        this.duration = 0;
        this.volume = 1.0;
        this.startTime = 0;
        this.endTime = 0;
        this.provider = 'google';
    }
}

class Timeline {
    constructor() {
        this.id = generateID('timeline');
        this.tracks = {
            video: [],
            dialogue: [],
            narration: [],
            music: [],
            sfx: [],
            subtitles: []
        };
        this.duration = 0;
        this.frameRate = 30;
        this.resolution = '1080p';
    }
}

class Thumbnail {
    constructor() {
        this.id = generateID('thumb');
        this.mainCharacter = '';
        this.mainAction = '';
        this.background = '';
        this.emotion = '';
        this.colors = [];
        this.text = '';
        this.imageUrl = null;
        this.createdAt = new Date().toISOString();
    }
}

class YouTubePackage {
    constructor() {
        this.id = generateID('yt');
        this.titleSuggestions = [];
        this.description = '';
        this.tags = [];
        this.thumbnail = null;
        this.episodeSummary = '';
        this.contentRating = '';
        this.categories = [];
        this.createdAt = new Date().toISOString();
    }
}

/* =====================================================
   UTILITY FUNCTIONS
   ===================================================== */

function generateID(prefix = 'obj') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function calculateScriptDuration(script, wordsPerMinute = 140) {
    if (!script) return 0;
    const words = script.trim().split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60);
}

function extractCharacterNames(script) {
    const namePattern = /^[A-Z][A-Za-z\s]+(?=:|:)/gm;
    const matches = script.match(namePattern) || [];
    return [...new Set(matches.map(n => n.trim()))];
}

function validateProject(project) {
    const errors = [];
    if (!project.name || project.name.trim() === '') {
        errors.push('Project name is required');
    }
    if (!project.script || project.script.trim() === '') {
        errors.push('Script cannot be empty');
    }
    return errors;
}

function validateJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return { valid: true, error: null };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

function mergeObjects(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = mergeObjects(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    return result;
}

function calculateTimelineFromScenes(scenes) {
    let totalDuration = 0;
    scenes.forEach(scene => {
        totalDuration += scene.actualDuration || scene.estimatedDuration || 0;
    });
    return totalDuration;
}
