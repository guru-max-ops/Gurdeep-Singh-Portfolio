const revealItems = document.querySelectorAll(".reveal");
const heroStage = document.getElementById("heroStage");
const rotatingStatus = document.querySelector("[data-rotating-status]");

const statusLines = [
  "React surfaces. Workflow logic. API-aware delivery.",
  "Websites, dashboards, and utility apps shaped inside one build system.",
  "Frontend polish with auth, RBAC, and integration discipline.",
  "Grocery ordering flow, tool interfaces, and backend edges designed together.",
  "AI-assisted execution with verification before release.",
];

setupRevealAnimations();
setupHeroStageMotion();
setupStatusRotation();
initializeMatrixRain();

function setupRevealAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const heroItems = document.querySelectorAll(".hero .reveal");
  heroItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 120}ms`;
    window.requestAnimationFrame(() => item.classList.add("visible"));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item, index) => {
    if (item.closest(".hero")) {
      return;
    }

    item.style.transitionDelay = `${Math.min((index + 1) * 70, 420)}ms`;
    observer.observe(item);
  });
}

function setupHeroStageMotion() {
  if (!heroStage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const resetStage = () => {
    heroStage.style.setProperty("--stage-rotate-x", "0deg");
    heroStage.style.setProperty("--stage-rotate-y", "0deg");
    heroStage.style.setProperty("--stage-shift-x", "0px");
    heroStage.style.setProperty("--stage-shift-y", "0px");
  };

  heroStage.addEventListener("pointermove", (event) => {
    const bounds = heroStage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    heroStage.style.setProperty("--stage-rotate-x", `${(-y * 5).toFixed(2)}deg`);
    heroStage.style.setProperty("--stage-rotate-y", `${(x * 6).toFixed(2)}deg`);
    heroStage.style.setProperty("--stage-shift-x", `${(x * 10).toFixed(2)}px`);
    heroStage.style.setProperty("--stage-shift-y", `${(y * 10).toFixed(2)}px`);
  });

  heroStage.addEventListener("pointerleave", resetStage);
}

function setupStatusRotation() {
  if (!rotatingStatus) {
    return;
  }

  let lineIndex = 0;
  rotatingStatus.textContent = statusLines[lineIndex];

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.setInterval(() => {
    lineIndex = (lineIndex + 1) % statusLines.length;
    rotatingStatus.classList.add("is-swapping");

    window.setTimeout(() => {
      rotatingStatus.textContent = statusLines[lineIndex];
      rotatingStatus.classList.remove("is-swapping");
    }, 150);
  }, 2600);
}

function initializeMatrixRain() {
  if (document.fonts?.ready) {
    document.fonts.ready.then(setupMatrixRain);
    return;
  }

  setupMatrixRain();
}

function setupMatrixRain() {
  const canvas = document.getElementById("matrixCanvas");
  const context = canvas.getContext("2d");
  const glyphs = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ[]{}<>/*+=-:;?%$#@";
  let columns = [];
  let fontSize = 18;
  let animationFrame = 0;
  let trailLength = 4;
  let lastStepTime = 0;
  const stepInterval = 36;

  const resize = () => {
    const scale = Math.max(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.imageSmoothingEnabled = false;
    context.textBaseline = "top";
    context.textAlign = "left";
    fontSize = window.innerWidth < 768 ? 14 : 18;
    trailLength = window.innerWidth < 768 ? 3 : 4;
    columns = Array.from(
      { length: Math.ceil(window.innerWidth / fontSize) },
      () => Math.random() * -120
    );
  };

  const draw = (timestamp = 0) => {
    if (timestamp - lastStepTime < stepInterval) {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }

    lastStepTime = timestamp;
    context.fillStyle = "rgba(2, 10, 4, 0.12)";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.font = `${fontSize}px "IBM Plex Mono", monospace`;

    columns.forEach((column, index) => {
      const char = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = Math.round(index * fontSize);
      const y = Math.round(columns[index] * fontSize);

      for (let trailIndex = trailLength; trailIndex > 0; trailIndex -= 1) {
        const trailY = Math.round(y - trailIndex * fontSize);
        if (trailY < -fontSize) {
          continue;
        }

        const trailChar = glyphs[Math.floor(Math.random() * glyphs.length)];
        const alpha = 0.1 + ((trailLength - trailIndex) / trailLength) * 0.18;
        context.fillStyle = `rgba(99, 255, 139, ${alpha.toFixed(2)})`;
        context.fillText(trailChar, x, trailY);
      }

      context.fillStyle = index % 5 === 0 ? "#b7ffc9" : "#63ff8b";
      context.fillText(char, x, y);

      if (y > window.innerHeight && Math.random() > 0.985) {
        columns[index] = 0;
      } else {
        columns[index] += 1;
      }
    });

    animationFrame = window.requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  animationFrame = window.requestAnimationFrame(draw);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else {
      lastStepTime = 0;
      animationFrame = window.requestAnimationFrame(draw);
    }
  });
}
