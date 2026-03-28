/**
 * FLAPPY BIRD: EVOLUTION | Elite Physics Core V1.1
 * Industrial-grade High-Fidelity Interpolated Loop (HFIL)
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const aiCoach = document.getElementById('ai-coach');
const mainMenu = document.getElementById('main-menu');

// --- GAME CONSTANTS ---
const WIDTH = 480;
const HEIGHT = 720;
canvas.width = WIDTH;
canvas.height = HEIGHT;

let score = 0;
let isStarted = false;
let isGameOver = false;
let frameCount = 0;

// --- SKIN SYSTEM CONFIG ---
let currentSkin = {
    emoji: "🐦",
    jumpForce: -8,
    gravity: 0.45,
    mass: 1.2,
    accent: "#00ff88"
};

const SKINS = {
    classic: { emoji: "🐦", jumpForce: -8.5, gravity: 0.48, accent: "#00ff88" },
    neon: { emoji: "⚡", jumpForce: -10, gravity: 0.6, accent: "#ff00ff" },
    cyber: { emoji: "🦾", jumpForce: -7, gravity: 0.4, accent: "#00d4ff" },
    floaty: { emoji: "☁️", jumpForce: -6, gravity: 0.3, accent: "#fff" }
};

// --- CORE GAME OBJECTS ---
class Bird {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = WIDTH / 4;
        this.y = HEIGHT / 2;
        this.velocity = 0;
        this.rotation = 0;
        this.size = 34;
        this.dead = false;
    }

    flap() {
        if (this.dead) return;
        this.velocity = currentSkin.jumpForce;
        // Animation
        this.rotation = -0.5;
    }

    update() {
        this.velocity += currentSkin.gravity;
        this.y += this.velocity;

        // Rotation logic
        if (this.velocity < 0) {
            this.rotation = Math.max(-0.6, this.rotation - 0.1);
        } else {
            this.rotation = Math.min(Math.PI / 2, this.rotation + 0.05);
        }

        // Boundary checks
        if (this.y < 0) { this.y = 0; this.velocity = 0; }
        if (this.y + this.size > HEIGHT) { this.die(); }
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.velocity = 5;
        this.rotation = Math.PI / 2;
        gameOver();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(currentSkin.emoji, 0, 0);
        
        // Trail effect (Particle logic)
        if (frameCount % 2 === 0 && !this.dead && isStarted) {
            particles.push(new Particle(this.x, this.y, currentSkin.accent));
        }
        
        ctx.restore();
    }
}

class Pipe {
    constructor(x) {
        this.x = x;
        this.width = 70;
        this.gap = 180 - (score * 0.5); // AI LEVEL GENERATOR LOGIC: Decreasing gaps
        this.gap = Math.max(this.gap, 130);
        
        this.topHeight = Math.random() * (HEIGHT - this.gap - 100) + 50;
        this.passed = false;
    }

    update() {
        this.x -= 3 + (score * 0.05); // Increasing Speed (Survival Mode Logic)
    }

    draw() {
        ctx.fillStyle = "#1a1a1b";
        ctx.strokeStyle = currentSkin.accent;
        ctx.lineWidth = 4;
        
        // Top Pipe
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.strokeRect(this.x, 0, this.width, this.topHeight);
        
        // Bottom Pipe
        const bottomY = this.topHeight + this.gap;
        ctx.fillRect(this.x, bottomY, this.width, HEIGHT - bottomY);
        ctx.strokeRect(this.x, bottomY, this.width, HEIGHT - bottomY);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.life = 1;
        this.vx = -2 - Math.random() * 2;
        this.vy = (Math.random() - 0.5) * 4;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

const bird = new Bird();
let pipes = [];
let particles = [];

// --- ACTION HANDLERS ---
function startGame() {
    isStarted = true;
    isGameOver = false;
    score = 0;
    bird.reset();
    pipes = [new Pipe(WIDTH + 200)];
    particles = [];
    scoreDisplay.innerText = "0";
    scoreDisplay.style.opacity = "1";
    mainMenu.style.display = "none";
    aiCoach.style.opacity = "0.4";
    aiCoach.innerText = "Synchronizing Bird Nuclei...";
}

function gameOver() {
    isGameOver = true;
    scoreDisplay.style.opacity = "0.5";
    mainMenu.style.display = "block";
    const title = document.querySelector('h1');
    const subtitle = document.querySelector('#main-menu p');
    const startBtn = document.querySelector('.btn-start');
    
    title.innerText = "EVOLUTION OVER";
    subtitle.innerText = `REACHED LEVEL ${Math.floor(score/10)} | SCORE: ${score}`;
    startBtn.innerText = "Evolve Again";

    // AI Coach Insights
    aiCoach.style.opacity = "1";
    if (score < 10) aiCoach.innerText = "AI Coach: Optimize your flap rhythm.";
    else if (score < 50) aiCoach.innerText = "AI Coach: Elite precision detected.";
    else aiCoach.innerText = "AI Coach: Neural network synchronization complete.";
}

function setSkin(skinId) {
    currentSkin = { ...SKINS[skinId] };
    document.querySelectorAll('.skin-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- MAIN LOOP ---
function update() {
    if (!isStarted || isGameOver) return;
    frameCount++;

    bird.update();

    // Pipe Management
    if (frameCount % 100 === 0) {
        pipes.push(new Pipe(WIDTH));
    }

    pipes.forEach((pipe, i) => {
        pipe.update();
        
        // Collision
        const buffer = 10;
        if (bird.x + bird.size - buffer > pipe.x && 
            bird.x + buffer < pipe.x + pipe.width) {
            if (bird.y - buffer < pipe.topHeight || 
                bird.y + buffer > pipe.topHeight + pipe.gap) {
                bird.die();
            }
        }

        // Score
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score++;
            pipe.passed = true;
            scoreDisplay.innerText = score;
        }

        if (pipe.x + pipe.width < 0) pipes.splice(i, 1);
    });

    particles.forEach((p, i) => {
        p.update();
        if (p.life <= 0) particles.splice(i, 1);
    });
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Background parallax simulation
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0, WIDTH, HEIGHT);
    
    pipes.forEach(p => p.draw());
    particles.forEach(p => p.draw());
    bird.draw();

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

// --- INPUT LISTENERS ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!isStarted || isGameOver) startGame();
        else bird.flap();
    }
});

canvas.addEventListener('mousedown', () => {
    if (!isStarted || isGameOver) startGame();
    else bird.flap();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isStarted || isGameOver) startGame();
    else bird.flap();
}, { passive: false });

// Init draw loop
draw();
