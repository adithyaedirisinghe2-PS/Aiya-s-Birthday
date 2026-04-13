// Particle BG Effect
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particlesArray;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `hsla(${Math.random() * 60 + 190}, 100%, 70%, ${Math.random()})`; // Neon glow
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < 100; i++) particlesArray.push(new Particle());
}
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

// App Settings & Controls
const bgMusic = document.getElementById('bgMusic');
const popSound = document.getElementById('popSound');
if (bgMusic) bgMusic.volume = 0.4;
if (popSound) popSound.volume = 0.6;
let isMuted = false;

document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    if (bgMusic) bgMusic.play().catch(e => console.log('Audio Autoplay Blocked'));
});

document.getElementById('muteBtn').addEventListener('click', (e) => {
    isMuted = !isMuted;
    if (bgMusic) bgMusic.muted = isMuted;
    e.target.innerText = isMuted ? '🔇' : '🔊';
});

// Scroll Snap Navigation
const scrollContainer = document.getElementById('scrollContainer');
const dots = document.querySelectorAll('.dot');
const sections = document.querySelectorAll('.section');

scrollContainer.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop;
        if (scrollContainer.scrollTop >= (top - section.clientHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    dots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('onclick').includes(current)) {
            dot.classList.add('active');
        }
    });
});

window.scrollToSection = (id) => {
    scrollContainer.scrollTo({
        top: document.getElementById(id).offsetTop,
        behavior: 'smooth'
    });
};

// Card Logic
const card = document.getElementById('birthdayCard');
const msg1 = "Happy Birthday Aiya ❤️";
const msg2 = "You are my hero, my strength, and my best friend.";
let cardOpened = false;

card.addEventListener('click', () => {
    if (!cardOpened) {
        card.classList.add('open');
        cardOpened = true;
        setTimeout(() => typeWriter(msg1, "cardMsg1", () => {
            setTimeout(() => typeWriter(msg2, "cardMsg2", () => {}), 500);
        }), 800);
    }
});

function typeWriter(text, elementId, callback, i = 0) {
    if (i < text.length) {
        document.getElementById(elementId).innerHTML += text.charAt(i);
        setTimeout(() => typeWriter(text, elementId, callback, i + 1), 60);
    } else {
        if(callback) callback();
    }
}

// Cake Logic
const candleContainer = document.getElementById('candles');
let candlesLit = 3;

for(let i=0; i<3; i++) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    const flame = document.createElement('div');
    flame.className = 'flame';
    candle.appendChild(flame);
    
    candle.addEventListener('click', () => {
        if (!flame.classList.contains('out')) {
            flame.classList.add('out');
            candlesLit--;
            checkWish();
        }
    });
    candleContainer.appendChild(candle);
}

function checkWish() {
    if (candlesLit <= 0) {
        setTimeout(() => {
            document.getElementById('wishTitle').innerText = "Make a Wish!";
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }, 300);
    }
}

// Mic Audio listener for blowing candles
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        scriptProcessor.onaudioprocess = function() {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;
            for (let i = 0; i < array.length; i++) {
                values += (array[i]);
            }
            let average = values / array.length;

            // If average volume is suddenly high, treat as blow
            if (average > 80 && candlesLit > 0) {
                document.querySelectorAll('.flame').forEach(f => {
                    if(!f.classList.contains('out')) {
                        f.classList.add('out');
                        candlesLit--;
                    }
                });
                checkWish();
            }
        }
    }).catch(err => console.log('Mic access denied'));
} else {
    console.log('Mic access not supported on this browser/context');
}

// Balloon Game
let balloonPlaying = false;
let bScore = 0;
const balloonColors = ['#ff003c', '#00f0ff', '#bd00ff', '#ffeb3b', '#4caf50'];

document.getElementById('startBalloonBtn').addEventListener('click', () => {
    if (balloonPlaying) return;
    balloonPlaying = true;
    bScore = 0;
    document.getElementById('balloonScore').innerText = bScore;
    const block = document.getElementById('balloonArea');
    block.innerHTML = '';
    
    let count = 0;
    const timer = setInterval(() => {
        spawnBalloon(block);
        count++;
        if(count >= 20) {
            clearInterval(timer);
            setTimeout(() => balloonPlaying = false, 3000);
        }
    }, 600);
});

function spawnBalloon(area) {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.style.backgroundColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    b.style.left = (Math.random() * (area.clientWidth - 50)) + 'px';
    b.style.bottom = '-60px';
    area.appendChild(b);

    let pos = -60;
    const spd = Math.random() * 2 + 1.5;
    
    const move = setInterval(() => {
        if (b.classList.contains('popped')) { clearInterval(move); return; }
        pos += spd;
        b.style.bottom = pos + 'px';
        if(pos > area.clientHeight + 10) {
            clearInterval(move);
            if(area.contains(b)) b.remove();
        }
    }, 20);

    const pop = (e) => {
        e.preventDefault();
        if(!b.classList.contains('popped')) {
            b.classList.add('popped');
            bScore += 10;
            document.getElementById('balloonScore').innerText = bScore;
            try {
                if(!isMuted) {
                    popSound.currentTime = 0;
                    popSound.play();
                }
            } catch(e){}
            setTimeout(() => { if(area.contains(b)) b.remove(); }, 150);
        }
    };
    b.addEventListener('mousedown', pop);
    b.addEventListener('touchstart', pop);
}

// Catch Game
const catchArea = document.getElementById('catchArea');
const basket = document.getElementById('basket');
let cScore = 0;
let cTime = 30;
let catchPlaying = false;
let basketX = 0;

catchArea.addEventListener('mousemove', (e) => {
    if(!catchPlaying) return;
    const rect = catchArea.getBoundingClientRect();
    basketX = e.clientX - rect.left - 40;
    basketX = Math.max(0, Math.min(basketX, catchArea.clientWidth - 80));
    basket.style.left = basketX + 'px';
});

catchArea.addEventListener('touchmove', (e) => {
    if(!catchPlaying) return;
    e.preventDefault();
    const rect = catchArea.getBoundingClientRect();
    basketX = e.touches[0].clientX - rect.left - 40;
    basketX = Math.max(0, Math.min(basketX, catchArea.clientWidth - 80));
    basket.style.left = basketX + 'px';
});

document.getElementById('startCatchBtn').addEventListener('click', () => {
    if(catchPlaying) return;
    catchPlaying = true;
    cScore = 0;
    cTime = 30;
    document.getElementById('catchScore').innerText = cScore;
    document.querySelectorAll('.falling-item').forEach(i => i.remove());

    const gt = setInterval(() => {
        cTime--;
        document.getElementById('catchTime').innerText = cTime;
        if(cTime <= 0) {
            clearInterval(gt);
            catchPlaying = false;
        }
    }, 1000);

    const sp = setInterval(() => {
        if(!catchPlaying) { clearInterval(sp); return; }
        spawnItem();
    }, 800);
});

function spawnItem() {
    const items = ['🎁', '🍰', '🎉', '🌟'];
    const el = document.createElement('div');
    el.className = 'falling-item';
    el.innerText = items[Math.floor(Math.random() * items.length)];
    const cx = Math.random() * (catchArea.clientWidth - 30);
    el.style.left = cx + 'px';
    el.style.top = '-30px';
    catchArea.appendChild(el);

    let cy = -30;
    const spd = Math.random() * 3 + 2;
    
    const drop = setInterval(() => {
        cy += spd;
        el.style.top = cy + 'px';
        
        // collision
        if(cy > catchArea.clientHeight - 50 && cy < catchArea.clientHeight - 10) {
            if(cx > basketX - 15 && cx < basketX + 65) {
                cScore += 5;
                document.getElementById('catchScore').innerText = cScore;
                if(!isMuted) { popSound.currentTime=0; popSound.play(); }
                clearInterval(drop);
                el.remove();
            }
        }
        if(cy > catchArea.clientHeight + 10) {
            clearInterval(drop);
            el.remove();
        }
    }, 20);
}

// Slide Auto
let currSlide = 0;
setInterval(() => {
    currSlide = (currSlide + 1) % 3;
    document.getElementById('slider').style.transform = `translateX(-${currSlide * 33.333}%)`;
}, 3500);

// Final Surprise Reveal
document.getElementById('revealBtn').addEventListener('click', function() {
    this.classList.add('hidden');
    document.getElementById('finalMessage').classList.remove('hidden');
    
    const duration = 5000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00f0ff', '#bd00ff', '#ff003c'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#00f0ff', '#bd00ff', '#ff003c'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
});
