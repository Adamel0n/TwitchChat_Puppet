// Puppet sprites that are being used
const puppets = {
    Idle: "sprites/Idle.png",
    Talking: "sprites/Talking.png",
    SpriteSheet: "sprites/ChatSpriteSheet.png"
}

// Initialize Variables
let socket = null;
let recconectDelay = 2000;
let isConnecting = false;
let mouthInterval = null;
let mouthOpen = false;
const puppet = document.getElementById("puppet");
const puppetContainer = document.getElementById("puppet-container");
const puppetBody = document.getElementById("puppet-body");
const mouth = document.getElementById("mouth");
const speech = new SpeechSynthesisUtterance();
let voices = [];
let queue = [];

// Gets voices and selects the first one available
function populateVoiceList() {
    voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices);
    if (voices.length > 0) {
        speech.voice = voices[1]; // Select the first available voice
    }
}

// Forces the voices to load by speaking an empty utterance
function forceVoiceLoad() {
    const dummy = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(dummy);
}

window.speechSynthesis.onvoiceschanged = populateVoiceList;

// Set default speech properties
speech.lang = "en-US";
speech.rate = 1;
speech.pitch = 1;


// --- WEBSOCKET CONNECTION ---
function connect() {
    if (isConnecting) return;
    isConnecting
    console.log("Attempting to connect to WebSocket server...");

    socket = new WebSocket("ws://localhost:8765");

    socket.onopen = () => {
        console.log("Connected to WebSocket server.");
        isConnecting = false;
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
    
        switch (message.type) {
            case "talk_start":
                queue.push(message.message);
                processQueue();
                break;
            case "talk_stop":
                // stopTalking();
                break;
            default:
                console.log("Unknown message type:", message.type);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket is closed now.");
        setTimeout(connect, recconectDelay)
        isConnecting = false;
    };

    socket.onerror = (error) => {
        console.error("WebSocket error, closing and retrying...");
        socket.close();
    };
}

connect();
forceVoiceLoad();

// --- STATE ---
let isTalking = false;

// --- QUEUE ---
function processQueue() {
    if (queue.length === 0 || isTalking) return;

        console.log("Processing queue, messages left:", queue.length);
        const message = queue.shift();

        startTalking(message);
}

// --- FUNCTIONS ---
function startTalking(message) {
    
    if (!speech.voice) {
        console.log("No speech synthesis voice available, retrying...");
        forceVoiceLoad();
        populateVoiceList();

        if (!speech.voice) {
            console.warn("Still no voice available, re-queuing message.");
            queue.unshift(message);
            setTimeout(processQueue, 200);
            return;
        }
    }
    
    isTalking = true;
    puppetBody.style.bottom = "0px";

    const utter = new SpeechSynthesisUtterance(message);
    utter.voice = speech.voice;
    utter.lang = speech.lang;
    utter.rate = speech.rate;
    utter.pitch = speech.pitch;

    utter.onend = () => {
        stopTalking();
        setTimeout(processQueue, 2000);
    }

    startAnimation();
    window.speechSynthesis.speak(utter);
}

function stopTalking() {
    isTalking = false;
    stopAnimation();
    puppetBody.style.bottom = "-500px";
}

function startAnimation() {
    if (mouthInterval) return; // Prevent multiple intervals
    const puppetHeight = puppet.clientHeight;
    const puppetWidth = puppet.clientWidth;

    mouthInterval = setInterval(() => {
        mouthOpen = !mouthOpen;

        if (mouthOpen) {
            mouth.style.objectPosition = "-410px -310px";
            puppetContainer.style.transform = "scaleX(0.85) scaleY(1.15)";
        } else {
            mouth.style.objectPosition = "-410px 0px";
            puppetContainer.style.transform = "scaleX(1) scaleY(1)";
        }
    }, 120);
}

function stopAnimation() {
    clearInterval(mouthInterval);
    mouthInterval = null;
    mouthOpen = false;
    mouth.style.objectPosition = "-410px 0px";
    puppetContainer.style.transform = "scaleX(1) scaleY(1)"
}