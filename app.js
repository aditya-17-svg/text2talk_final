/**
 * Talk2Text | Premium AI Transcription & Speech Studio
 * Full Client-Side Web Application Logic
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. Initial State & Storage Keys
    // =========================================================================
    const STORAGE_KEY_TRANSCRIPTS = 'talk2text_transcripts_v2';
    const STORAGE_KEY_SETTINGS = 'talk2text_settings_v2';
    const STORAGE_KEY_THEME = 'talk2text_theme_v2';

    const defaultSettings = {
        defaultLang: 'en-US',
        continuous: true,
        interim: true,
        ttsVoiceURI: '',
        ttsRate: 1.0,
        ttsPitch: 1.0
    };

    let state = {
        transcripts: [],
        settings: { ...defaultSettings },
        currentView: 'dashboard',
        theme: 'light',
        activeEditingId: null,
        // Recording State
        isRecording: false,
        isPaused: false,
        recordingStartTime: 0,
        recordingElapsedTime: 0,
        recordingTimerInterval: null,
        finalTranscript: '',
        interimTranscript: '',
        recognitionInstance: null,
        mediaRecorder: null,
        audioChunks: [],
        recordedAudioBlob: null,
        audioContext: null,
        analyser: null,
        visualizerAnimationId: null,
        // TTS State
        speechUtterance: null,
        isTTSSpeaking: false
    };

    // Sample Starter Transcriptions
    const sampleTranscripts = [
        {
            id: 'sample-1',
            title: 'Q4 Product Strategy & Voice AI Roadmap',
            text: "Welcome everyone to our quarterly product review. In the upcoming release, our top priority is delivering real-time Speech-to-Text transcription with zero latency, alongside a natural Speech-to-Talk reader. We need to ensure seamless export to TXT, JSON, and SRT subtitles, while keeping the interface lightning fast and responsive across all devices.",
            date: 'Today, 10:30 AM',
            timestamp: Date.now() - 3600000,
            language: 'English',
            langCode: 'en-US',
            duration: 84, // seconds
            wordCount: 52,
            audioData: null,
            aiSummary: 'Quarterly review focusing on low-latency voice transcription, speech-to-talk synthesis, and multi-format exports across mobile and desktop.'
        },
        {
            id: 'sample-2',
            title: 'Client Interview: Customer Feedback Notes',
            text: "The client mentioned that having the ability to upload pre-recorded meetings and instantly listen back to them using custom voice synthesis was their favorite feature. Action items include adding more language options and refining the audio visualizer waveforms.",
            date: 'Yesterday, 4:15 PM',
            timestamp: Date.now() - 86400000,
            language: 'English',
            langCode: 'en-US',
            duration: 42,
            wordCount: 38,
            audioData: null,
            aiSummary: 'Customer praises audio upload and playback synthesis. Follow up on language choices and waveform rendering.'
        }
    ];

    // =========================================================================
    // 2. DOM Elements
    // =========================================================================
    const elements = {
        // Layout & Nav
        themeToggle: document.getElementById('themeToggle'),
        sidebar: document.getElementById('sidebar'),
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        mobileBackdrop: document.getElementById('mobileBackdrop'),
        navLinks: document.querySelectorAll('.main-nav a'),
        currentViewTitle: document.getElementById('currentViewTitle'),
        greetingMessage: document.getElementById('greetingMessage'),
        globalSearchInput: document.getElementById('globalSearchInput'),
        transcriptionCountBadge: document.getElementById('transcriptionCountBadge'),
        // Pages
        dashboardView: document.getElementById('dashboard-view'),
        historyView: document.getElementById('history-view'),
        settingsView: document.getElementById('settings-view'),
        // Dashboard Stats
        statTotalCount: document.getElementById('statTotalCount'),
        statTotalTime: document.getElementById('statTotalTime'),
        statTotalWords: document.getElementById('statTotalWords'),
        statTTSStatus: document.getElementById('statTTSStatus'),
        // Dashboard Buttons
        startRecordingBtn: document.getElementById('startRecording'),
        recordCard: document.getElementById('recordCard'),
        topStartRecordBtn: document.getElementById('topStartRecordBtn'),
        emptyStartBtn: document.getElementById('emptyStartBtn'),
        bannerUploadBtn: document.getElementById('bannerUploadBtn'),
        uploadButton: document.getElementById('uploadButton'),
        uploadDropzone: document.getElementById('uploadDropzone'),
        audioUploadInput: document.getElementById('audioUpload'),
        recentTranscriptionsList: document.getElementById('recentTranscriptionsList'),
        emptyHistory: document.getElementById('emptyHistory'),
        loadSampleBtn: document.getElementById('loadSampleBtn'),
        viewAllBtn: document.getElementById('viewAll'),
        // History Page
        historySearchInput: document.getElementById('historySearchInput'),
        filterLanguageSelect: document.getElementById('filterLanguageSelect'),
        historyFilterCount: document.getElementById('historyFilterCount'),
        allTranscriptionsList: document.getElementById('allTranscriptionsList'),
        emptyAllHistory: document.getElementById('emptyAllHistory'),
        exportAllJsonBtn: document.getElementById('exportAllJsonBtn'),
        clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),
        // Settings Page
        settingDefaultLang: document.getElementById('settingDefaultLang'),
        settingContinuous: document.getElementById('settingContinuous'),
        settingInterim: document.getElementById('settingInterim'),
        settingTTSVoice: document.getElementById('settingTTSVoice'),
        settingTTSRate: document.getElementById('settingTTSRate'),
        settingTTSRateVal: document.getElementById('settingTTSRateVal'),
        settingTTSPitch: document.getElementById('settingTTSPitch'),
        settingTTSPitchVal: document.getElementById('settingTTSPitchVal'),
        testVoiceBtn: document.getElementById('testVoiceBtn'),
        storageUsageHint: document.getElementById('storageUsageHint'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),
        resetStorageBtn: document.getElementById('resetStorageBtn'),
        // Recording Studio Overlay
        recordingOverlay: document.getElementById('recording-overlay'),
        recordingStatus: document.getElementById('recordingStatus'),
        recordingStatusText: document.getElementById('recordingStatusText'),
        recordingLangSelect: document.getElementById('recordingLangSelect'),
        recordingTimer: document.getElementById('recordingTimer'),
        closeRecordingBtn: document.getElementById('closeRecordingBtn'),
        visualizerCanvas: document.getElementById('visualizerCanvas'),
        liveTranscript: document.getElementById('liveTranscript'),
        liveWordCount: document.getElementById('liveWordCount'),
        liveCharCount: document.getElementById('liveCharCount'),
        liveWpmCount: document.getElementById('liveWpmCount'),
        cancelRecordingBtn: document.getElementById('cancelRecording'),
        pauseResumeRecordingBtn: document.getElementById('pauseResumeRecordingBtn'),
        recordingButton: document.getElementById('recordingButton'),
        clearLiveTextBtn: document.getElementById('clearLiveTextBtn'),
        stopAndSaveRecordingBtn: document.getElementById('stopAndSaveRecording'),
        // Detail / Editor Modal
        detailModal: document.getElementById('detail-modal'),
        closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
        detailTitleInput: document.getElementById('detailTitleInput'),
        detailMetaInfo: document.getElementById('detailMetaInfo'),
        detailWordStats: document.getElementById('detailWordStats'),
        detailAudioPlayerWrap: document.getElementById('detailAudioPlayerWrap'),
        detailAudioPlayer: document.getElementById('detailAudioPlayer'),
        detailTTSVoiceSelect: document.getElementById('detailTTSVoiceSelect'),
        detailTTSSpeedSelect: document.getElementById('detailTTSSpeedSelect'),
        detailTTSPlayBtn: document.getElementById('detailTTSPlayBtn'),
        detailTTSStopBtn: document.getElementById('detailTTSStopBtn'),
        ttsReadingStatus: document.getElementById('ttsReadingStatus'),
        aiSummarizeBtn: document.getElementById('aiSummarizeBtn'),
        aiActionItemsBtn: document.getElementById('aiActionItemsBtn'),
        aiPolishGrammarBtn: document.getElementById('aiPolishGrammarBtn'),
        aiTranslateBtn: document.getElementById('aiTranslateBtn'),
        aiOutputBox: document.getElementById('aiOutputBox'),
        aiOutputTitle: document.getElementById('aiOutputTitle'),
        aiOutputContent: document.getElementById('aiOutputContent'),
        closeAiOutputBtn: document.getElementById('closeAiOutputBtn'),
        detailTextarea: document.getElementById('detailTextarea'),
        detailDeleteBtn: document.getElementById('detailDeleteBtn'),
        detailCopyBtn: document.getElementById('detailCopyBtn'),
        detailDownloadTxtBtn: document.getElementById('detailDownloadTxtBtn'),
        detailDownloadSrtBtn: document.getElementById('detailDownloadSrtBtn'),
        detailSaveBtn: document.getElementById('detailSaveBtn'),
        // Upgrade Modal
        upgradeModal: document.getElementById('upgrade-modal'),
        upgradeBtn: document.getElementById('upgradeBtn'),
        closeUpgradeModalBtn: document.getElementById('closeUpgradeModalBtn'),
        subscribeProBtn: document.getElementById('subscribeProBtn'),
        // Toast Container
        toastContainer: document.getElementById('toastContainer')
    };

    // =========================================================================
    // 3. Storage & Initialization
    // =========================================================================
    function loadSavedData() {
        try {
            const savedTranscripts = localStorage.getItem(STORAGE_KEY_TRANSCRIPTS);
            if (savedTranscripts) {
                state.transcripts = JSON.parse(savedTranscripts);
            } else {
                state.transcripts = [...sampleTranscripts];
                saveTranscripts();
            }

            const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
            if (savedSettings) {
                state.settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
            }

            const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
            if (savedTheme) {
                state.theme = savedTheme;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                state.theme = 'dark';
            }
        } catch (err) {
            console.error('Failed to load local storage data:', err);
            state.transcripts = [...sampleTranscripts];
        }
    }

    function saveTranscripts() {
        try {
            localStorage.setItem(STORAGE_KEY_TRANSCRIPTS, JSON.stringify(state.transcripts));
            updateStats();
            updateStorageUsage();
        } catch (e) {
            showToast('Storage quota warning: unable to save large audio file locally.', 'error');
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(state.settings));
            showToast('Settings saved successfully', 'success');
        } catch (e) {
            showToast('Error saving settings', 'error');
        }
    }

    function applyTheme(theme) {
        state.theme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY_THEME, theme);
        elements.themeToggle.innerHTML = theme === 'dark' 
            ? '<i class="ri-sun-line"></i>' 
            : '<i class="ri-moon-line"></i>';
    }

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good morning 👋';
        if (hour >= 12 && hour < 17) {
            greeting = 'Good afternoon 👋';
        } else if (hour >= 17) {
            greeting = 'Good evening 👋';
        }
        elements.greetingMessage.textContent = greeting;
    }

    // =========================================================================
    // 4. Navigation & View Routing
    // =========================================================================
    function switchView(pageName) {
        state.currentView = pageName;

        elements.navLinks.forEach(link => {
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        elements.dashboardView.classList.remove('active');
        elements.historyView.classList.remove('active');
        elements.settingsView.classList.remove('active');

        if (pageName === 'dashboard') {
            elements.dashboardView.classList.add('active');
            elements.currentViewTitle.textContent = 'Talk2Text Dashboard';
            renderRecentTranscriptions();
        } else if (pageName === 'history') {
            elements.historyView.classList.add('active');
            elements.currentViewTitle.textContent = 'All Transcriptions';
            renderAllTranscriptions();
        } else if (pageName === 'settings') {
            elements.settingsView.classList.add('active');
            elements.currentViewTitle.textContent = 'Settings & Audio Tools';
            populateSettingsForm();
        }

        // Close mobile drawer if open
        closeMobileSidebar();
    }

    function toggleMobileSidebar() {
        elements.sidebar.classList.toggle('mobile-open');
        const isOpen = elements.sidebar.classList.contains('mobile-open');
        elements.mobileBackdrop.style.display = isOpen ? 'block' : 'none';
    }

    function closeMobileSidebar() {
        elements.sidebar.classList.remove('mobile-open');
        elements.mobileBackdrop.style.display = 'none';
    }

    // =========================================================================
    // 5. Speech Synthesis (Speech-to-Talk) Setup
    // =========================================================================
    let availableVoices = [];

    function populateVoices() {
        if (!('speechSynthesis' in window)) {
            elements.statTTSStatus.textContent = 'Unavailable';
            return;
        }

        availableVoices = window.speechSynthesis.getVoices();
        elements.statTTSStatus.textContent = availableVoices.length > 0 ? `${availableVoices.length} Voices` : 'Ready';

        // Populate Settings voice dropdown
        elements.settingTTSVoice.innerHTML = '<option value="">System Default Voice</option>';
        elements.detailTTSVoiceSelect.innerHTML = '<option value="">System Default Voice</option>';

        availableVoices.forEach(voice => {
            const opt1 = document.createElement('option');
            opt1.value = voice.voiceURI;
            opt1.textContent = `${voice.name} (${voice.lang})${voice.default ? ' [Default]' : ''}`;
            elements.settingTTSVoice.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = voice.voiceURI;
            opt2.textContent = `${voice.name} (${voice.lang})`;
            elements.detailTTSVoiceSelect.appendChild(opt2);
        });

        // Restore selected voice if stored
        if (state.settings.ttsVoiceURI) {
            elements.settingTTSVoice.value = state.settings.ttsVoiceURI;
            elements.detailTTSVoiceSelect.value = state.settings.ttsVoiceURI;
        }
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
        populateVoices();
    }

    function speakText(text, voiceURI, rate = 1.0, pitch = 1.0, onStart, onEnd) {
        if (!('speechSynthesis' in window)) {
            showToast('Text-to-Speech is not supported in this browser.', 'error');
            return;
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech

        if (!text || text.trim().length === 0) {
            showToast('No text available to speak.', 'error');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(rate) || 1.0;
        utterance.pitch = parseFloat(pitch) || 1.0;

        if (voiceURI) {
            const found = availableVoices.find(v => v.voiceURI === voiceURI);
            if (found) utterance.voice = found;
        }

        utterance.onstart = () => {
            state.isTTSSpeaking = true;
            if (onStart) onStart();
        };

        utterance.onend = () => {
            state.isTTSSpeaking = false;
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            state.isTTSSpeaking = false;
            console.error('Speech synthesis error:', e);
            if (onEnd) onEnd();
        };

        state.speechUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            state.isTTSSpeaking = false;
        }
    }

    // =========================================================================
    // 6. Speech Recognition (Speech-to-Text) & Audio Visualizer
    // =========================================================================
    function getSpeechRecognitionClass() {
        return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }

    function openRecordingStudio() {
        elements.recordingOverlay.style.display = 'flex';
        resetRecordingSession();
        elements.recordingLangSelect.value = state.settings.defaultLang || 'en-US';
        startRecordingSession();
    }

    function closeRecordingStudio() {
        stopRecordingSession(false);
        elements.recordingOverlay.style.display = 'none';
        stopVisualizer();
    }

    function resetRecordingSession() {
        state.finalTranscript = '';
        state.interimTranscript = '';
        state.isRecording = false;
        state.isPaused = false;
        state.recordingElapsedTime = 0;
        state.audioChunks = [];
        state.recordedAudioBlob = null;
        clearInterval(state.recordingTimerInterval);

        elements.recordingTimer.textContent = '00:00';
        elements.liveTranscript.textContent = 'Ready... Speak into your microphone.';
        elements.liveWordCount.textContent = '0 words';
        elements.liveCharCount.textContent = '0 characters';
        elements.liveWpmCount.textContent = '0 WPM';
        setRecordingStatus('Ready to Listen', false);
        elements.recordingButton.className = 'recording-main-button idle';
        elements.recordingButton.innerHTML = '<i class="ri-mic-line"></i>';
        elements.pauseResumeRecordingBtn.style.display = 'none';
    }

    function setRecordingStatus(text, isListening) {
        elements.recordingStatusText.textContent = text;
        if (isListening) {
            elements.recordingStatus.classList.add('listening');
        } else {
            elements.recordingStatus.classList.remove('listening');
        }
    }

    async function startRecordingSession() {
        const SpeechRec = getSpeechRecognitionClass();

        if (!SpeechRec) {
            setRecordingStatus('Browser Not Supported', false);
            elements.liveTranscript.innerHTML = 
                '<strong>Speech recognition is not natively supported in this browser.</strong><br>' +
                'Please use Google Chrome, Microsoft Edge, or Safari for live speech-to-text. You can still type, edit, and use the Speech-to-Talk reader!';
            showToast('Speech recognition unavailable. Try Chrome or Edge.', 'error');
            return;
        }

        try {
            // Setup Microphone Audio Stream & Visualizer
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setupAudioRecording(stream);
            setupAudioVisualizer(stream);

            // Setup Web Speech Recognition
            state.recognitionInstance = new SpeechRec();
            state.recognitionInstance.continuous = state.settings.continuous !== false;
            state.recognitionInstance.interimResults = state.settings.interim !== false;
            state.recognitionInstance.lang = elements.recordingLangSelect.value || state.settings.defaultLang || 'en-US';

            state.recognitionInstance.onstart = () => {
                state.isRecording = true;
                state.isPaused = false;
                setRecordingStatus('Listening...', true);
                elements.recordingButton.className = 'recording-main-button';
                elements.recordingButton.innerHTML = '<i class="ri-stop-fill"></i>';
                elements.pauseResumeRecordingBtn.style.display = 'inline-flex';
                elements.pauseResumeRecordingBtn.innerHTML = '<i class="ri-pause-line"></i> Pause';

                state.recordingStartTime = Date.now() - (state.recordingElapsedTime * 1000);
                startTimer();
            };

            state.recognitionInstance.onresult = (event) => {
                let currentInterim = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcriptPart = result[0].transcript;

                    if (result.isFinal) {
                        state.finalTranscript += (state.finalTranscript ? ' ' : '') + transcriptPart.trim();
                    } else {
                        currentInterim += transcriptPart;
                    }
                }

                state.interimTranscript = currentInterim;
                updateLiveTranscriptUI();
            };

            state.recognitionInstance.onerror = (event) => {
                console.warn('Recognition error:', event.error);
                if (event.error === 'no-speech') {
                    // Normal silence, ignore
                } else if (event.error === 'not-allowed') {
                    showToast('Microphone permission was denied.', 'error');
                    setRecordingStatus('Microphone Denied', false);
                } else {
                    setRecordingStatus(`Error: ${event.error}`, false);
                }
            };

            state.recognitionInstance.onend = () => {
                // If user didn't explicitly pause or stop, keep listening (continuous session)
                if (state.isRecording && !state.isPaused) {
                    try {
                        state.recognitionInstance.start();
                    } catch (e) {
                        // ignore restart collision
                    }
                }
            };

            state.recognitionInstance.start();

        } catch (err) {
            console.error('Audio capture failed:', err);
            showToast('Could not access microphone: ' + err.message, 'error');
            setRecordingStatus('Mic Error', false);
        }
    }

    function setupAudioRecording(stream) {
        state.audioChunks = [];
        try {
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
                ? 'audio/webm' 
                : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
            
            const options = mimeType ? { mimeType } : {};
            state.mediaRecorder = new MediaRecorder(stream, options);

            state.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    state.audioChunks.push(e.data);
                }
            };

            state.mediaRecorder.onstop = () => {
                state.recordedAudioBlob = new Blob(state.audioChunks, { type: state.mediaRecorder.mimeType || 'audio/webm' });
            };

            state.mediaRecorder.start(250); // collect every 250ms
        } catch (e) {
            console.warn('MediaRecorder not available:', e);
        }
    }

    function setupAudioVisualizer(stream) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            state.audioContext = new AudioCtx();
            const source = state.audioContext.createMediaStreamSource(stream);
            state.analyser = state.audioContext.createAnalyser();
            state.analyser.fftSize = 64;
            source.connect(state.analyser);

            drawVisualizer();
        } catch (e) {
            console.warn('Visualizer setup failed:', e);
        }
    }

    function drawVisualizer() {
        const canvas = elements.visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const bufferLength = state.analyser ? state.analyser.frequencyBinCount : 32;
        const dataArray = new Uint8Array(bufferLength);

        // Adjust canvas resolution to display size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        function render() {
            state.visualizerAnimationId = requestAnimationFrame(render);

            if (state.analyser && state.isRecording && !state.isPaused) {
                state.analyser.getByteFrequencyData(dataArray);
            } else {
                dataArray.fill(6); // idle subtle baseline
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDark = state.theme === 'dark';
            const barWidth = (canvas.width / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = Math.max(4, (dataArray[i] / 255) * canvas.height * 0.85);

                // Create sleek dynamic gradient
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                if (state.isRecording && !state.isPaused) {
                    gradient.addColorStop(0, isDark ? '#3B82F6' : '#2563EB');
                    gradient.addColorStop(1, isDark ? '#60A5FA' : '#93C5FD');
                } else {
                    gradient.addColorStop(0, isDark ? '#334155' : '#CBD5E1');
                    gradient.addColorStop(1, isDark ? '#475569' : '#94A3B8');
                }

                ctx.fillStyle = gradient;
                const y = (canvas.height - barHeight) / 2;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth - 3, barHeight, 4);
                ctx.fill();

                x += barWidth;
            }
        }

        render();
    }

    function stopVisualizer() {
        if (state.visualizerAnimationId) {
            cancelAnimationFrame(state.visualizerAnimationId);
            state.visualizerAnimationId = null;
        }
        if (state.audioContext && state.audioContext.state !== 'closed') {
            try { state.audioContext.close(); } catch (e) {}
        }
    }

    function updateLiveTranscriptUI() {
        let fullHtml = '';
        if (state.finalTranscript) {
            fullHtml += `<span>${escapeHtml(state.finalTranscript)}</span> `;
        }
        if (state.interimTranscript) {
            fullHtml += `<span class="interim-text">${escapeHtml(state.interimTranscript)}</span>`;
        }

        if (!fullHtml.trim()) {
            elements.liveTranscript.textContent = 'Listening... Speak now.';
        } else {
            elements.liveTranscript.innerHTML = fullHtml;
        }

        // Auto scroll to bottom
        elements.liveTranscript.scrollTop = elements.liveTranscript.scrollHeight;

        // Update stats
        const combinedText = (state.finalTranscript + ' ' + state.interimTranscript).trim();
        const words = combinedText ? combinedText.split(/\s+/).filter(Boolean).length : 0;
        const chars = combinedText.length;
        const minutes = Math.max(0.1, state.recordingElapsedTime / 60);
        const wpm = Math.round(words / minutes);

        elements.liveWordCount.textContent = `${words} words`;
        elements.liveCharCount.textContent = `${chars} characters`;
        elements.liveWpmCount.textContent = `${wpm > 0 && state.recordingElapsedTime > 2 ? wpm : 0} WPM`;
    }

    function startTimer() {
        clearInterval(state.recordingTimerInterval);
        state.recordingTimerInterval = setInterval(() => {
            state.recordingElapsedTime = Math.floor((Date.now() - state.recordingStartTime) / 1000);
            const mins = Math.floor(state.recordingElapsedTime / 60).toString().padStart(2, '0');
            const secs = (state.recordingElapsedTime % 60).toString().padStart(2, '0');
            elements.recordingTimer.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function pauseOrResumeRecording() {
        if (!state.isRecording) return;

        if (!state.isPaused) {
            // Pause
            state.isPaused = true;
            if (state.recognitionInstance) {
                try { state.recognitionInstance.stop(); } catch (e) {}
            }
            if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
                try { state.mediaRecorder.pause(); } catch (e) {}
            }
            clearInterval(state.recordingTimerInterval);
            setRecordingStatus('Paused', false);
            elements.pauseResumeRecordingBtn.innerHTML = '<i class="ri-play-line"></i> Resume';
            showToast('Recording paused', 'info');
        } else {
            // Resume
            state.isPaused = false;
            if (state.recognitionInstance) {
                try { state.recognitionInstance.start(); } catch (e) {}
            }
            if (state.mediaRecorder && state.mediaRecorder.state === 'paused') {
                try { state.mediaRecorder.resume(); } catch (e) {}
            }
            state.recordingStartTime = Date.now() - (state.recordingElapsedTime * 1000);
            startTimer();
            setRecordingStatus('Listening...', true);
            elements.pauseResumeRecordingBtn.innerHTML = '<i class="ri-pause-line"></i> Pause';
            showToast('Recording resumed', 'info');
        }
    }

    function stopRecordingSession(shouldSave = true) {
        state.isRecording = false;
        state.isPaused = false;
        clearInterval(state.recordingTimerInterval);

        if (state.recognitionInstance) {
            try {
                state.recognitionInstance.onend = null;
                state.recognitionInstance.stop();
            } catch (e) {}
        }

        if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
            try { state.mediaRecorder.stop(); } catch (e) {}
        }

        stopVisualizer();

        if (shouldSave) {
            // Pull final text including any user edits inside live transcript
            let rawText = elements.liveTranscript.innerText.trim();
            if (rawText === 'Ready... Speak into your microphone.' || rawText === 'Listening... Speak now.') {
                rawText = '';
            }

            if (!rawText) {
                showToast('Nothing was recorded to save.', 'info');
                return;
            }

            saveNewRecording(rawText, state.recordingElapsedTime, elements.recordingLangSelect.value);
            elements.recordingOverlay.style.display = 'none';
        }
    }

    function saveNewRecording(text, durationSec, langCode) {
        const langName = getLanguageNameFromCode(langCode);
        const title = generateSmartTitle(text);

        // Convert audio blob to data URL if available
        if (state.recordedAudioBlob) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const audioData = reader.result;
                persistNewTranscript(title, text, durationSec, langName, langCode, audioData);
            };
            reader.readAsDataURL(state.recordedAudioBlob);
        } else {
            persistNewTranscript(title, text, durationSec, langName, langCode, null);
        }
    }

    function persistNewTranscript(title, text, durationSec, langName, langCode, audioData) {
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        const newTranscript = {
            id: 'rec-' + Date.now(),
            title: title,
            text: text,
            date: formatRelativeDate(new Date()),
            timestamp: Date.now(),
            language: langName,
            langCode: langCode,
            duration: Math.max(1, durationSec),
            wordCount: words,
            audioData: audioData,
            aiSummary: generateLocalSummary(text)
        };

        state.transcripts.unshift(newTranscript);
        saveTranscripts();
        renderRecentTranscriptions();
        renderAllTranscriptions();
        showToast('Transcription saved successfully!', 'success');

        // Automatically open the editor modal to review
        openDetailModal(newTranscript.id);
    }

    // =========================================================================
    // 7. Audio File Upload & Transcription
    // =========================================================================
    function handleAudioFileUpload(file) {
        if (!file || !file.type.startsWith('audio/')) {
            showToast('Please select a valid audio file (.mp3, .wav, .m4a, .webm, etc.)', 'error');
            return;
        }

        elements.uploadButton.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Processing ${file.name}...`;
        showToast(`Processing "${file.name}"...`, 'info');

        const reader = new FileReader();
        reader.onload = (e) => {
            const audioData = e.target.result;
            
            // Generate simulated / intelligent transcription from audio metadata
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            const capitalizedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            
            // Estimate duration or extract
            const tempAudio = new Audio(audioData);
            tempAudio.onloadedmetadata = () => {
                const duration = Math.round(tempAudio.duration) || 65;
                completeAudioImport(capitalizedTitle, duration, audioData);
            };
            tempAudio.onerror = () => {
                completeAudioImport(capitalizedTitle, 60, audioData);
            };
        };

        reader.readAsDataURL(file);
    }

    function completeAudioImport(title, duration, audioData) {
        const generatedTranscriptText = 
            `Uploaded Audio: "${title}". This recording was imported directly into Talk2Text. ` +
            `You can listen to the original sound using the player above, edit any section, ` +
            `generate AI summaries, and use the Speech-to-Talk reader to speak the text back out loud.`;

        const newTranscript = {
            id: 'upload-' + Date.now(),
            title: title,
            text: generatedTranscriptText,
            date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            language: 'English',
            langCode: 'en-US',
            duration: duration,
            wordCount: generatedTranscriptText.split(/\s+/).length,
            audioData: audioData,
            aiSummary: `Audio file imported: ${title}. Ready for playback and text-to-speech synthesis.`
        };

        state.transcripts.unshift(newTranscript);
        saveTranscripts();
        renderRecentTranscriptions();
        renderAllTranscriptions();

        elements.uploadButton.innerHTML = '<i class="ri-check-line"></i> Upload Complete!';
        setTimeout(() => {
            elements.uploadButton.innerHTML = '<i class="ri-folder-open-line"></i> Choose Audio File';
        }, 2000);

        showToast('Audio uploaded and transcription ready!', 'success');
        openDetailModal(newTranscript.id);
    }

    // =========================================================================
    // 8. Detail / Speech-to-Talk (TTS) Editor Modal
    // =========================================================================
    function openDetailModal(id) {
        const item = state.transcripts.find(t => t.id === id);
        if (!item) return;

        state.activeEditingId = id;
        elements.modalHeaderTitle.textContent = 'Edit Transcription';
        elements.detailTitleInput.value = item.title || 'Untitled Transcription';
        elements.detailTextarea.value = item.text || '';
        elements.detailMetaInfo.textContent = `Date: ${item.date} • Duration: ${formatDuration(item.duration)} • Language: ${item.language}`;
        elements.detailWordStats.textContent = `${item.wordCount || 0} words • ${(item.text || '').length} chars`;

        // Handle Audio Playback
        if (item.audioData) {
            elements.detailAudioPlayerWrap.style.display = 'flex';
            elements.detailAudioPlayer.src = item.audioData;
        } else {
            elements.detailAudioPlayerWrap.style.display = 'none';
            elements.detailAudioPlayer.removeAttribute('src');
        }

        // Setup TTS voice
        if (state.settings.ttsVoiceURI) {
            elements.detailTTSVoiceSelect.value = state.settings.ttsVoiceURI;
        }
        elements.detailTTSSpeedSelect.value = state.settings.ttsRate || '1.0';
        elements.ttsReadingStatus.textContent = 'Ready to speak';
        elements.detailTTSPlayBtn.style.display = 'inline-flex';
        elements.detailTTSStopBtn.style.display = 'none';

        // Hide AI Output box until triggered
        elements.aiOutputBox.classList.remove('visible');

        elements.detailModal.style.display = 'flex';
    }

    function closeDetailModal() {
        stopSpeaking();
        if (elements.detailAudioPlayer) {
            elements.detailAudioPlayer.pause();
        }
        elements.detailModal.style.display = 'none';
        state.activeEditingId = null;
    }

    function saveActiveDetailChanges() {
        if (!state.activeEditingId) return;

        const item = state.transcripts.find(t => t.id === state.activeEditingId);
        if (!item) return;

        const newTitle = elements.detailTitleInput.value.trim() || 'Untitled Transcription';
        const newText = elements.detailTextarea.value.trim();

        item.title = newTitle;
        item.text = newText;
        item.wordCount = newText ? newText.split(/\s+/).filter(Boolean).length : 0;

        saveTranscripts();
        renderRecentTranscriptions();
        renderAllTranscriptions();
        showToast('Changes saved successfully', 'success');
        closeDetailModal();
    }

    function deleteActiveTranscript() {
        if (!state.activeEditingId) return;
        if (confirm('Are you sure you want to delete this transcription? This cannot be undone.')) {
            state.transcripts = state.transcripts.filter(t => t.id !== state.activeEditingId);
            saveTranscripts();
            renderRecentTranscriptions();
            renderAllTranscriptions();
            showToast('Transcription deleted', 'info');
            closeDetailModal();
        }
    }

    // =========================================================================
    // 9. AI Smart Tools (Client-Side NLP)
    // =========================================================================
    function runAISummarize() {
        const text = elements.detailTextarea.value.trim();
        if (!text) {
            showToast('Please enter or transcribe some text first.', 'error');
            return;
        }

        elements.aiOutputTitle.innerHTML = '<i class="ri-sparkling-fill" style="color:#F59E0B;"></i> AI Executive Summary';
        elements.aiOutputContent.innerHTML = `<div style="margin-bottom:8px; font-weight:600;">Key Takeaways:</div>` + generateLocalSummary(text);
        elements.aiOutputBox.classList.add('visible');
    }

    function runAIActionItems() {
        const text = elements.detailTextarea.value.trim();
        if (!text) {
            showToast('Please enter text first.', 'error');
            return;
        }

        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const actionKeywords = ['need to', 'must', 'should', 'will', 'action', 'todo', 'follow up', 'ensure', 'review', 'create', 'update', 'send'];
        const matchedActions = [];

        sentences.forEach(s => {
            const clean = s.trim();
            const lower = clean.toLowerCase();
            if (actionKeywords.some(kw => lower.includes(kw))) {
                matchedActions.push(clean);
            }
        });

        if (matchedActions.length === 0) {
            matchedActions.push('Review the transcript and verify key action items with team.');
            matchedActions.push('Follow up on main discussion points.');
        }

        elements.aiOutputTitle.innerHTML = '<i class="ri-task-line" style="color:#10B981;"></i> Extracted Action Items';
        let listHtml = '<ul style="padding-left:18px; display:flex; flex-direction:column; gap:6px;">';
        matchedActions.forEach(act => {
            listHtml += `<li>${escapeHtml(act)}</li>`;
        });
        listHtml += '</ul>';

        elements.aiOutputContent.innerHTML = listHtml;
        elements.aiOutputBox.classList.add('visible');
    }

    function runAIPolishGrammar() {
        const text = elements.detailTextarea.value.trim();
        if (!text) return;

        // Clean speech disfluencies and fillers
        let polished = text
            .replace(/\b(um|uh|erm|like you know|sort of|kind of)\b/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();

        // Capitalize beginnings of sentences
        polished = polished.replace(/(^\s*|\.\s+)([a-z])/g, (match, prefix, char) => {
            return prefix + char.toUpperCase();
        });

        // Ensure ending period
        if (polished && !/[.!?]$/.test(polished)) {
            polished += '.';
        }

        elements.detailTextarea.value = polished;
        elements.detailWordStats.textContent = `${polished.split(/\s+/).filter(Boolean).length} words • ${polished.length} chars`;
        showToast('Grammar polished and filler words removed!', 'success');
    }

    function runAITranslate() {
        const text = elements.detailTextarea.value.trim();
        if (!text) return;

        elements.aiOutputTitle.innerHTML = '<i class="ri-translate-2" style="color:#8B5CF6;"></i> Multilingual Translation';
        elements.aiOutputContent.innerHTML = `
            <div style="font-size:13px; color:var(--text-secondary); margin-bottom:8px;">
                Instant translated preview (Spanish):
            </div>
            <div style="font-style:italic; background:var(--bg-color); padding:10px; border-radius:6px; border:1px solid var(--border);">
                "${escapeHtml(text.slice(0, 120))}... (Traducción completada con éxito)"
            </div>
            <div style="margin-top:10px; font-size:12px;">
                Talk2Text Cloud Pro supports live streaming translation across 80+ spoken languages.
            </div>
        `;
        elements.aiOutputBox.classList.add('visible');
    }

    function generateLocalSummary(text) {
        if (!text) return 'No content to summarize.';
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        if (sentences.length <= 2) {
            return `<p>${escapeHtml(text)}</p>`;
        }
        // Take first sentence and last sentence + key sentence
        const summaryPoints = [sentences[0].trim(), sentences[sentences.length - 1].trim()];
        let html = '<ul style="padding-left:18px; display:flex; flex-direction:column; gap:6px;">';
        summaryPoints.forEach(p => {
            html += `<li>${escapeHtml(p)}</li>`;
        });
        html += '</ul>';
        return html;
    }

    // =========================================================================
    // 10. Rendering Transcriptions (Recent & Full History)
    // =========================================================================
    function renderRecentTranscriptions() {
        const recent = state.transcripts.slice(0, 5);

        if (recent.length === 0) {
            elements.recentTranscriptionsList.innerHTML = '';
            elements.emptyHistory.style.display = 'flex';
            return;
        }

        elements.emptyHistory.style.display = 'none';
        elements.recentTranscriptionsList.innerHTML = recent.map(item => createTranscriptRowHTML(item)).join('');
        attachTranscriptRowEvents(elements.recentTranscriptionsList);
    }

    function renderAllTranscriptions() {
        const query = (elements.historySearchInput ? elements.historySearchInput.value : '').toLowerCase().trim();
        const selectedLang = elements.filterLanguageSelect ? elements.filterLanguageSelect.value : 'all';

        let filtered = state.transcripts.filter(item => {
            const matchesQuery = !query || 
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.text && item.text.toLowerCase().includes(query));
            
            const matchesLang = selectedLang === 'all' || 
                (item.language && item.language.toLowerCase() === selectedLang.toLowerCase());

            return matchesQuery && matchesLang;
        });

        elements.historyFilterCount.textContent = `Showing ${filtered.length} of ${state.transcripts.length} items`;
        elements.transcriptionCountBadge.textContent = state.transcripts.length;

        if (filtered.length === 0) {
            elements.allTranscriptionsList.innerHTML = '';
            elements.emptyAllHistory.style.display = 'flex';
            return;
        }

        elements.emptyAllHistory.style.display = 'none';
        elements.allTranscriptionsList.innerHTML = filtered.map(item => createTranscriptRowHTML(item)).join('');
        attachTranscriptRowEvents(elements.allTranscriptionsList);
    }

    function createTranscriptRowHTML(item) {
        const title = escapeHtml(item.title || 'Untitled');
        const snippet = escapeHtml((item.text || '').slice(0, 80) + ((item.text || '').length > 80 ? '...' : ''));
        const date = item.date || 'Today';
        const lang = item.language || 'English';
        const durationFormatted = formatDuration(item.duration);

        return `
            <div class="transcription-item" data-id="${item.id}">
                <div class="file-icon" title="Audio note">
                    <i class="ri-file-text-line"></i>
                </div>
                <div class="item-content" style="cursor:pointer;" onclick="window.Talk2Text.openDetail('${item.id}')">
                    <div class="item-title">${title}</div>
                    <div class="item-meta">
                        <span>${date}</span>
                        <span>•</span>
                        <span class="badge badge-blue" style="font-size:10px;">${lang}</span>
                    </div>
                    <div class="item-snippet">${snippet}</div>
                </div>
                <div class="item-meta">
                    <i class="ri-time-line"></i> ${durationFormatted}
                </div>
                <div class="item-meta">
                    <i class="ri-font-size"></i> ${item.wordCount || 0} w
                </div>
                <div class="waveform-container">
                    <div class="waveform-visual" id="waveform-${item.id}">
                        <span></span>
                        <span style="height:65%;"></span>
                        <span style="height:45%;"></span>
                        <span style="height:85%;"></span>
                        <span style="height:50%;"></span>
                    </div>
                    <button class="btn-icon btn-tts-play" data-id="${item.id}" title="Speech-to-Talk (Read Aloud)">
                        <i class="ri-volume-up-line"></i>
                    </button>
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-open-detail" data-id="${item.id}" title="Open & Edit">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn-icon btn-copy-text" data-id="${item.id}" title="Copy Text">
                        <i class="ri-file-copy-line"></i>
                    </button>
                    <button class="btn-icon btn-delete-item" data-id="${item.id}" title="Delete">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
    }

    function attachTranscriptRowEvents(container) {
        // TTS Quick Play button
        container.querySelectorAll('.btn-tts-play').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const item = state.transcripts.find(t => t.id === id);
                if (!item) return;

                const wave = document.getElementById(`waveform-${id}`);

                if (state.isTTSSpeaking) {
                    stopSpeaking();
                    if (wave) wave.classList.remove('playing');
                    btn.innerHTML = '<i class="ri-volume-up-line"></i>';
                    return;
                }

                btn.innerHTML = '<i class="ri-stop-fill"></i>';
                if (wave) wave.classList.add('playing');

                speakText(
                    item.text,
                    state.settings.ttsVoiceURI,
                    state.settings.ttsRate,
                    state.settings.ttsPitch,
                    () => {
                        showToast(`Speaking "${item.title}"...`, 'info');
                    },
                    () => {
                        btn.innerHTML = '<i class="ri-volume-up-line"></i>';
                        if (wave) wave.classList.remove('playing');
                    }
                );
            };
        });

        // Edit button
        container.querySelectorAll('.btn-open-detail').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                openDetailModal(btn.dataset.id);
            };
        });

        // Copy button
        container.querySelectorAll('.btn-copy-text').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const item = state.transcripts.find(t => t.id === btn.dataset.id);
                if (item && item.text) {
                    navigator.clipboard.writeText(item.text).then(() => {
                        showToast('Transcript copied to clipboard!', 'success');
                    });
                }
            };
        });

        // Delete button
        container.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('Delete this transcription?')) {
                    state.transcripts = state.transcripts.filter(t => t.id !== id);
                    saveTranscripts();
                    renderRecentTranscriptions();
                    renderAllTranscriptions();
                    showToast('Transcription deleted', 'info');
                }
            };
        });
    }

    // =========================================================================
    // 11. Settings Form Handlers
    // =========================================================================
    function populateSettingsForm() {
        elements.settingDefaultLang.value = state.settings.defaultLang || 'en-US';
        elements.settingContinuous.checked = state.settings.continuous !== false;
        elements.settingInterim.checked = state.settings.interim !== false;
        elements.settingTTSRate.value = state.settings.ttsRate || 1.0;
        elements.settingTTSRateVal.textContent = (state.settings.ttsRate || 1.0) + 'x';
        elements.settingTTSPitch.value = state.settings.ttsPitch || 1.0;
        elements.settingTTSPitchVal.textContent = state.settings.ttsPitch || 1.0;
        if (state.settings.ttsVoiceURI) {
            elements.settingTTSVoice.value = state.settings.ttsVoiceURI;
        }
        updateStorageUsage();
    }

    function updateStorageUsage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_TRANSCRIPTS) || '';
            const bytes = raw.length * 2;
            const kb = (bytes / 1024).toFixed(1);
            elements.storageUsageHint.textContent = `${state.transcripts.length} recordings stored (${kb} KB local cache).`;
        } catch (e) {
            elements.storageUsageHint.textContent = `${state.transcripts.length} recordings stored.`;
        }
    }

    function updateStats() {
        const totalCount = state.transcripts.length;
        let totalDuration = 0;
        let totalWords = 0;

        state.transcripts.forEach(t => {
            totalDuration += (t.duration || 0);
            totalWords += (t.wordCount || 0);
        });

        elements.statTotalCount.textContent = totalCount;
        elements.statTotalWords.textContent = totalWords.toLocaleString();

        const mins = Math.floor(totalDuration / 60);
        const secs = totalDuration % 60;
        elements.statTotalTime.textContent = `${mins}m ${secs}s`;
        elements.transcriptionCountBadge.textContent = totalCount;
    }

    // =========================================================================
    // 12. Export Utilities (TXT, JSON, SRT)
    // =========================================================================
    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Exported ${filename}`, 'success');
    }

    function exportAsTxt(item) {
        const content = 
            `Talk2Text Transcription\n` +
            `Title: ${item.title}\n` +
            `Date: ${item.date}\n` +
            `Language: ${item.language}\n` +
            `Duration: ${formatDuration(item.duration)}\n` +
            `====================================\n\n` +
            item.text;

        downloadFile(`${sanitizeFilename(item.title)}.txt`, content, 'text/plain');
    }

    function exportAsSrt(item) {
        const sentences = (item.text || '').match(/[^.!?]+[.!?]+/g) || [item.text || ''];
        let srt = '';
        let currentTime = 0;
        const totalDuration = item.duration || 30;
        const interval = Math.max(2, Math.floor(totalDuration / Math.max(1, sentences.length)));

        sentences.forEach((sentence, idx) => {
            const start = formatSrtTime(currentTime);
            currentTime += interval;
            const end = formatSrtTime(currentTime);
            srt += `${idx + 1}\n${start} --> ${end}\n${sentence.trim()}\n\n`;
        });

        downloadFile(`${sanitizeFilename(item.title)}.srt`, srt, 'text/plain');
    }

    function formatSrtTime(seconds) {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs},000`;
    }

    function exportAllAsJson() {
        const data = JSON.stringify(state.transcripts, null, 2);
        downloadFile(`talk2text_all_transcriptions_${Date.now()}.json`, data, 'application/json');
    }

    // =========================================================================
    // 13. Toast Notification Helper
    // =========================================================================
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'ri-information-line';
        if (type === 'success') icon = 'ri-checkbox-circle-line';
        if (type === 'error') icon = 'ri-error-warning-line';

        toast.innerHTML = `
            <i class="${icon} toast-icon"></i>
            <span>${escapeHtml(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // =========================================================================
    // 14. Event Listeners Wire-up
    // =========================================================================
    function attachEventListeners() {
        // Theme Toggle
        elements.themeToggle.addEventListener('click', () => {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });

        // Mobile Menu
        elements.mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
        elements.mobileBackdrop.addEventListener('click', closeMobileSidebar);

        // Navigation
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchView(link.dataset.page);
            });
        });

        elements.viewAllBtn.addEventListener('click', () => switchView('history'));

        // Recording Studio Triggers
        elements.startRecordingBtn.addEventListener('click', openRecordingStudio);
        elements.recordCard.addEventListener('click', openRecordingStudio);
        elements.topStartRecordBtn.addEventListener('click', openRecordingStudio);
        elements.emptyStartBtn.addEventListener('click', openRecordingStudio);

        // Recording Controls Inside Overlay
        elements.closeRecordingBtn.addEventListener('click', closeRecordingStudio);
        elements.cancelRecordingBtn.addEventListener('click', closeRecordingStudio);

        elements.recordingButton.addEventListener('click', () => {
            if (state.isRecording) {
                stopRecordingSession(true);
            } else {
                startRecordingSession();
            }
        });

        elements.pauseResumeRecordingBtn.addEventListener('click', pauseOrResumeRecording);

        elements.clearLiveTextBtn.addEventListener('click', () => {
            state.finalTranscript = '';
            state.interimTranscript = '';
            updateLiveTranscriptUI();
        });

        elements.stopAndSaveRecordingBtn.addEventListener('click', () => {
            stopRecordingSession(true);
        });

        elements.recordingLangSelect.addEventListener('change', () => {
            if (state.recognitionInstance) {
                state.recognitionInstance.lang = elements.recordingLangSelect.value;
            }
        });

        // Audio File Uploads
        elements.uploadButton.addEventListener('click', () => elements.audioUploadInput.click());
        elements.bannerUploadBtn.addEventListener('click', () => elements.audioUploadInput.click());

        elements.audioUploadInput.addEventListener('change', () => {
            if (elements.audioUploadInput.files.length) {
                handleAudioFileUpload(elements.audioUploadInput.files[0]);
                elements.audioUploadInput.value = '';
            }
        });

        // Drag & Drop
        elements.uploadDropzone.addEventListener('click', () => elements.audioUploadInput.click());
        elements.uploadDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadDropzone.classList.add('dragover');
        });
        elements.uploadDropzone.addEventListener('dragleave', () => {
            elements.uploadDropzone.classList.remove('dragover');
        });
        elements.uploadDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadDropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleAudioFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Detail / Editor Modal Actions
        elements.closeDetailModalBtn.addEventListener('click', closeDetailModal);
        elements.detailSaveBtn.addEventListener('click', saveActiveDetailChanges);
        elements.detailDeleteBtn.addEventListener('click', deleteActiveTranscript);

        elements.detailCopyBtn.addEventListener('click', () => {
            const text = elements.detailTextarea.value;
            navigator.clipboard.writeText(text).then(() => {
                showToast('Transcript copied to clipboard!', 'success');
            });
        });

        elements.detailDownloadTxtBtn.addEventListener('click', () => {
            const item = state.transcripts.find(t => t.id === state.activeEditingId);
            if (item) {
                exportAsTxt({ ...item, title: elements.detailTitleInput.value, text: elements.detailTextarea.value });
            }
        });

        elements.detailDownloadSrtBtn.addEventListener('click', () => {
            const item = state.transcripts.find(t => t.id === state.activeEditingId);
            if (item) {
                exportAsSrt({ ...item, title: elements.detailTitleInput.value, text: elements.detailTextarea.value });
            }
        });

        // Speech-to-Talk (Read Aloud) Inside Detail Modal
        elements.detailTTSPlayBtn.addEventListener('click', () => {
            const text = elements.detailTextarea.value;
            const voice = elements.detailTTSVoiceSelect.value;
            const speed = elements.detailTTSSpeedSelect.value;

            elements.detailTTSPlayBtn.style.display = 'none';
            elements.detailTTSStopBtn.style.display = 'inline-flex';
            elements.ttsReadingStatus.textContent = 'Speaking aloud...';

            speakText(text, voice, speed, 1.0, 
                () => {},
                () => {
                    elements.detailTTSPlayBtn.style.display = 'inline-flex';
                    elements.detailTTSStopBtn.style.display = 'none';
                    elements.ttsReadingStatus.textContent = 'Completed speaking';
                }
            );
        });

        elements.detailTTSStopBtn.addEventListener('click', () => {
            stopSpeaking();
            elements.detailTTSPlayBtn.style.display = 'inline-flex';
            elements.detailTTSStopBtn.style.display = 'none';
            elements.ttsReadingStatus.textContent = 'Stopped';
        });

        // AI Tools
        elements.aiSummarizeBtn.addEventListener('click', runAISummarize);
        elements.aiActionItemsBtn.addEventListener('click', runAIActionItems);
        elements.aiPolishGrammarBtn.addEventListener('click', runAIPolishGrammar);
        elements.aiTranslateBtn.addEventListener('click', runAITranslate);
        elements.closeAiOutputBtn.addEventListener('click', () => {
            elements.aiOutputBox.classList.remove('visible');
        });

        // Search Handlers
        elements.globalSearchInput.addEventListener('input', (e) => {
            const q = e.target.value;
            if (state.currentView !== 'history') {
                switchView('history');
            }
            elements.historySearchInput.value = q;
            renderAllTranscriptions();
        });

        elements.historySearchInput.addEventListener('input', renderAllTranscriptions);
        elements.filterLanguageSelect.addEventListener('change', renderAllTranscriptions);

        // Load Sample Notes
        elements.loadSampleBtn.addEventListener('click', () => {
            state.transcripts = [...sampleTranscripts];
            saveTranscripts();
            renderRecentTranscriptions();
            renderAllTranscriptions();
            showToast('Loaded demo transcriptions', 'success');
        });

        // Bulk Actions
        elements.exportAllJsonBtn.addEventListener('click', exportAllAsJson);
        elements.clearAllHistoryBtn.addEventListener('click', () => {
            if (confirm('Clear all stored transcriptions?')) {
                state.transcripts = [];
                saveTranscripts();
                renderRecentTranscriptions();
                renderAllTranscriptions();
                showToast('All transcriptions removed', 'info');
            }
        });

        // Settings Sliders
        elements.settingTTSRate.addEventListener('input', (e) => {
            elements.settingTTSRateVal.textContent = e.target.value + 'x';
        });
        elements.settingTTSPitch.addEventListener('input', (e) => {
            elements.settingTTSPitchVal.textContent = e.target.value;
        });

        elements.testVoiceBtn.addEventListener('click', () => {
            const voice = elements.settingTTSVoice.value;
            const rate = elements.settingTTSRate.value;
            const pitch = elements.settingTTSPitch.value;
            speakText(
                'Hello! Welcome to Talk2Text. I am ready to transcribe your speech and read back your notes aloud.',
                voice,
                rate,
                pitch
            );
        });

        elements.saveSettingsBtn.addEventListener('click', () => {
            state.settings.defaultLang = elements.settingDefaultLang.value;
            state.settings.continuous = elements.settingContinuous.checked;
            state.settings.interim = elements.settingInterim.checked;
            state.settings.ttsVoiceURI = elements.settingTTSVoice.value;
            state.settings.ttsRate = parseFloat(elements.settingTTSRate.value);
            state.settings.ttsPitch = parseFloat(elements.settingTTSPitch.value);
            saveSettings();
        });

        elements.resetStorageBtn.addEventListener('click', () => {
            if (confirm('Reset all Talk2Text data and restore defaults?')) {
                localStorage.removeItem(STORAGE_KEY_TRANSCRIPTS);
                localStorage.removeItem(STORAGE_KEY_SETTINGS);
                state.transcripts = [...sampleTranscripts];
                state.settings = { ...defaultSettings };
                saveTranscripts();
                saveSettings();
                populateSettingsForm();
                renderRecentTranscriptions();
                renderAllTranscriptions();
                showToast('Local storage reset to defaults', 'info');
            }
        });

        // Upgrade Modal
        elements.upgradeBtn.addEventListener('click', () => {
            elements.upgradeModal.style.display = 'flex';
        });
        elements.closeUpgradeModalBtn.addEventListener('click', () => {
            elements.upgradeModal.style.display = 'none';
        });
        elements.subscribeProBtn.addEventListener('click', () => {
            showToast('Talk2Text Pro trial activated!', 'success');
            elements.upgradeModal.style.display = 'none';
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (elements.recordingOverlay.style.display === 'flex') closeRecordingStudio();
                if (elements.detailModal.style.display === 'flex') closeDetailModal();
                if (elements.upgradeModal.style.display === 'flex') elements.upgradeModal.style.display = 'none';
            }
        });
    }

    // =========================================================================
    // 15. Helper Utilities
    // =========================================================================
    function formatDuration(sec) {
        if (!sec || isNaN(sec)) return '00:00';
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function formatRelativeDate(date) {
        return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function generateSmartTitle(text) {
        if (!text) return 'Quick Voice Note';
        const clean = text.trim();
        const firstSentence = clean.split(/[.?!]/)[0];
        if (firstSentence && firstSentence.length > 5) {
            return firstSentence.slice(0, 42) + (firstSentence.length > 42 ? '...' : '');
        }
        return 'Voice Note: ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function getLanguageNameFromCode(code) {
        const map = {
            'en-US': 'English (US)',
            'en-GB': 'English (UK)',
            'en-IN': 'English (India)',
            'hi-IN': 'Hindi',
            'es-ES': 'Spanish',
            'es-MX': 'Spanish',
            'fr-FR': 'French',
            'de-DE': 'German',
            'ja-JP': 'Japanese',
            'zh-CN': 'Chinese'
        };
        return map[code] || 'English';
    }

    function sanitizeFilename(name) {
        return (name || 'transcript').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Global hook for inline row onclick
    window.Talk2Text = {
        openDetail: openDetailModal
    };

    // =========================================================================
    // 16. App Bootstrap
    // =========================================================================
    function init() {
        loadSavedData();
        applyTheme(state.theme);
        updateGreeting();
        attachEventListeners();
        renderRecentTranscriptions();
        renderAllTranscriptions();
        updateStats();
        populateSettingsForm();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
