/* =====================================================
   SCRIPT ANALYZER - AI-powered script analysis using Google Gemini
   ===================================================== */

class ScriptAnalyzer {
    constructor() {
        this.apiKey = '';
        this.model = 'gemini-2.0-flash';
        this.isAnalyzing = false;
    }

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    initialize(apiKey) {
        this.apiKey = apiKey;
    }

    setModel(modelName) {
        this.model = modelName;
    }

    /* =====================================================
       SCRIPT ANALYSIS
       ===================================================== */

    async analyzeScript(scriptContent, ageGroup = '5-8') {
        if (!scriptContent || scriptContent.trim() === '') {
            return { success: false, error: 'Script is empty' };
        }

        if (!this.apiKey) {
            return { success: false, error: 'API key not configured. Please set it in Settings.' };
        }

        this.isAnalyzing = true;
        uiManager.showAnalysisModal();
        uiManager.updateAnalysisStatus('Analyzing script...');

        try {
            const analysis = await this.performAnalysis(scriptContent, ageGroup);
            
            uiManager.updateAnalysisStatus('Extracting characters...');
            const characters = await this.extractCharacters(scriptContent, analysis, ageGroup);
            
            uiManager.updateAnalysisStatus('Extracting locations...');
            const locations = await this.extractLocations(scriptContent, analysis);
            
            uiManager.updateAnalysisStatus('Breaking down scenes...');
            const scenes = await this.generateScenes(scriptContent, analysis, characters, locations);
            
            uiManager.updateAnalysisStatus('Assigning voices...');
            const voices = await this.generateVoices(characters, ageGroup);
            
            uiManager.updateAnalysisStatus('Generating music suggestions...');
            const musicSuggestions = await this.generateMusicSuggestions(analysis);
            
            uiManager.updateAnalysisStatus('Generating sound effects...');
            const sfxSuggestions = await this.generateSoundEffects(analysis);

            const result = {
                success: true,
                analysis,
                characters,
                locations,
                scenes,
                voices,
                musicSuggestions,
                sfxSuggestions
            };

            uiManager.hideAnalysisModal();
            this.isAnalyzing = false;
            
            return result;
        } catch (error) {
            console.error('Error analyzing script:', error);
            uiManager.hideAnalysisModal();
            this.isAnalyzing = false;
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       CORE ANALYSIS
       ===================================================== */

    async performAnalysis(scriptContent, ageGroup) {
        const prompt = `Analyze this children's script and provide detailed analysis in JSON format:

Script:
${scriptContent}

Target Age Group: ${ageGroup}

Please provide analysis as JSON with these fields:
{
    "title": "title of the story",
    "mainIdea": "main theme or idea",
    "genre": "genre",
    "targetAge": "target age group",
    "summary": "brief summary",
    "storyBeats": {
        "beginning": "setup",
        "middle": "conflict/development",
        "ending": "resolution"
    },
    "complexity": "simple/medium/complex",
    "emotionalMoments": ["key emotional beats"],
    "visualMoments": ["key visual scenes to animate"],
    "educationalElements": ["learning points"],
    "suggestedDuration": "duration in seconds",
    "pacing": "description of pacing",
    "tone": "overall tone description",
    "animationStyle": "suggested animation style",
    "colorPalette": ["suggested colors"],
    "soundscape": "description of sound design"
}`;

        return await this.callGeminiAPI(prompt);
    }

    /* =====================================================
       CHARACTER EXTRACTION
       ===================================================== */

    async extractCharacters(scriptContent, analysis, ageGroup) {
        const prompt = `Based on this script and analysis, extract all characters and create detailed profiles:

Script excerpt:
${scriptContent.substring(0, 2000)}

Analysis:
${JSON.stringify(analysis, null, 2)}

For each character, provide JSON with:
{
    "characters": [
        {
            "name": "character name",
            "role": "protagonist/antagonist/supporting",
            "age": "approximate age",
            "personality": ["traits"],
            "appearance": {
                "hair": "description",
                "clothing": "typical clothing",
                "colors": ["color palette"],
                "height": "relative height",
                "proportions": "body proportions"
            },
            "voice": {
                "ageCategory": "child/adult/elder",
                "tone": "tone description",
                "pitch": "high/medium/low",
                "speed": "fast/normal/slow",
                "energy": "high/medium/low",
                "accent": "any accent"
            },
            "emotionRange": ["emotions expressed"],
            "arc": "character arc description",
            "relationships": ["relationships with other characters"]
        }
    ]
}`;

        const result = await this.callGeminiAPI(prompt);
        return result.characters || [];
    }

    /* =====================================================
       LOCATION EXTRACTION
       ===================================================== */

    async extractLocations(scriptContent, analysis) {
        const prompt = `Based on this script analysis, extract all locations and create visual descriptions:

Analysis:
${JSON.stringify(analysis, null, 2)}

For each location, provide JSON with:
{
    "locations": [
        {
            "name": "location name",
            "description": "detailed description",
            "timeOfDay": "morning/afternoon/evening/night",
            "weather": "weather condition",
            "architecture": "architectural style",
            "colorPalette": ["primary colors"],
            "lighting": "lighting style",
            "mood": "emotional mood",
            "objects": ["key objects in location"],
            "continuityNotes": "notes for consistency"
        }
    ]
}`;

        const result = await this.callGeminiAPI(prompt);
        return result.locations || [];
    }

    /* =====================================================
       SCENE GENERATION
       ===================================================== */

    async generateScenes(scriptContent, analysis, characters, locations) {
        const prompt = `Break down this script into animated scenes:

Script:
${scriptContent}

Analysis:
${JSON.stringify(analysis, null, 2)}

Available Characters: ${characters.map(c => c.name).join(', ')}
Available Locations: ${locations.map(l => l.name).join(', ')}

For each scene, provide JSON with:
{
    "scenes": [
        {
            "number": 1,
            "title": "scene title",
            "location": "location name",
            "characters": ["character names"],
            "action": "what happens",
            "dialogue": [
                {
                    "speaker": "character name",
                    "text": "dialogue",
                    "emotion": "emotion"
                }
            ],
            "narration": "narrator text if any",
            "emotion": "overall emotion",
            "visualDescription": "how it should look",
            "camera": {
                "type": "wide/medium/close",
                "movement": "pan/zoom/static",
                "angles": ["angle descriptions"]
            },
            "lighting": {
                "type": "natural/artificial",
                "mood": "mood",
                "colors": ["lighting colors"]
            },
            "animation": {
                "movements": ["character movements"],
                "expressions": ["facial expressions"],
                "interactions": ["character interactions"]
            },
            "musicMood": "music mood suggestion",
            "soundEffects": ["sound effects needed"],
            "estimatedDuration": 5
        }
    ]
}`;

        const result = await this.callGeminiAPI(prompt);
        return result.scenes || [];
    }

    /* =====================================================
       VOICE ASSIGNMENT
       ===================================================== */

    async generateVoices(characters, ageGroup) {
        const prompt = `Generate voice profiles for these characters for children's animation (age ${ageGroup}):

Characters:
${JSON.stringify(characters, null, 2)}

For each character, provide JSON with:
{
    "voices": [
        {
            "characterId": "character identifier",
            "name": "voice name/actor",
            "ageCategory": "child/young-adult/adult/elder",
            "tone": "tone description",
            "pitch": "high/medium/low",
            "speed": 1.0,
            "energy": "high/medium/low",
            "emotionalStyle": "natural/exaggerated/monotone",
            "language": "en",
            "accent": "accent if any"
        }
    ]
}`;

        const result = await this.callGeminiAPI(prompt);
        return result.voices || [];
    }

    /* =====================================================
       MUSIC SUGGESTIONS
       ===================================================== */

    async generateMusicSuggestions(analysis) {
        const prompt = `Generate music suggestions for this story:

Story Analysis:
${JSON.stringify(analysis, null, 2)}

Provide JSON with:
{
    "musicSuggestions": [
        {
            "sceneType": "scene type",
            "mood": "mood",
            "genre": "musical genre",
            "tempo": "BPM range",
            "instruments": ["suggested instruments"],
            "intensity": "low/medium/high",
            "description": "music description"
        }
    ],
    "overallScore": {
        "title": "suggested title",
        "mood": "overall mood",
        "genre": "genre",
        "intensity": "overall intensity"
    }
}`;

        const result = await this.callGeminiAPI(prompt);
        return result.musicSuggestions || [];
    }

    /* =====================================================
       SOUND EFFECTS
       ===================================================== */

    async generateSoundEffects(analysis) {
        const prompt = `Generate sound effect suggestions for this children's story:

Story Analysis:
${JSON.stringify(analysis, null, 2)}

Provide JSON with:
{
    "soundEffects": [
        {
            "name": "sound effect name",
            "type": "impact/ambient/transition/magical",
            "description": "detailed description",
            "duration": "duration in seconds",
            "intensity": "low/medium/high",
            "mood": "emotional mood"
        }
    ]
}`;

        const result = await this.callGeminiAPI(prompt);
        return result.soundEffects || [];
    }

    /* =====================================================
       API COMMUNICATION
       ===================================================== */

    async callGeminiAPI(prompt) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.candidates[0]?.content?.parts[0]?.text;
            
            if (!content) {
                throw new Error('No response from API');
            }

            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /* =====================================================
       APPLY ANALYSIS TO PROJECT
       ===================================================== */

    async applyAnalysisToProject(project, analysisResult) {
        try {
            if (!analysisResult.success) {
                throw new Error(analysisResult.error);
            }

            const { analysis, characters, locations, scenes, voices, musicSuggestions, sfxSuggestions } = analysisResult;

            // Update project analysis
            project.analysis = analysis;

            // Add characters
            characters.forEach(charData => {
                const character = new Character(charData.name);
                Object.assign(character, charData);
                project.characters.push(character);
            });

            // Add locations
            locations.forEach(locData => {
                const location = new Location(locData.name);
                Object.assign(location, locData);
                project.locations.push(location);
            });

            // Add scenes
            scenes.forEach((sceneData, index) => {
                const scene = new Scene(sceneData.title, index + 1);
                Object.assign(scene, sceneData);
                project.scenes.push(scene);
            });

            // Add voices
            voices.forEach(voiceData => {
                const voice = new Voice(voiceData.name);
                Object.assign(voice, voiceData);
                project.voices.push(voice);
            });

            // Update metadata
            project.metadata.estimatedDuration = analysis.suggestedDuration || calculateScriptDuration(project.script);
            project.metadata.generationProgress = 0;

            // Store suggestions for generation
            project.musicSuggestions = musicSuggestions;
            project.sfxSuggestions = sfxSuggestions;

            stateManager.saveState();
            storageManager.saveProject(project);
            uiManager.displayProject(project);

            uiManager.showMessage('project-message', 'Script analysis completed successfully!', 'success');
            return { success: true };
        } catch (error) {
            console.error('Error applying analysis:', error);
            uiManager.showMessage('project-message', `Error applying analysis: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /* =====================================================
       STATUS
       ===================================================== */

    isAnalysisInProgress() {
        return this.isAnalyzing;
    }

    getStatus() {
        return {
            apiKey: !!this.apiKey,
            model: this.model,
            isAnalyzing: this.isAnalyzing
        };
    }
}

// Create global instance
const scriptAnalyzer = new ScriptAnalyzer();
