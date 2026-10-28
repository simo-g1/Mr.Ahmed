/* ==================== Elements ==================== */

const header = document.querySelector("#header");
const headerPlaceholder = document.querySelector(".header-placeholder");

const themeToggle = document.querySelector("#theme-toggle");

const intro = document.querySelector("#intro");

const englishCanvas = document.querySelector("#englishCanvas");
const bgContainer = document.querySelector("#bgContainer");


/* ==================== Intro Loading State ==================== */

if (intro && !sessionStorage.getItem("introSeen")) {
  document.body.classList.add("loading");
}


/* ==================== Theme Toggle with LocalStorage ==================== */

function applyTheme(isLight) {
  document.body.classList.toggle("theme-light", isLight);
  document.body.classList.toggle("theme-dark", !isLight);
}

if (themeToggle) {
  // 1. استرجاع الوضع المحفوظ مسبقاً من المتصفح عند فتح الصفحة
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    themeToggle.checked = true;
    applyTheme(true);
  } else {
    themeToggle.checked = false;
    applyTheme(false);
  }

  // 2. تبديل الكلاس وحفظ الاختيار عند الضغط على الزر (بدون أي تكرار)
  themeToggle.addEventListener("change", () => {
    const isLight = themeToggle.checked;
    applyTheme(isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}


/* ==================== Header Placeholder ==================== */

function updateHeaderHeight() {
  if (!header || !headerPlaceholder) return;

  headerPlaceholder.style.height = `${header.offsetHeight}px`;
}

updateHeaderHeight();

window.addEventListener("resize", updateHeaderHeight);


/* ==================== Header Scroll Animation ==================== */

let introFinished = !intro || intro.classList.contains("is-removed");

function updateHeader() {
  if (!header || !introFinished) {
    if (header) {
      header.classList.remove("floating", "leaving");
    }

    return;
  }

  if (window.scrollY > 50) {
    header.classList.remove("leaving");
    header.classList.add("floating");
  } else if (header.classList.contains("floating")) {
    header.classList.add("leaving");
  }
}

window.addEventListener("scroll", updateHeader, {
  passive: true,
});

if (header) {
  header.addEventListener("animationend", (event) => {
    if (
      event.animationName === "header-disappear" &&
      header.classList.contains("leaving") &&
      window.scrollY <= 50
    ) {
      header.classList.remove("floating", "leaving");
    }
  });
}
/* ==================== Intro Animation Integration ==================== */
const introSeen = sessionStorage.getItem("introSeen");

if (intro && introSeen) {
  finishIntro();
} else if (intro) {
  sessionStorage.setItem("introSeen", "true");
  window.setTimeout(finishIntro, 3000);
} else {
  document.body.classList.remove("loading");
  initScrollReveal();
}

/* ==================== Shared Background ==================== */

(function () {
  const canvas = englishCanvas;
  const container = bgContainer;

  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  if (container.parentElement !== document.body) {
    document.body.prepend(container);
  }

  let width;
  let height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);

  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    active: false
  };

  window.addEventListener("mousemove", (event) => {
    mouse.targetX = event.clientX;
    mouse.targetY = event.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  let burstParticles = [];

  window.addEventListener("click", (event) => {
    if (burstParticles.length >= 72) return;
    const clickX = event.clientX;
    const clickY = event.clientY;

    for (let i = 0; i < 18; i++) {
      burstParticles.push(new ClickBurstLetter(clickX, clickY));
    }
  });

  const alphabetList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const englishWords = [
    "GRAMMAR",
    "VOCABULARY",
    "FLUENCY",
    "SUCCESS",
    "LEARN",
    "ENGLISH",
    "PHRASES",
    "EXCELLENCE"
  ];


  /* =======================================================
     1. FLOATING ALPHABETS
     ======================================================= */

  class FloatingAlphabet {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 40;
      this.char = alphabetList[
        Math.floor(Math.random() * alphabetList.length)
      ];

      this.size = Math.floor(Math.random() * 22) + 16;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.55 + 0.25;
      this.rotation = (Math.random() - 0.5) * 0.5;
      this.rotSpeed = (Math.random() - 0.5) * 0.015;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);
      const maxDist = 180;

      if (dist > 0 && dist < maxDist) {
        const force = (1 - dist / maxDist) * 3.5;

        this.x -= (dx / dist) * force;
        this.y -= (dy / dist) * force;
      }

      if (
        this.y < -50 ||
        this.x < -50 ||
        this.x > width + 50
      ) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();

      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      ctx.globalAlpha = this.alpha;
      ctx.font = `700 ${this.size}px 'Playfair Display', serif`;
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 12;

      ctx.fillText(this.char, 0, 0);

      ctx.restore();
    }
  }


  /* =======================================================
     2. FLOATING ENGLISH WORDS
     ======================================================= */

  class FloatingWord {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 60;

      this.word = englishWords[
        Math.floor(Math.random() * englishWords.length)
      ];

      this.speedY = -(Math.random() * 0.45 + 0.2);
      this.alpha = Math.random() * 0.35 + 0.15;
      this.scale = 1;
    }

    update() {
      this.y += this.speedY;

      const dist = Math.hypot(
        mouse.x - this.x,
        mouse.y - this.y
      );

      if (dist < 160) {
        this.scale = 1 + (1 - dist / 160) * 0.35;
        this.alpha = Math.min(0.9, this.alpha + 0.03);
      } else {
        this.scale += (1 - this.scale) * 0.05;
      }

      if (this.y < -60) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();

      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);

      ctx.globalAlpha = this.alpha;
      ctx.font = "800 13px 'Montserrat', sans-serif";
      ctx.fillStyle = "#7dd3fc";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      ctx.letterSpacing = "3px";

      ctx.fillText(this.word, 0, 0);

      ctx.restore();
    }
  }


  /* =======================================================
     3. CYAN DUST PARTICLES
     ======================================================= */

  class CyanDustParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.2 + 0.6;
      this.speedY = -(Math.random() * 0.5 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.65 + 0.2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.y < 0) {
        this.reset();
      }
    }

    draw() {
      ctx.save();

      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }


  /* =======================================================
     4. INTERACTIVE CLICK BURST
     ======================================================= */

  class ClickBurstLetter {
    constructor(x, y) {
      this.x = x;
      this.y = y;

      this.char = alphabetList[
        Math.floor(Math.random() * alphabetList.length)
      ];

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6.5 + 2;

      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.alpha = 1;
      this.size = Math.random() * 20 + 14;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      this.vx *= 0.94;
      this.vy *= 0.94;

      this.alpha -= 0.025;
    }

    draw() {
      if (this.alpha <= 0) return;

      ctx.save();

      ctx.globalAlpha = this.alpha;
      ctx.font = `800 ${this.size}px 'Playfair Display', serif`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 18;

      ctx.fillText(this.char, this.x, this.y);

      ctx.restore();
    }
  }


  /* =======================================================
     5. SMOOTH WAVE FILAMENTS
     ======================================================= */

  class SmoothEnergyWave {
    constructor(yRatio, amplitude, speed, color, widthSize) {
      this.yRatio = yRatio;
      this.amplitude = amplitude;
      this.speed = speed;
      this.offset = Math.random() * Math.PI * 2;
      this.color = color;
      this.widthSize = widthSize;
    }

    draw(time) {
      ctx.save();

      ctx.beginPath();
      ctx.lineWidth = this.widthSize;
      ctx.strokeStyle = this.color;
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 14;

      const baseY = height * this.yRatio;
      const points = 90;
      const dx = width / points;

      for (let i = 0; i <= points; i++) {
        const x = i * dx;

        const wave =
          Math.sin(
            i * 0.025 + time * this.speed + this.offset
          ) * this.amplitude;

        const distToMouse = Math.hypot(
          x - mouse.x,
          baseY - mouse.y
        );

        let mouseLift = 0;

        if (distToMouse < 220) {
          mouseLift =
            Math.sin(
              (1 - distToMouse / 220) * Math.PI
            ) * -35;
        }

        const y = baseY + wave + mouseLift;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.restore();
    }
  }


  /* =======================================================
     SYSTEM INITIALIZATION
     ======================================================= */

  let alphabets = [];
  let words = [];
  let dustParticles = [];
  let energyWaves = [];

  function initSystem() {
    // قللنا العدد شوية عشان الخفة وسرعة الـ FPS
    const isMobile = window.innerWidth < 768;

    alphabets = [];
    for (let i = 0; i < (isMobile ? 15 : 30); i++) {
      alphabets.push(new FloatingAlphabet());
    }

    words = [];
    for (let i = 0; i < (isMobile ? 6 : 10); i++) {
      words.push(new FloatingWord());
    }

    dustParticles = [];
    for (let i = 0; i < (isMobile ? 25 : 45); i++) {
      dustParticles.push(new CyanDustParticle());
    }

    energyWaves = [
      new SmoothEnergyWave(
        0.28, 30, 0.9,
        "rgba(14, 165, 233, 0.35)", 1.8
      ),

      new SmoothEnergyWave(
        0.52, 45, 0.7,
        "rgba(56, 189, 248, 0.45)", 2.2
      ),

      new SmoothEnergyWave(
        0.78, 32, 1.1,
        "rgba(2, 132, 199, 0.30)", 1.5
      )
    ];
  }

  initSystem();

  let time = 0;

  function animate() {
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.fillStyle = document.body.classList.contains("theme-light") ? "#ffffff" : "#030712";
    ctx.fillRect(0, 0, width, height);

    time += 0.015;

    energyWaves.forEach((wave) => {
      wave.draw(time);
    });

    dustParticles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    words.forEach((word) => {
      word.update();
      word.draw();
    });

    alphabets.forEach((alphabet) => {
      alphabet.update();
      alphabet.draw();
    });

    burstParticles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    burstParticles = burstParticles.filter((particle) => particle.alpha > 0);

    requestAnimationFrame(animate);
  }

  animate();
})();

// Auto Update Copyright Year
const yearSpan = document.querySelector("#currentYear");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* ==================== Intro Animation & Scroll Reveal Integration ==================== */

function initScrollReveal() {
  document.body.classList.add("content-ready");

  const revealElements = document.querySelectorAll(".reveal-item");
  if (!revealElements.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

function finishIntro() {
  if (intro) {
    intro.classList.add("is-hidden");
    setTimeout(() => {
      intro.classList.add("is-removed");
    }, 400);
  }

  document.body.classList.remove("loading");

  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
  }
  window.scrollTo(0, 0);

  introFinished = true;
  updateHeader();

  // إظهار عناصر الهيرو فوراً والباقي يظهر تدريجياً بالـ Scroll
  document.querySelectorAll(".hero .reveal-item").forEach(el => {
    el.classList.add("is-visible");
  });

  // تشغيل الـ Observer لباقي أقسام الموقع
  initScrollReveal();
}


/* ==================== Career Timeline ==================== */
const careerDetails = document.querySelectorAll(".career-detail");
const careerDots = document.querySelectorAll(".career-dot");

careerDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    careerDots.forEach((classRemover) => {
      classRemover.classList.remove("is-active");
    })
    careerDetails.forEach((classRemover) => {
      classRemover.classList.remove("is-active");
    })
    dot.classList.add("is-active");
    const careerDot = dot.dataset.target;
    const careerDetail = document.getElementById(careerDot);
    careerDetail.classList.add("is-active");
  });
});
/* ==================== Floating Contact Button ==================== */

const floatingContact = document.querySelector(".floating-contact");
const hideTargets = document.querySelectorAll("#contact, .site-footer");

if (floatingContact && hideTargets.length) {
  const visibleTargets = new Set();

  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleTargets.add(entry.target);
      } else {
        visibleTargets.delete(entry.target);
      }
    });

    floatingContact.classList.toggle("is-hidden", visibleTargets.size > 0);
  });

  hideTargets.forEach((target) => contactObserver.observe(target));
}