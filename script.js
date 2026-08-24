'use strict';

// ── Config ─────────────────────────────────────────────────────────────────
// Relative path works when the frontend is served by Express (http://localhost:5000)
const API_URL = '/contact';

// ── Scroll-reveal animations (Intersection Observer) ───────────────────────
(function initScrollReveal() {
    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    obs.unobserve(entry.target);
                }
            });
        },
        { root: null, rootMargin: '0px', threshold: 0.12 }
    );
    document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));
})();

// ── Navbar: add "scrolled" class for frosted-glass effect ──────────────────
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const toggle = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle(); // run once on load
})();

// ── Contact Form ────────────────────────────────────────────────────────────
(function initContactForm() {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnLabel  = document.getElementById('btn-label');
    const status    = document.getElementById('form-status');

    if (!form) return;

    // ── Client-side validation (mirrors server-side rules) ─────────────────
    function validate() {
        const fields = [
            { id: 'name',    errId: 'error-name',    min: 2,  max: 100, label: 'Name'    },
            { id: 'email',   errId: 'error-email',   email: true,       label: 'Email'   },
            { id: 'message', errId: 'error-message', min: 10, max: 2000, label: 'Message' },
        ];

        let valid = true;

        fields.forEach(({ id, errId, min, max, email }) => {
            const input = document.getElementById(id);
            const err   = document.getElementById(errId);
            const val   = input.value.trim();
            let msg = '';

            input.classList.remove('error');

            if (email) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!val || !re.test(val)) msg = 'Please enter a valid email address.';
            } else {
                if (val.length < min) msg = `Must be at least ${min} characters.`;
                else if (val.length > max) msg = `Must not exceed ${max} characters.`;
            }

            if (msg) {
                err.textContent = msg;
                input.classList.add('error');
                valid = false;
            } else {
                err.textContent = '';
            }
        });

        return valid;
    }

    // ── Set UI state ───────────────────────────────────────────────────────
    function setLoading(loading) {
        submitBtn.disabled = loading;
        btnLabel.textContent = loading ? 'Sending…' : 'Send Message';
    }

    function showStatus(type, message) {
        status.className = `form-status ${type}`;
        status.textContent = message;
    }

    function hideStatus() {
        status.className = 'form-status';
        status.textContent = '';
    }

    // ── Form submit ────────────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideStatus();

        if (!validate()) return;

        setLoading(true);

        const payload = {
            name:    document.getElementById('name').value.trim(),
            email:   document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim(),
        };

        try {
            const res  = await fetch(API_URL, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showStatus('success', data.message);
                form.reset();
                // Clear any lingering error states
                document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
                document.querySelectorAll('.form-group input, .form-group textarea')
                    .forEach(el => el.classList.remove('error'));
            } else {
                const errText = data.errors ? data.errors.join(' ') : 'Something went wrong. Please try again.';
                showStatus('error', errText);
            }
        } catch {
            showStatus('error', 'Could not reach the server. Make sure the backend is running on port 5000.');
        } finally {
            setLoading(false);
        }
    });
})();

// ── Interactive Coffee Bean Ballpit ─────────────────────────────────────────
(function initBallpit() {
    const canvas = document.getElementById('ballpit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('hero');

    const config = {
        count: 80,
        gravity: 0.08,
        friction: 0.995,
        wallBounce: 0.9,
        interactionRadius: 85,
        repulsionForce: 1.2
    };

    const colors = [
        '#12161A', // Deep Navy
        '#1E262E', // Navy Light
        '#0E1115'  // Navy Dark Card
    ];

    let beans = [];
    let width = 0;
    let height = 0;

    const mouse = {
        x: null,
        y: null,
        targetX: null,
        targetY: null
    };

    class CoffeeBean {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 14 + Math.random() * 8; // Random size
            this.mass = this.radius * this.radius; // Mass proportional to area
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = (Math.random() - 0.5) * 3;
            this.rotation = Math.random() * Math.PI * 2;
            this.angularVelocity = (Math.random() - 0.5) * 0.04;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            // Apply gravity
            this.vy += config.gravity;

            // Apply friction (air resistance)
            this.vx *= config.friction;
            this.vy *= config.friction;

            // Update positions
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.angularVelocity;

            // Boundary collisions (sides)
            if (this.x - this.radius * 1.3 < 0) {
                this.x = this.radius * 1.3;
                this.vx = -this.vx * config.wallBounce;
                this.angularVelocity *= 0.8;
            } else if (this.x + this.radius * 1.3 > width) {
                this.x = width - this.radius * 1.3;
                this.vx = -this.vx * config.wallBounce;
                this.angularVelocity *= 0.8;
            }

            // Boundary collisions (top & bottom)
            if (this.y - this.radius * 0.9 < 0) {
                this.y = this.radius * 0.9;
                this.vy = -this.vy * config.wallBounce;
                this.angularVelocity *= 0.8;
            } else if (this.y + this.radius * 0.9 > height) {
                this.y = height - this.radius * 0.9;
                this.vy = -this.vy * config.wallBounce;
                this.vx *= 0.94; // Extra friction on the floor
                this.angularVelocity *= 0.8;
            }

            // Mouse interaction (repulsion)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                const minDist = this.radius + config.interactionRadius;

                if (dist < minDist) {
                    const force = (minDist - dist) / minDist;
                    const angle = Math.atan2(dy, dx);
                    // Push away from cursor
                    this.vx += Math.cos(angle) * force * config.repulsionForce;
                    this.vy += Math.sin(angle) * force * config.repulsionForce;
                    this.angularVelocity += (Math.random() - 0.5) * 0.08 * force;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // Shadow styling
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 3;

            // Draw bean body (slightly elongated ellipse)
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.25, this.radius * 0.85, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Reset shadow to draw details cleanly
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Subtle highlights to give 3D depth
            ctx.beginPath();
            ctx.ellipse(0, -this.radius * 0.25, this.radius * 0.9, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fill();

            // Center crease line (typical of coffee beans)
            ctx.beginPath();
            ctx.moveTo(-this.radius * 1.15, 0);
            ctx.bezierCurveTo(
                -this.radius * 0.3, this.radius * 0.22,
                this.radius * 0.3, -this.radius * 0.22,
                this.radius * 1.15, 0
            );
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
            ctx.lineWidth = this.radius * 0.12;
            ctx.stroke();

            ctx.restore();
        }
    }

    function resolveCollisions() {
        for (let i = 0; i < beans.length; i++) {
            for (let j = i + 1; j < beans.length; j++) {
                const b1 = beans[i];
                const b2 = beans[j];

                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const dist = Math.hypot(dx, dy);
                const minDist = b1.radius + b2.radius;

                if (dist < minDist) {
                    // Separate the overlapping balls immediately to prevent sticking
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    b1.x -= nx * overlap * 0.5;
                    b1.y -= ny * overlap * 0.5;
                    b2.x += nx * overlap * 0.5;
                    b2.y += ny * overlap * 0.5;

                    // Elastic collision physics (swap velocities based on mass)
                    const kx = b1.vx - b2.vx;
                    const ky = b1.vy - b2.vy;
                    const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

                    b1.vx -= p * b2.mass * nx;
                    b1.vy -= p * b2.mass * ny;
                    b2.vx += p * b1.mass * nx;
                    b2.vy += p * b1.mass * ny;
                }
            }
        }
    }

    function resize() {
        width = hero.offsetWidth;
        height = hero.offsetHeight;
        canvas.width = width;
        canvas.height = height;

        // Reposition beans if they fall out of bounds after resize
        beans.forEach(bean => {
            if (bean.x > width) bean.x = width - bean.radius;
            if (bean.y > height) bean.y = height - bean.radius;
        });
    }

    function init() {
        beans = [];
        resize();

        // Spawn beans randomly throughout the top half of the hero section
        for (let i = 0; i < config.count; i++) {
            const x = Math.random() * (width - 60) + 30;
            const y = Math.random() * (height / 2) + 30;
            beans.push(new CoffeeBean(x, y));
        }

        window.addEventListener('resize', resize);

        // Track cursor coordinates
        hero.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.targetX = e.clientX - rect.left;
            mouse.targetY = e.clientY - rect.top;
        });

        hero.addEventListener('mouseleave', () => {
            mouse.targetX = null;
            mouse.targetY = null;
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse movement tracking (ease cursor coordinate mapping)
        if (mouse.targetX !== null && mouse.targetY !== null) {
            if (mouse.x === null) {
                mouse.x = mouse.targetX;
                mouse.y = mouse.targetY;
            } else {
                mouse.x += (mouse.targetX - mouse.x) * 0.16;
                mouse.y += (mouse.targetY - mouse.y) * 0.16;
            }
        } else {
            mouse.x = null;
            mouse.y = null;
        }

        resolveCollisions();

        beans.forEach(bean => {
            bean.update();
            bean.draw();
        });

        requestAnimationFrame(animate);
    }

    init();
    animate();
})();

