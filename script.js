// ===================================
// Modern JavaScript for GlowOut Partners
// ===================================

'use strict';

// ===================================
// Theme Management
// ===================================

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Update icon
        const icon = this.themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// ===================================
// Navigation Management
// ===================================

class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        // Handle scroll effects
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Handle mobile menu toggle
        this.navToggle.addEventListener('click', () => this.toggleMenu());
        
        // Handle nav link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
    }

    handleNavClick(e) {
        const href = e.currentTarget.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                this.closeMenu();
            }
        }
    }

    handleOutsideClick(e) {
        if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
            this.closeMenu();
        }
    }
}

// ===================================
// Back to Top Button
// ===================================

class BackToTopButton {
    constructor() {
        this.button = document.getElementById('backToTop');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.button.addEventListener('click', () => this.scrollToTop());
    }

    handleScroll() {
        if (window.scrollY > 300) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ===================================
// Scroll Animations
// ===================================

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.init();
    }

    init() {
        // Create intersection observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all elements with data-aos attribute
        this.elements.forEach(element => {
            this.observer.observe(element);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                
                // Optional: stop observing after animation
                // this.observer.unobserve(entry.target);
            }
        });
    }
}

// ===================================
// Performance Optimization
// ===================================

// Debounce function for resize events
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================
// Image Lazy Loading Enhancement
// ===================================

class ImageLazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: '50px'
                }
            );

            this.images.forEach(img => this.observer.observe(img));
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                this.observer.unobserve(img);
            }
        });
    }

    loadAllImages() {
        this.images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ===================================
// Smooth Scroll Polyfill for older browsers
// ===================================

function smoothScrollPolyfill() {
    if (!('scrollBehavior' in document.documentElement.style)) {
        // Import smooth scroll polyfill if needed
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
        script.onload = () => {
            window.__forceSmoothScrollPolyfill__ = true;
            smoothscroll.polyfill();
        };
        document.head.appendChild(script);
    }
}

// ===================================
// Active Link Highlighting
// ===================================

class ActiveLinkHighlighter {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        window.addEventListener('scroll', debounce(() => this.highlightActiveLink(), 100));
    }

    highlightActiveLink() {
        const scrollPosition = window.scrollY + 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ===================================
// Animated Counter (for future stats)
// ===================================

class AnimatedCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
    }

    animate() {
        const start = 0;
        const increment = this.target / (this.duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= this.target) {
                this.element.textContent = this.target;
                clearInterval(timer);
            } else {
                this.element.textContent = Math.floor(current);
            }
        }, 16);
    }
}

// ===================================
// Form Validation (if forms are added later)
// ===================================

class FormValidator {
    constructor(form) {
        this.form = form;
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validate()) {
            // Submit form
            console.log('Form is valid');
        }
    }

    validate() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearError(input);
            }
        });

        return isValid;
    }

    showError(input, message) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = message;
            input.parentNode.insertBefore(error, input.nextSibling);
        }
        input.classList.add('error');
    }

    clearError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        input.classList.remove('error');
    }
}

// ===================================
// Loading Animation
// ===================================

function hideLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}

// ===================================
// Initialize Everything
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme management
    new ThemeManager();
    
    // Initialize navigation
    new NavigationManager();
    
    // Initialize back to top button
    new BackToTopButton();
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize lazy loading (if needed)
    // new ImageLazyLoader();
    
    // Initialize active link highlighting
    new ActiveLinkHighlighter();
    
    // Initialize smooth scroll polyfill
    smoothScrollPolyfill();
    
    // Hide loader if present
    hideLoader();
    
    // Log initialization
    console.log('✨ GlowOut Partners website initialized successfully!');
});

// ===================================
// Handle Window Resize
// ===================================

window.addEventListener('resize', debounce(() => {
    // Handle responsive adjustments
    const navMenu = document.getElementById('navMenu');
    
    if (window.innerWidth > 1024) {
        navMenu.classList.remove('active');
    }
}, 250));

// ===================================
// Prefetch Resources on Hover
// ===================================

document.addEventListener('mouseover', (e) => {
    if (e.target.tagName === 'A' && e.target.href) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = e.target.href;
        document.head.appendChild(link);
    }
}, { once: true });

// ===================================
// Performance Monitoring
// ===================================

if ('performance' in window && 'PerformanceObserver' in window) {
    // Monitor largest contentful paint
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
        // Browser doesn't support this metric
    }
}

// ===================================
// Service Worker Registration (optional)
// ===================================

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(registration => console.log('SW registered:', registration))
//             .catch(error => console.log('SW registration failed:', error));
//     });
// }

// ===================================
// Export for potential module usage
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        NavigationManager,
        BackToTopButton,
        ScrollAnimations,
        ImageLazyLoader,
        FormValidator,
        AnimatedCounter
    };
}

