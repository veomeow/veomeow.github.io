(() => {
    const canvas = document.getElementById('stars');
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1025px)');
    const colors = ['71, 105, 79', '105, 85, 150'];
    const frameInterval = 1000 / 24;
    let stars = [];
    let animationFrame = 0;
    let previousTime = 0;

    function resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(window.innerWidth * ratio);
        canvas.height = Math.round(window.innerHeight * ratio);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const count = Math.min(28, Math.max(18, Math.floor(window.innerWidth / 65)));
        stars = Array.from({ length: count }, (_, index) => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - .5) * .035,
            vy: (Math.random() - .5) * .035,
            radius: .7 + Math.random() * 1.1,
            alpha: .18 + Math.random() * .25,
            color: colors[index % colors.length],
            phase: Math.random() * Math.PI * 2
        }));
    }

    function draw(time, move) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        stars.forEach((star, index) => {
            if (move) {
                star.x += star.vx;
                star.y += star.vy;
                if (star.x < -4) star.x = window.innerWidth + 4;
                if (star.x > window.innerWidth + 4) star.x = -4;
                if (star.y < -4) star.y = window.innerHeight + 4;
                if (star.y > window.innerHeight + 4) star.y = -4;
            }

            const shimmer = reduceMotion.matches ? 1 : .86 + Math.sin(time * .0007 + star.phase) * .14;
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(${star.color}, ${star.alpha * shimmer})`;
            context.fill();

            for (let nextIndex = index + 1; nextIndex < stars.length; nextIndex += 1) {
                const next = stars[nextIndex];
                const dx = star.x - next.x;
                const dy = star.y - next.y;
                const distance = Math.hypot(dx, dy);
                if (distance < 135) {
                    context.beginPath();
                    context.moveTo(star.x, star.y);
                    context.lineTo(next.x, next.y);
                    context.strokeStyle = `rgba(105, 85, 150, ${(1 - distance / 135) * .07})`;
                    context.lineWidth = .6;
                    context.stroke();
                }
            }
        });
    }

    function animate(time) {
        if (!document.hidden && desktop.matches && !reduceMotion.matches) {
            if (time - previousTime >= frameInterval) {
                draw(time, true);
                previousTime = time;
            }
            animationFrame = window.requestAnimationFrame(animate);
        }
    }

    function updateMode() {
        window.cancelAnimationFrame(animationFrame);
        if (!desktop.matches) {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            return;
        }

        draw(performance.now(), false);
        if (!reduceMotion.matches && !document.hidden) {
            animationFrame = window.requestAnimationFrame(animate);
        }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            resize();
            updateMode();
        }, 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', updateMode);
    reduceMotion.addEventListener('change', updateMode);
    desktop.addEventListener('change', updateMode);

    resize();
    updateMode();
})();
