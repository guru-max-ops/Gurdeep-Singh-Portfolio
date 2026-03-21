const storageKey = "gurdeep-portfolio-profile";

const defaultProfile = {
  headline: "Software Engineer building AI-enhanced products",
  bio: "Focused on shipping practical product experiences using Generative AI, AI apps, and strong engineering habits.",
  email: "",
  location: "",
  availability: "",
  github: "",
  linkedin: "",
  focus: "Building AI-powered products",
  role: "AI Generalist",
};

const profileFields = document.querySelectorAll("[data-profile]");
const settingsPanel = document.getElementById("settingsPanel");
const settingsForm = document.getElementById("settingsForm");
const settingsToggle = document.querySelector(".settings-toggle");
const settingsClose = document.querySelector(".settings-close");
const resetProfileButton = document.getElementById("resetProfile");
const openSettingsButtons = document.querySelectorAll("[data-open-settings]");

let profile = loadProfile();

applyProfile(profile);
hydrateForm(profile);
setupSettingsPanel();
setupRevealAnimations();
setupMatrixRain();

function loadProfile() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : { ...defaultProfile };
  } catch (error) {
    return { ...defaultProfile };
  }
}

function saveProfile(nextProfile) {
  profile = nextProfile;
  localStorage.setItem(storageKey, JSON.stringify(profile));
  applyProfile(profile);
}

function applyProfile(nextProfile) {
  profileFields.forEach((field) => {
    const key = field.dataset.profile;
    const value = (nextProfile[key] || "").trim();
    const fallback = field.dataset.fallback || defaultProfile[key] || "";

    if (field.tagName === "A") {
      field.textContent = value || fallback;
      field.target = value ? "_blank" : "_self";
      field.rel = value ? "noreferrer" : "";
      field.href =
        value && field.dataset.linkType === "email"
          ? `mailto:${value}`
          : value || "#";
      field.classList.toggle("is-empty", !value);
      return;
    }

    field.textContent = value || fallback;
    field.classList.toggle("is-empty", !value);
  });
}

function hydrateForm(nextProfile) {
  const entries = Object.entries(nextProfile);
  entries.forEach(([key, value]) => {
    const input = settingsForm.elements.namedItem(key);
    if (input) {
      input.value = value;
    }
  });
}

function setupSettingsPanel() {
  const openPanel = () => {
    document.body.classList.add("settings-open");
    settingsPanel.classList.add("open");
    settingsPanel.setAttribute("aria-hidden", "false");
    settingsToggle.setAttribute("aria-expanded", "true");
  };

  const closePanel = () => {
    document.body.classList.remove("settings-open");
    settingsPanel.classList.remove("open");
    settingsPanel.setAttribute("aria-hidden", "true");
    settingsToggle.setAttribute("aria-expanded", "false");
  };

  settingsToggle.addEventListener("click", openPanel);
  settingsClose.addEventListener("click", closePanel);
  openSettingsButtons.forEach((button) => button.addEventListener("click", openPanel));

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(settingsForm);
    const nextProfile = Object.fromEntries(formData.entries());
    saveProfile({ ...defaultProfile, ...nextProfile });
    closePanel();
  });

  resetProfileButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    profile = { ...defaultProfile };
    hydrateForm(profile);
    applyProfile(profile);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
    }
  });
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
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

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 90, 400)}ms`;
    observer.observe(item);
  });
}

function setupMatrixRain() {
  const canvas = document.getElementById("matrixCanvas");
  const context = canvas.getContext("2d");
  const glyphs = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ[]{}<>/*+=-:;?%$#@";
  let columns = [];
  let fontSize = 18;
  let animationFrame = 0;
  let trailLength = 4;

  const resize = () => {
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    fontSize = window.innerWidth < 768 ? 14 : 18;
    trailLength = window.innerWidth < 768 ? 3 : 4;
    columns = Array.from(
      { length: Math.ceil(window.innerWidth / fontSize) },
      () => Math.random() * -120
    );
  };

  const draw = () => {
    context.fillStyle = "rgba(2, 10, 4, 0.12)";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.font = `${fontSize}px IBM Plex Mono`;

    columns.forEach((column, index) => {
      const char = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = index * fontSize;
      const y = columns[index] * fontSize;

      for (let trailIndex = trailLength; trailIndex > 0; trailIndex -= 1) {
        const trailY = y - trailIndex * fontSize;
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
        columns[index] += 0.2;
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
      animationFrame = window.requestAnimationFrame(draw);
    }
  });
}
