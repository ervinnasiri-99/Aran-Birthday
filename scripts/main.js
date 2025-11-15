import Lenis from "https://unpkg.com/@studio-freight/lenis@1.0.35/dist/lenis.mjs";

// Ensure GSAP plugins are registered if available globally
if (window.gsap) {
  const { gsap } = window;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (window.MotionPathPlugin) gsap.registerPlugin(window.MotionPathPlugin);
  if (window.MorphSVGPlugin) gsap.registerPlugin(window.MorphSVGPlugin);
}

const gsap = window.gsap;

function setupSmoothScroll() {
  if (!Lenis) return;
  const lenis = new Lenis({
    smooth: true,
    lerp: 0.1,
    wheelMultiplier: 1.1,
  });

  // Expose Lenis globally so other setup functions can use smooth scrolling
  window._lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const scrollTopBtn = document.getElementById("scroll-top");
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      lenis.scrollTo("#hero", { offset: -80 });
    });
  }
}

function setupCursorSystem() {
  if (!gsap) return;

  const cursorOuter = document.getElementById("cursor-outer");
  const cursorInner = document.getElementById("cursor-inner");
  const cursorTrailContainer = document.getElementById("cursor-trail");
  const cursorRipples = document.getElementById("cursor-ripples");
  const cursorCore = document.getElementById("cursor-core");
  const quotesSpotlight = document.querySelector(".quotes-spotlight");

  if (!cursorOuter || !cursorInner || !cursorTrailContainer) return;

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { ...pos };

  const trailCount = 18;
  const trailDots = [];
  for (let i = 0; i < trailCount; i++) {
    const dot = document.createElement("div");
    dot.className =
      "pointer-events-none fixed w-2 h-2 rounded-full bg-neonCyan/70 mix-blend-screen";
    cursorTrailContainer.appendChild(dot);
    trailDots.push({ element: dot, x: pos.x, y: pos.y });
  }

  const pointer = { x: pos.x, y: pos.y };

  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    target.x = e.clientX;
    target.y = e.clientY;

    const xp = (e.clientX / window.innerWidth) * 100;
    const yp = (e.clientY / window.innerHeight) * 100;

    if (cursorCore) {
      cursorCore.style.background = `radial-gradient(circle at ${xp}% ${yp}%, rgba(56,189,248,0.23), transparent 60%)`;
    }
    if (quotesSpotlight) {
      quotesSpotlight.style.background = `radial-gradient(circle at ${xp}% ${yp}%, rgba(56,189,248,0.45), transparent 60%)`;
    }
  });

  // Custom cursor follow
  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;

    gsap.set(cursorOuter, { x: pos.x, y: pos.y });
    gsap.set(cursorInner, { x: target.x, y: target.y });

    // Trail update
    trailDots.forEach((dot, i) => {
      const lag = (i + 1) / trailDots.length;
      dot.x += (pos.x - dot.x) * lag * 0.4;
      dot.y += (pos.y - dot.y) * lag * 0.4;
      const scale = 1 - i / trailDots.length;
      gsap.set(dot.element, {
        x: dot.x,
        y: dot.y,
        scale,
        opacity: 0.3 + scale * 0.5,
      });
    });
  });

  // Inner pulse
  gsap.to(cursorInner, {
    scale: 1.5,
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Ripple on click
  window.addEventListener("pointerdown", (e) => {
    const ripple = document.createElement("div");
    ripple.className =
      "pointer-events-none fixed w-4 h-4 rounded-full border border-neonPink/80 mix-blend-screen";
    cursorRipples.appendChild(ripple);
    gsap.set(ripple, { x: e.clientX, y: e.clientY, scale: 0, opacity: 1 });
    gsap.to(ripple, {
      scale: 8,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    });
  });

  // Sticky zone for vault
  const vaultSection = document.getElementById("vault");
  const vaultLock = document.getElementById("vault-lock");

  if (vaultSection && vaultLock) {
    gsap.ticker.add(() => {
      const rect = vaultSection.getBoundingClientRect();
      const inside =
        pointer.x >= rect.left &&
        pointer.x <= rect.right &&
        pointer.y >= rect.top &&
        pointer.y <= rect.bottom;

      if (inside) {
        const lockRect = vaultLock.getBoundingClientRect();
        const lockCenter = {
          x: lockRect.left + lockRect.width / 2,
          y: lockRect.top + lockRect.height / 2,
        };
        // Make the outer cursor gently sticky toward the lock center
        target.x += (lockCenter.x - target.x) * 0.08;
        target.y += (lockCenter.y - target.y) * 0.08;
      }
    });
  }

  // Cursor hover states on interactive elements
  const interactiveEls = document.querySelectorAll(".interactive");
  interactiveEls.forEach((el) => {
    el.addEventListener("pointerenter", () => {
      gsap.to(cursorOuter, { scale: 1.7, duration: 0.2, ease: "power3.out" });
      gsap.to(cursorInner, { scale: 0.7, duration: 0.2, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(cursorOuter, { scale: 1, duration: 0.3, ease: "power3.out" });
      gsap.to(cursorInner, { scale: 1.5, duration: 0.3, ease: "power3.out" });
    });
  });
}

function setupMagneticElements() {
  if (!gsap) return;

  const magnetics = document.querySelectorAll(".magnetic");

  magnetics.forEach((el) => {
    const strength = parseFloat(el.dataset.magnetStrength || "0.35");
    const bounds = () => el.getBoundingClientRect();

    function handleMove(e) {
      const rect = bounds();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.4,
        ease: "power3.out",
      });
    }

    function reset() {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
    }

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", reset);
  });
}

function setupMagnetic3DTilt() {
  if (!gsap) return;

  const tiltEls = document.querySelectorAll(".magnetic-3d");

  tiltEls.forEach((card) => {
    const bounds = () => card.getBoundingClientRect();

    function handleMove(e) {
      const rect = bounds();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;

      const rotateY = ((relX - midX) / midX) * 10;
      const rotateX = -((relY - midY) / midY) * 10;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformOrigin: "center center",
        boxShadow:
          "0 25px 60px rgba(15,23,42,0.7), 0 0 40px rgba(79,209,255,0.45)",
        duration: 0.3,
        ease: "power3.out",
      });
    }

    function reset() {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        boxShadow: "0 10px 30px rgba(15,23,42,0.6)",
        duration: 0.6,
        ease: "elastic.out(1,0.4)",
      });
    }

    card.addEventListener("pointermove", handleMove);
    card.addEventListener("pointerleave", reset);
  });
}

function setupLiquidButtons() {
  if (!gsap) return;

  const buttons = document.querySelectorAll(".neon-button");

  buttons.forEach((btn) => {
    btn.style.overflow = "hidden";
    const highlight = document.createElement("div");
    highlight.className =
      "pointer-events-none absolute inset-0 bg-gradient-to-r from-neonBlue/40 via-neonPink/40 to-neonPurple/40 opacity-0";
    btn.style.position = "relative";
    btn.appendChild(highlight);

    btn.addEventListener("pointerenter", () => {
      gsap.to(highlight, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.fromTo(
          highlight,
          { x: "-120%" },
          { x: "120%", duration: 0.8, ease: "power2.out" }
      );
      gsap.to(btn, {
        scaleX: 1.05,
        scaleY: 0.96,
        borderRadius: "999px",
        duration: 0.25,
        ease: "power2.out",
      });
    });

    btn.addEventListener("pointerleave", () => {
      gsap.to(highlight, { opacity: 0, duration: 0.4, ease: "power2.out" });
      gsap.to(btn, {
        scaleX: 1,
        scaleY: 1,
        borderRadius: "999px",
        duration: 0.45,
        ease: "elastic.out(1,0.4)",
      });
    });
  });
}

function setupScrollAnimations() {
  if (!gsap || !window.ScrollTrigger) return;
  const ScrollTrigger = window.ScrollTrigger;

  // Timeline cards
  const timelineCards = document.querySelectorAll(".timeline-card");
  timelineCards.forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
      },
      y: 80,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  });

  // Awesome cards
  const awesomeCards = document.querySelectorAll(".awesome-card");
  gsap.from(awesomeCards, {
    scrollTrigger: {
      trigger: "#awesome",
      start: "top 80%",
    },
    y: 60,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
  });

  // Memory tiles
  const memoryTiles = document.querySelectorAll(".memory-tile");
  memoryTiles.forEach((tile) => {
    gsap.from(tile, {
      scrollTrigger: {
        trigger: tile,
        start: "top 85%",
      },
      y: 60,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
    });
  });

  // Achievements progress
  const bars = document.querySelectorAll(".progress-bar");
  bars.forEach((bar, idx) => {
    const targetWidth = idx === 0 ? "92%" : "100%";
    gsap.to(bar, {
      scrollTrigger: {
        trigger: bar.parentElement,
        start: "top 80%",
      },
      width: targetWidth,
      duration: 1.4,
      ease: "power3.out",
    });
  });
}

function setupMessageTyping() {
  const el = document.getElementById("message-typing");
  if (!el || !gsap) return;

  const text =
    "Aran, sadece dogum gnn kutlu olsun demek istemedim; sana senin gibi hissettiren kk bir evren hazrlamak istedim: l l, zeki, biraz dank ama batan sona umut dolu. Kefetmeye, retmeye devam et ve bil ki hangi yola girersen gir, her zaman kalbimin en n srasnda seni destekliyorum.";

  gsap.fromTo(
    { progress: 0 },
    { progress: 1, duration: 14, ease: "none" },
    {
      scrollTrigger: {
        trigger: "#message",
        start: "top 75%",
        once: true,
      },
      onUpdate: function () {
        const p = this.targets()[0].progress;
        const count = Math.floor(text.length * p);
        el.textContent = text.slice(0, count) + (count < text.length ? "_" : "");
      },
    }
  );
}

function setupMemoryParallax() {
  if (!gsap) return;
  const tiles = document.querySelectorAll(".memory-tile");

  tiles.forEach((tile) => {
    tile.addEventListener("pointermove", (e) => {
      const rect = tile.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const dx = (relX / rect.width - 0.5) * 12;
      const dy = (relY / rect.height - 0.5) * 12;
      gsap.to(tile, {
        x: dx,
        y: dy,
        scale: 1.03,
        boxShadow:
          "0 30px 80px rgba(15,23,42,0.8), 0 0 40px rgba(168,85,247,0.7)",
        duration: 0.3,
        ease: "power3.out",
      });
    });

    tile.addEventListener("pointerleave", () => {
      gsap.to(tile, {
        x: 0,
        y: 0,
        scale: 1,
        boxShadow: "0 20px 60px rgba(15,23,42,0.7)",
        duration: 0.5,
        ease: "power3.out",
      });
    });
  });
}

function setupFunFacts() {
  if (!gsap) return;

  const funSection = document.getElementById("fun-facts");
  const funCards = document.querySelectorAll(".fun-card");

  funCards.forEach((card) => {
    const inner = card.querySelector(".flip-inner");
    if (!inner) return;
    card.style.perspective = "1000px";
    inner.style.transformStyle = "preserve-3d";

    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = -relY * 14;
      const tiltY = relX * 14;
      gsap.to(inner, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.3,
        ease: "power3.out",
      });
    });

    card.addEventListener("pointerleave", () => {
      gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
    });
  });

  // Cursor trail becomes colorful inside fun-facts section
  if (funSection) {
    const trailContainer = document.getElementById("cursor-trail");
    funSection.addEventListener("pointerenter", () => {
      if (!trailContainer) return;
      Array.from(trailContainer.children).forEach((dot, idx) => {
        const hue = (idx / trailContainer.children.length) * 360;
        dot.style.backgroundColor = `hsl(${hue} 90% 60%)`;
      });
    });
    funSection.addEventListener("pointerleave", () => {
      if (!trailContainer) return;
      Array.from(trailContainer.children).forEach((dot) => {
        dot.style.backgroundColor = "rgba(34,211,238,0.7)";
      });
    });
  }
}

function setupVault() {
  if (!gsap || !window.THREE) return;

  const lock = document.getElementById("vault-lock");
  const shards = document.querySelectorAll(".vault-shard");
  const unlockedPanel = document.getElementById("vault-unlocked");
  const giftContainer = document.getElementById("vault-gift-3d");

  if (!lock || !unlockedPanel || !giftContainer) return;

  let collected = 0;
  const required = 1; // make unlocking much easier – only one shard needs to be clicked

  shards.forEach((shard) => {
    shard.addEventListener("click", () => {
      const lockRect = lock.getBoundingClientRect();
      const target = {
        x: lockRect.left + lockRect.width / 2 - shard.offsetWidth / 2,
        y: lockRect.top + lockRect.height / 2 - shard.offsetHeight / 2,
      };
      gsap.to(shard, {
        x: target.x - shard.getBoundingClientRect().left,
        y: target.y - shard.getBoundingClientRect().top,
        scale: 0.7,
        boxShadow: "0 0 40px rgba(251,113,133,0.9)",
        duration: 0.6,
        ease: "power3.out",
        onComplete: () => {
          if (!shard.dataset.collected) {
            shard.dataset.collected = "true";
            collected++;
            if (collected >= required) {
              unlockVault(lock, unlockedPanel, giftContainer);
            }
          }
        },
      });
    });
  });
}

function unlockVault(lock, panel, giftContainer) {
  const gsapLocal = gsap;
  if (!gsapLocal || !window.lottie) return;

  gsapLocal.to(lock, {
    scale: 1.2,
    boxShadow: "0 0 80px rgba(251,113,133,0.9)",
    duration: 0.4,
    ease: "power2.out",
  });

  gsapLocal.to("#hero-confetti", {
    opacity: 1,
    duration: 0.1,
    onStart: () => {
      window.lottie.loadAnimation({
        container: document.getElementById("hero-confetti"),
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "https://assets2.lottiefiles.com/packages/lf20_xlkxtmul.json",
      });
    },
  });

  panel.classList.remove("hidden");
  gsapLocal.fromTo(
    panel,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
  );

  // Simple 3D rotating gift using Three.js
  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const size = giftContainer.clientWidth;
  renderer.setSize(size, size);
  giftContainer.innerHTML = "";
  giftContainer.appendChild(renderer.domElement);

  camera.position.z = 4;

  const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfb37ff,
    emissive: 0x4fd1ff,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.25,
  });
  const cube = new THREE.Mesh(geo, mat);
  scene.add(cube);

  const light = new THREE.PointLight(0xffffff, 1.2, 10);
  light.position.set(2, 3, 4);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.015;
    renderer.render(scene, camera);
  }
  animate();
}

function setupMiniGame() {
  if (!gsap) return;

  const area = document.getElementById("game-area");
  const scoreEl = document.getElementById("game-score");
  if (!area || !scoreEl) return;

  let score = 0;
  const stars = new Set();
  const hazards = new Set();

  function spawnStar() {
    const star = document.createElement("div");
    star.className =
      "absolute w-4 h-4 rounded-full bg-neonCyan shadow-[0_0_18px_rgba(34,211,238,0.9)]";
    area.appendChild(star);
    const rect = area.getBoundingClientRect();
    const x = Math.random() * (rect.width - 16);
    const y = Math.random() * (rect.height - 16);
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    stars.add(star);

    gsap.to(star, {
      y: "-=40",
      yoyo: true,
      repeat: -1,
      duration: 1.2,
      ease: "sine.inOut",
    });

    setTimeout(() => {
      if (stars.has(star)) {
        star.remove();
        stars.delete(star);
      }
    }, 7000);
  }

  function spawnHazard() {
    const h = document.createElement("div");
    h.className = "absolute w-4 h-4 rounded-full bg-red-500 shadow-[0_0_18px_rgba(248,113,113,0.9)]";
    area.appendChild(h);
    const rect = area.getBoundingClientRect();
    const x = Math.random() * (rect.width - 16);
    const y = Math.random() * (rect.height - 16);
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    hazards.add(h);

    gsap.to(h, {
      x: `+=${(Math.random() - 0.5) * 80}`,
      y: `+=${(Math.random() - 0.5) * 80}`,
      repeat: -1,
      yoyo: true,
      duration: 1.4,
      ease: "sine.inOut",
    });
  }

  let pointer = { x: 0, y: 0 };
  area.addEventListener("pointermove", (e) => {
    const rect = area.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });

  function checkCollisions() {
    const rect = area.getBoundingClientRect();
    stars.forEach((star) => {
      const sRect = star.getBoundingClientRect();
      const sx = sRect.left - rect.left + sRect.width / 2;
      const sy = sRect.top - rect.top + sRect.height / 2;
      const dist = Math.hypot(pointer.x - sx, pointer.y - sy);
      if (dist < 24) {
        stars.delete(star);
        star.remove();
        score += 10;
        scoreEl.textContent = String(score);
        gsap.fromTo(
          area,
          { boxShadow: "0 0 0 rgba(34,197,94,0.0)" },
          { boxShadow: "0 0 40px rgba(34,197,94,0.7)", duration: 0.3, yoyo: true, repeat: 1 }
        );
      }
    });

    hazards.forEach((h) => {
      const hRect = h.getBoundingClientRect();
      const hx = hRect.left - rect.left + hRect.width / 2;
      const hy = hRect.top - rect.top + hRect.height / 2;
      const dist = Math.hypot(pointer.x - hx, pointer.y - hy);
      if (dist < 26) {
        score = Math.max(0, score - 15);
        scoreEl.textContent = String(score);
        gsap.fromTo(
          area,
          { boxShadow: "0 0 0 rgba(248,113,113,0.0)" },
          { boxShadow: "0 0 45px rgba(248,113,113,0.85)", duration: 0.25, yoyo: true, repeat: 1 }
        );
      }
    });

    requestAnimationFrame(checkCollisions);
  }

  setInterval(spawnStar, 1200);
  setInterval(spawnHazard, 2600);
  requestAnimationFrame(checkCollisions);
}

function setupGiftBox() {
  if (!gsap) return;
  const box = document.getElementById("gift-box");
  const message = document.getElementById("gift-message");
  if (!box || !message) return;

  let hoverTimeout;

  box.addEventListener("pointerenter", () => {
    gsap.to(box, {
      scale: 1.05,
      boxShadow: "0 30px 80px rgba(168,85,247,0.9)",
      duration: 0.4,
      ease: "power3.out",
    });
    hoverTimeout = setTimeout(() => {
      gsap.to(box, {
        rotateX: 15,
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.to(message, { opacity: 1, duration: 0.8, ease: "power3.out" });
    }, 1200);
  });

  box.addEventListener("pointerleave", () => {
    clearTimeout(hoverTimeout);
    gsap.to(box, {
      scale: 1,
      rotateX: 0,
      boxShadow: "0 20px 60px rgba(15,23,42,0.75)",
      duration: 0.6,
      ease: "elastic.out(1,0.4)",
    });
  });
}

function setupFooterBlobs() {
  if (!gsap) return;

  const container = document.getElementById("footer-blobs");
  if (!container) return;

  for (let i = 0; i < 4; i++) {
    const blob = document.createElement("div");
    blob.className =
      "absolute w-40 h-40 rounded-full bg-gradient-to-br from-neonBlue/30 via-neonPurple/30 to-neonPink/30 blur-3xl opacity-60";
    container.appendChild(blob);
    const x = Math.random() * 80;
    const y = 20 + Math.random() * 40;
    gsap.set(blob, { left: `${x}%`, top: `${y}%` });
    gsap.to(blob, {
      x: "+=80",
      y: "-=20",
      repeat: -1,
      yoyo: true,
      duration: 12 + Math.random() * 6,
      ease: "sine.inOut",
    });
  }

  window.addEventListener("pointermove", (e) => {
    const rect = container.getBoundingClientRect();
    Array.from(container.children).forEach((blob) => {
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - bx, e.clientY - by);
      const scale = gsap.utils.clamp(0.8, 1.4, 1.4 - dist / 800);
      gsap.to(blob, { scale, duration: 0.6, ease: "sine.out" });
    });
  });
}

function setupIntroAnimation() {
  if (!gsap) return;

  const overlay = document.getElementById("intro-overlay");
  if (!overlay) return;

  const title = overlay.querySelector(".intro-title");
  const subtitle = overlay.querySelector(".intro-subtitle");

  gsap.set([title, subtitle], { opacity: 0, y: 20 });

  gsap
    .timeline()
    .to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" })
    .to(title, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
    .to(
      subtitle,
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      "-=0.3"
    )
    .to(overlay, {
      opacity: 0,
      duration: 0.8,
      delay: 0.8,
      ease: "power2.inOut",
      onComplete: () => overlay.remove(),
    });
}

function setupHero() {
  if (!gsap) return;

  const hero = document.getElementById("hero");
  if (!hero) return;

  gsap.from(hero.querySelector(".glass-panel"), {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  });

  const buttons = hero.querySelectorAll(".hero-cta");
  gsap.from(buttons, {
    y: 20,
    opacity: 0,
    stagger: 0.1,
    delay: 0.2,
    duration: 0.6,
    ease: "power3.out",
  });

  const scrollToSection = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return;

    if (window._lenis && typeof window._lenis.scrollTo === "function") {
      window._lenis.scrollTo(selector, { offset: -80 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [startBtn, memoriesBtn, vaultBtn] = buttons;

  if (startBtn) {
    startBtn.addEventListener("click", () => scrollToSection("#timeline"));
  }
  if (memoriesBtn) {
    memoriesBtn.addEventListener("click", () => scrollToSection("#memories"));
  }
  if (vaultBtn) {
    vaultBtn.addEventListener("click", () => scrollToSection("#gift"));
  }

  if (window.lottie) {
    window.lottie.loadAnimation({
      container: document.getElementById("hero-confetti"),
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "https://assets2.lottiefiles.com/packages/lf20_xlkxtmul.json",
    });
  }
}

function setupThreeBackground() {
  if (!window.THREE) return;
  const THREE = window.THREE;

  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.z = 6;

  const particlesGeom = new THREE.BufferGeometry();
  const count = 800;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 16;
  }
  particlesGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particlesMat = new THREE.PointsMaterial({
    color: 0x4fd1ff,
    size: 0.07,
    transparent: true,
    opacity: 0.7,
  });

  const points = new THREE.Points(particlesGeom, particlesMat);
  scene.add(points);

  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.7;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.7;
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.0009;
    points.rotation.x += 0.0004;
    points.rotation.y += mouseX * 0.0012;
    points.rotation.x += -mouseY * 0.0012;
    renderer.render(scene, camera);
  }
  animate();
}

function init() {
  setupSmoothScroll();
  setupCursorSystem();
  setupMagneticElements();
  setupMagnetic3DTilt();
  setupLiquidButtons();
  setupScrollAnimations();
  setupMessageTyping();
  setupMemoryParallax();
  setupFunFacts();
  setupVault();
  setupMiniGame();
  setupGiftBox();
  setupFooterBlobs();
  setupIntroAnimation();
  setupHero();
  setupThreeBackground();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
