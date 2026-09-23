/**
 * Lumina - Landing Page Script
 * Features:
 *  1. Organic Lava Lamp Fluid Simulation Engine (HTML5 Canvas)
 *  2. Responsive Navigation & Mobile Drawer
 *  3. ScrollSpy & Sticky Header Management
 *  4. Interactive Contact Form with Validation & Feedback Toast
 */

document.addEventListener('DOMContentLoaded', () => {
  initLavaLamp();
  initNavigation();
  initScrollEffects();
  initContactForm();
});

/* ==========================================================================
   1. ORGANIC LAVA LAMP SIMULATION ENGINE
   ========================================================================== */
function initLavaLamp() {
  const canvas = document.getElementById('lavaCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Palettes (Soft vibrant translucents for light theme)
  const palettes = {
    sunset: [
      { r: 255, g: 107, b: 107, a: 0.55 }, // Coral
      { r: 255, g: 159, b: 67,  a: 0.50 }, // Amber
      { r: 254, g: 114, b: 155, a: 0.45 }, // Rose Pink
      { r: 255, g: 190, b: 118, a: 0.45 }  // Peach
    ],
    aurora: [
      { r: 139, g: 92,  b: 246, a: 0.50 }, // Violet
      { r: 6,   g: 182, b: 212, a: 0.45 }, // Aqua Cyan
      { r: 99,  g: 102, b: 241, a: 0.45 }, // Indigo
      { r: 56,  g: 189, b: 248, a: 0.40 }  // Sky
    ],
    citrus: [
      { r: 245, g: 158, b: 11,  a: 0.50 }, // Warm Amber
      { r: 251, g: 146, b: 60,  a: 0.50 }, // Tangerine
      { r: 250, g: 204, b: 21,  a: 0.45 }, // Gold
      { r: 244, g: 63,  b: 94,   a: 0.45 }  // Coral Pink
    ]
  };

  let currentPaletteName = 'sunset';
  let currentPalette = palettes[currentPaletteName];

  // Mouse interaction tracker
  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    active: false,
    radius: 140
  };

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Lava Lamp Blob Definition
  class LavaBlob {
    constructor(id) {
      this.id = id;
      this.reset(true);
    }

    reset(initial = false) {
      this.baseRadius = Math.random() * 85 + 75; // 75px - 160px
      this.radius = this.baseRadius;
      this.x = Math.random() * width;
      // Start either rising from bottom or cooling at top
      this.y = initial ? Math.random() * height : height + this.radius + Math.random() * 80;
      
      // Vertical convection: -1 (rising, heated wax) or 1 (sinking, cooled wax)
      this.direction = initial ? (Math.random() > 0.45 ? -1 : 1) : -1;
      
      // Speed properties (gentle lava lamp fluid float)
      this.speedY = (Math.random() * 0.4 + 0.35) * this.direction;
      this.speedX = (Math.random() - 0.5) * 0.3;
      
      // Organic wobble parameters
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.015 + 0.008;
      this.deformX = 1;
      this.deformY = 1;

      // Color selection from active palette
      this.colorIndex = Math.floor(Math.random() * currentPalette.length);
      this.color = currentPalette[this.colorIndex];
    }

    update() {
      // Convection cycle (lava lamp physics)
      this.y += this.speedY;
      this.x += this.speedX;

      // Organic shape deformation (liquid stretching & pulsing)
      this.wobblePhase += this.wobbleSpeed;
      const pulse = Math.sin(this.wobblePhase);
      
      // When moving vertically faster, wax elongates
      const stretchFactor = Math.abs(this.speedY) * 0.25;
      this.deformX = 1 - (pulse * 0.08) - (stretchFactor * 0.15);
      this.deformY = 1 + (pulse * 0.08) + (stretchFactor * 0.2);

      // Boundary convection turnarounds
      if (this.direction === -1 && this.y < -this.radius * 1.5) {
        // Cooled at the top, pause and turn around downwards
        this.y = -this.radius;
        this.direction = 1;
        this.speedY = Math.random() * 0.3 + 0.25;
      } else if (this.direction === 1 && this.y > height + this.radius * 1.5) {
        // Reheated at bottom, turn around upwards
        this.y = height + this.radius;
        this.direction = -1;
        this.speedY = -(Math.random() * 0.4 + 0.3);
      }

      // Gentle lateral wall bounce
      if (this.x < -this.radius * 0.5) {
        this.x = -this.radius * 0.5;
        this.speedX = Math.abs(this.speedX);
      } else if (this.x > width + this.radius * 0.5) {
        this.x = width + this.radius * 0.5;
        this.speedX = -Math.abs(this.speedX);
      }

      // Gentle mouse interaction (fluid ripple away from cursor)
      if (mouse.active) {
        const dx = this.x - mouse.targetX;
        const dy = this.y - mouse.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius + this.radius) {
          const force = (1 - dist / (mouse.radius + this.radius)) * 0.8;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 3;
          this.y += Math.sin(angle) * force * 3;
        }
      }

      // Dynamically track active palette color
      this.color = currentPalette[this.colorIndex % currentPalette.length];
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.scale(this.deformX, this.deformY);

      // Radial glow gradient to simulate light passing through translucent liquid wax
      const gradient = context.createRadialGradient(
        0, 0, this.radius * 0.1,
        0, 0, this.radius
      );

      const c = this.color;
      gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 1.1})`);
      gradient.addColorStop(0.65, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.8})`);
      gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(0, 0, this.radius, 0, Math.PI * 2);
      context.fill();

      context.restore();
    }
  }

  // Create Blob collection based on viewport scale
  const blobCount = Math.max(9, Math.min(15, Math.floor(width / 110)));
  const blobs = [];
  for (let i = 0; i < blobCount; i++) {
    blobs.push(new LavaBlob(i));
  }

  // Animation Loop
  let animationFrameId;
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw blobs with translucent layering
    for (let i = 0; i < blobs.length; i++) {
      blobs[i].update();
      blobs[i].draw(ctx);
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  // Palette Switching Controls
  const paletteButtons = document.querySelectorAll('.palette-btn');
  paletteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const palette = e.currentTarget.getAttribute('data-palette');
      if (palettes[palette]) {
        currentPaletteName = palette;
        currentPalette = palettes[palette];
        paletteButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Update indicator dot color
        const dot = document.querySelector('.lava-pill-dot');
        if (dot) {
          const firstColor = currentPalette[0];
          dot.style.backgroundColor = `rgb(${firstColor.r}, ${firstColor.g}, ${firstColor.b})`;
          dot.style.boxShadow = `0 0 10px rgb(${firstColor.r}, ${firstColor.g}, ${firstColor.b})`;
        }
      }
    });
  });
}

/* ==========================================================================
   2. RESPONSIVE NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!hamburgerBtn || !navMenu) return;

  function toggleMenu(show) {
    const isOpen = show !== undefined ? show : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', isOpen);
    hamburgerBtn.classList.toggle('active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close mobile drawer when clicking any link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close when clicking outside menu
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   3. SCROLLSPY & STICKY HEADER MANAGEMENT
   ========================================================================== */
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Header shadow on scroll
    if (navbar) {
      if (scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ScrollSpy with IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   4. CONTACT FORM VALIDATION & FEEDBACK TOAST
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const toast = document.getElementById('toastNotification');
  const toastCloseBtn = document.getElementById('toastCloseBtn');

  if (!contactForm) return;

  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('emailAddress');
  const messageInput = document.getElementById('message');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  let toastTimeout;

  function showToast(message = 'Thank you for reaching out. We will get back to you shortly.') {
    if (!toast) return;
    const toastMsgEl = toast.querySelector('.toast-message');
    if (toastMsgEl) toastMsgEl.textContent = message;

    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      toast.classList.remove('show');
    });
  }

  // Realtime error clearing
  [nameInput, emailInput, messageInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errEl = document.getElementById(input.id.replace('Address', '').replace('fullName', 'name') + 'Error');
      if (errEl) errEl.textContent = '';
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.classList.add('error');
      nameError.textContent = 'Please enter your full name.';
      isValid = false;
    } else if (nameInput.value.trim().length < 2) {
      nameInput.classList.add('error');
      nameError.textContent = 'Name must be at least 2 characters.';
      isValid = false;
    } else {
      nameInput.classList.remove('error');
      nameError.textContent = '';
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      emailInput.classList.add('error');
      emailError.textContent = 'Work email is required.';
      isValid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.classList.add('error');
      emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    } else {
      emailInput.classList.remove('error');
      emailError.textContent = '';
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      messageInput.classList.add('error');
      messageError.textContent = 'Please write a brief message.';
      isValid = false;
    } else if (messageInput.value.trim().length < 10) {
      messageInput.classList.add('error');
      messageError.textContent = 'Message should be at least 10 characters.';
      isValid = false;
    } else {
      messageInput.classList.remove('error');
      messageError.textContent = '';
    }

    if (!isValid) return;

    // Simulate sending with button loader
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      contactForm.reset();
      showToast(`Thanks ${nameInput.value.split(' ')[0] || ''}! Your message has been received.`);
    }, 750);
  });
}
