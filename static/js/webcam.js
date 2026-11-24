const EMOTION_PHRASES = {
    happy: 'Ви щасливий (-а). Так тримати!',
    neutral: 'Ви спокійний (-а) та врівноважений (-а).',
    sad: 'Ви виглядаєте сумним (-ою). Все обов’язково налагодиться!',
    surprised: 'Ви здивований (-а)! Щось привернуло вашу увагу?',
    angry: 'Ви сердитий (-а). Зробіть глибокий вдих і видих.',
    fearful: 'Ви відчуваєте тривогу. Ви в безпеці, все добре.',
    disgusted: 'Вам щось не до вподоби. Спробуйте перемкнути увагу.'
};

const STATUS_MESSAGES = {
    loadingModels: 'Завантаження моделі розпізнавання...',
    requestingCamera: 'Надайте доступ до камери...',
    noFace: 'Подивіться в камеру, щоб розпізнати емоцію...'
};

const MODEL_SOURCES = [
    './models',
    // 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/',
    // 'https://justadudewhohacks.github.io/face-api.js/models'
];

const videoEl = document.getElementById('video');
const permissionCardEl = document.getElementById('permissionCard');
const statusTextEl = document.getElementById('statusText');
const retryCameraBtn = document.getElementById('retryCameraBtn');
const emotionCapsuleEl = document.getElementById('emotionCapsule');
const emotionTextEl = document.getElementById('emotionText');
const backButton = document.getElementById('backButton');

const SMOOTHING_WINDOW = 6;
const DETECTION_INTERVAL_MS = 180;
const NO_FACE_TIMEOUT_MS = 1200;

let modelsReady = false;
let detectionTimer = null;
let expressionHistory = [];
let lastFaceTimestamp = 0;
let currentDisplayedText = STATUS_MESSAGES.loadingModels;
let textSwapTimeout = null;

function setEmotionCaption(nextText) {
    if (currentDisplayedText === nextText) return;
    currentDisplayedText = nextText;

    if (textSwapTimeout) {
        clearTimeout(textSwapTimeout);
    }

    emotionCapsuleEl.classList.add('is-updating');
    textSwapTimeout = setTimeout(() => {
        emotionTextEl.textContent = nextText;
        emotionCapsuleEl.classList.remove('is-updating');
    }, 150);
}

async function loadEmotionModels() {
    if (typeof faceapi === 'undefined') {
        statusTextEl.textContent = 'Не вдалося завантажити бібліотеку розпізнавання. Оновіть сторінку.';
        return false;
    }

    for (const modelUri of MODEL_SOURCES) {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(modelUri),
                faceapi.nets.faceExpressionNet.loadFromUri(modelUri)
            ]);
            modelsReady = true;
            return true;
        } catch (err) {
            console.warn(`Не вдалося завантажити ваги з ${modelUri}:`, err);
        }
    }

    statusTextEl.textContent = 'Помилка завантаження моделі розпізнавання. Перевірте наявність папки models або інтернет-з’єднання.';
    retryCameraBtn.textContent = 'Спробувати ще раз';
    retryCameraBtn.style.display = 'inline-block';
    return false;
}

function getSmoothedDominantEmotion(expressions) {
    expressionHistory.push(expressions);
    if (expressionHistory.length > SMOOTHING_WINDOW) {
        expressionHistory.shift();
    }

    const emotions = Object.keys(EMOTION_PHRASES);
    let dominantEmotion = 'neutral';
    let maxAverage = -1;

    for (const emotion of emotions) {
        let sum = 0;
        for (const frame of expressionHistory) {
            sum += frame[emotion] || 0;
        }
        const avg = sum / expressionHistory.length;
        if (avg > maxAverage) {
            maxAverage = avg;
            dominantEmotion = emotion;
        }
    }

    return dominantEmotion;
}

function startEmotionDetectionLoop() {
    if (detectionTimer) {
        clearInterval(detectionTimer);
    }

    const detectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.45
    });

    lastFaceTimestamp = performance.now();

    detectionTimer = setInterval(async () => {
        if (videoEl.paused || videoEl.ended || videoEl.readyState < 2) {
            return;
        }

        try {
            const detection = await faceapi
                .detectSingleFace(videoEl, detectorOptions)
                .withFaceExpressions();

            const now = performance.now();

            if (detection && detection.expressions) {
                lastFaceTimestamp = now;
                const emotionKey = getSmoothedDominantEmotion(detection.expressions);
                const phrase = EMOTION_PHRASES[emotionKey] || EMOTION_PHRASES.neutral;
                setEmotionCaption(phrase);
            } else if (now - lastFaceTimestamp > NO_FACE_TIMEOUT_MS) {
                expressionHistory = [];
                setEmotionCaption(STATUS_MESSAGES.noFace);
            }
        } catch (err) {
            console.error('Помилка під час аналізу кадру:', err);
        }
    }, DETECTION_INTERVAL_MS);
}

async function startCameraSession() {
    retryCameraBtn.style.display = 'none';
    permissionCardEl.classList.remove('is-hidden');

    if (!modelsReady) {
        statusTextEl.textContent = STATUS_MESSAGES.loadingModels;
        setEmotionCaption(STATUS_MESSAGES.loadingModels);
        const loaded = await loadEmotionModels();
        if (!loaded) return;
    }

    statusTextEl.textContent = STATUS_MESSAGES.requestingCamera;

    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Браузер не підтримує getUserMedia.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        videoEl.srcObject = stream;

        videoEl.onloadedmetadata = () => {
            videoEl.play();
            videoEl.classList.add('is-ready');
            permissionCardEl.classList.add('is-hidden');
            setEmotionCaption(STATUS_MESSAGES.noFace);
            startEmotionDetectionLoop();
        };
    } catch (error) {
        console.warn('Не вдалося отримати доступ до веб-камери:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            statusTextEl.textContent = 'Доступ до камери заблоковано. Дозвольте використання камери в налаштуваннях браузера.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            statusTextEl.textContent = 'Веб-камеру не знайдено на вашому пристрої.';
        } else {
            statusTextEl.textContent = 'Натисніть кнопку нижче, щоб надати доступ до камери.';
        }
        retryCameraBtn.textContent = 'Увімкнути камеру';
        retryCameraBtn.style.display = 'inline-block';
    }
}

retryCameraBtn.addEventListener('click', () => {
    startCameraSession();
});

backButton.addEventListener('click', (e) => {
    if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    startCameraSession();
});