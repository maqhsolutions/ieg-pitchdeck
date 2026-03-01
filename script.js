(() => {
    'use strict';

    const slides = document.querySelectorAll('.slide');
    const total = slides.length;
    let current = 0;
    let locked = false;

    // Build dots
    const nav = document.getElementById('slideNav');
    slides.forEach((_, i) => {
        const d = document.createElement('button');
        d.classList.add('dot');
        if (i === 0) d.classList.add('active');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => go(i));
        nav.appendChild(d);
    });

    const dots = nav.querySelectorAll('.dot');
    const counter = document.getElementById('slideCounter');
    document.getElementById('prevBtn').addEventListener('click', prev);
    document.getElementById('nextBtn').addEventListener('click', next);

    function go(i) {
        if (locked || i === current || i < 0 || i >= total) return;
        locked = true;
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = i;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
        counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
        if (current === 2) countUp();
        setTimeout(() => { locked = false; }, 500);
    }

    function next() { if (current < total - 1) go(current + 1); }
    function prev() { if (current > 0) go(current - 1); }

    // Keyboard
    document.addEventListener('keydown', e => {
        if (['ArrowRight', 'ArrowDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
        if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); prev(); }
    });

    // Wheel
    let wt;
    document.addEventListener('wheel', e => {
        e.preventDefault();
        clearTimeout(wt);
        wt = setTimeout(() => { e.deltaY > 0 ? next() : prev(); }, 60);
    }, { passive: false });

    // Institutional 3D Parallax & Magnetic Hover
    const interactiveElements = document.querySelectorAll('.usp-card, .m-card, .impact-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate tilt (subtle, max ~6 degrees)
            const tiltX = ((y - centerY) / centerY) * -6;
            const tiltY = ((x - centerX) / centerX) * 6;

            // Disable transition during active tilt to prevent "jitter" or "flicker"
            el.style.transition = 'none';

            // Apply slight lift and 3D rotation
            el.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        el.addEventListener('mouseleave', () => {
            // Restore smooth transition for the reset
            el.style.transition = '';
            // Clear inline style to allow CSS transition to smoothly reset the card
            el.style.transform = '';
        });
    });

    // Touch
    let ty = 0, tx = 0;
    document.addEventListener('touchstart', e => { ty = e.touches[0].clientY; tx = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', e => {
        const dy = ty - e.changedTouches[0].clientY;
        const dx = tx - e.changedTouches[0].clientX;
        if (Math.abs(dy) > Math.abs(dx)) { if (Math.abs(dy) > 50) dy > 0 ? next() : prev(); }
        else { if (Math.abs(dx) > 50) dx > 0 ? next() : prev(); }
    }, { passive: true });

    // Count up on impact slide
    function countUp() {
        document.querySelectorAll('.impact-num[data-count]').forEach(el => {
            const t = +el.dataset.count, dur = 1500, s = performance.now();
            const ease = x => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            (function u(now) {
                const p = Math.min((now - s) / dur, 1);
                el.textContent = Math.floor(ease(p) * t).toLocaleString();
                p < 1 ? requestAnimationFrame(u) : (el.textContent = t.toLocaleString());
            })(s);
        });
    }
})();
