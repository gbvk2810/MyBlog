// main.js

gsap.registerPlugin(ScrollTrigger);

// Custom Text Splitter Utility
const splitText = (selector) => {
    const elements = document.querySelectorAll(selector);
    let globalCharIndex = 0; // global counter across all words for wave effect
    elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = '';
        el.style.opacity = 1; // Unhide if it was hidden
        
        // Split by words first, then characters to maintain wrapping
        const words = text.split(' ');
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word inline-flex'; // Removed overflow-hidden to prevent clipping
            wordSpan.style.marginRight = '0.3em'; // space between words
            wordSpan.style.gap = '0.04em'; // space between chars inside flex container
            
            const chars = word.split('');
            chars.forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char'; // No Tailwind transforms — GSAP controls position
                charSpan.style.setProperty('--i', globalCharIndex++); // for CSS wave delay
                charSpan.innerHTML = char === ' ' ? '&nbsp;' : char;
                wordSpan.appendChild(charSpan);
            });
            
            el.appendChild(wordSpan);
        });
    });
};

class CursorManager {
    constructor() {
        this.cursorLight = document.getElementById('cursor-light');
        this.magneticBtns = document.querySelectorAll('.magnetic-btn');
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.targetX = this.mouseX;
        this.targetY = this.mouseY;
        
        this.init();
    }

    init() {
        if (!this.cursorLight) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        window.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
            
            // Show light on first move
            if (this.cursorLight.style.opacity == 0 || this.cursorLight.style.opacity === '') {
                this.cursorLight.style.opacity = 1;
            }
        });

        // Smooth cursor follow using GSAP ticker
        gsap.ticker.add(() => {
            // Lerp for smooth lighting (0.4 for faster response)
            this.mouseX += (this.targetX - this.mouseX) * 0.4;
            this.mouseY += (this.targetY - this.mouseY) * 0.4;
            
            gsap.set(this.cursorLight, {
                x: this.mouseX,
                y: this.mouseY
            });
        });

        // Magnetic Buttons
        this.magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.6,
                    ease: "power3.out"
                });
                
                const span = btn.querySelector('span');
                if (span) {
                    gsap.to(span, {
                        x: x * 0.15,
                        y: y * 0.15,
                        duration: 0.6,
                        ease: "power3.out"
                    });
                }
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
                const span = btn.querySelector('span');
                if (span) {
                    gsap.to(span, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
                }
            });
        });
    }
}

class MotionManager {
    constructor() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        if (this.reducedMotion) {
            // Unhide elements gracefully if reduced motion
            gsap.set('.hero-subtitle, .hero-actions, .reveal-text, .reveal-fade', { opacity: 1 });
            return;
        }

        this.heroEntrance();
        this.scrollSequences();
        this.fluidCards();
        this.heroTilt();
    }

    heroEntrance() {
        if (!document.querySelector('.hero-title')) return;

        splitText('.hero-title');
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        // TARGET: HOME (Vertical Breach)
        if (document.querySelector('.title-home')) {
            tl.fromTo('.char', 
                { y: "110%", rotate: 10, opacity: 0 },
                { y: "0%", rotate: 0, opacity: 1, duration: 1.2, stagger: 0.03, delay: 0.2 }
            );
        } 
        // TARGET: ABOUT (Neural Focus)
        else if (document.querySelector('.title-about')) {
            tl.fromTo('.char', 
                { opacity: 0, scale: 0.5, filter: "blur(10px)" },
                { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, stagger: 0.04, ease: "back.out(1.7)", delay: 0.2 }
            );
        }
        // TARGET: CONTACT (Packet Assembly)
        else if (document.querySelector('.title-contact')) {
            tl.fromTo('.char', 
                { opacity: 0, x: () => Math.random() * 200 - 100, y: () => Math.random() * 200 - 100, rotate: () => Math.random() * 360 },
                { opacity: 1, x: 0, y: 0, rotate: 0, duration: 1.5, stagger: 0.02, ease: "power4.out", delay: 0.2 }
            );
        }
        // TARGET: GAME (System Glitch)
        else if (document.querySelector('.title-game')) {
            tl.fromTo('.char', 
                { opacity: 0, x: -30, skewX: 45 },
                { opacity: 1, x: 0, skewX: 0, duration: 0.8, stagger: 0.02, ease: "elastic.out(1, 0.3)", delay: 0.2 }
            );
        }

        // Common Reveal for Subtitles and Actions
        tl.fromTo('.hero-subtitle',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.2 },
            "-=0.8"
        )
        .fromTo('.hero-actions',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.2 },
            "-=1.0"
        );
    }

    heroTilt() {
        const heroSection = document.getElementById('hero');
        const heroImage = document.getElementById('hero-image');
        
        if (heroSection && heroImage) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                // Calculate mouse position relative to center (-1 to 1)
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(heroImage, {
                    rotateY: x * 10,
                    rotateX: -y * 10,
                    x: x * -20,
                    y: y * -20,
                    duration: 1.5,
                    ease: "power2.out",
                    transformPerspective: 900,
                    transformOrigin: "center center"
                });
            });

            heroSection.addEventListener('mouseleave', () => {
                gsap.to(heroImage, {
                    rotateY: 0,
                    rotateX: 0,
                    x: 0,
                    y: 0,
                    duration: 2,
                    ease: "expo.out"
                });
            });
        }
    }

    scrollSequences() {
        // Feature Section Text Reveals
        gsap.utils.toArray('.reveal-text').forEach(text => {
            gsap.fromTo(text, 
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: text,
                        start: "top 85%",
                    }
                }
            );
        });

        gsap.utils.toArray('.reveal-fade').forEach(el => {
            gsap.fromTo(el, 
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                    }
                }
            );
        });

        // Cards Stagger Reveal
        gsap.fromTo('.feature-card', 
            { opacity: 0, y: 100 },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                stagger: 0.1,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: '.feature-card',
                    start: "top 85%",
                }
            }
        );

        // Morphing Background sequence
        const bridgeSection = document.getElementById('bridge');
        if (bridgeSection) {
            gsap.to('body', {
                backgroundColor: "#050510", // Morph to deep blue/purple
                ease: "none",
                scrollTrigger: {
                    trigger: bridgeSection,
                    start: "top 60%",
                    end: "center center",
                    scrub: true,
                    onEnterBack: () => gsap.to('body', { backgroundColor: "#0a0a0a", duration: 0.5 }),
                    onLeaveBack: () => gsap.to('body', { backgroundColor: "#0a0a0a", duration: 0.5 })
                }
            });

            // Parallax for bridge title
            gsap.to('.bridge-title', {
                y: -100,
                ease: "none",
                scrollTrigger: {
                    trigger: bridgeSection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    }

    fluidCards() {
        const cards = document.querySelectorAll('.feature-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
                const rotateY = ((x - centerX) / centerX) * 10;
                
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    duration: 0.5,
                    ease: "power2.out",
                    transformPerspective: 1000
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }
}

// Initialize on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    new CursorManager();
    new MotionManager();
});
