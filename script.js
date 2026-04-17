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
