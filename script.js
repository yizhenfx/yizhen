const downloadLinks = document.querySelectorAll('a[href$=".exe"]');
const scrollMeter = document.querySelector(".scroll-meter");
const demoModal = document.querySelector("#pluginDemo");
const openDemoButtons = document.querySelectorAll("[data-open-demo]");
const closeDemoButtons = document.querySelectorAll("[data-close-demo]");
const demoSearch = document.querySelector("#demoSearch");
let clipCount = 0;

downloadLinks.forEach((link) => {
  link.addEventListener("click", () => {
    link.dataset.originalText = link.dataset.originalText || link.textContent;
    link.textContent = "正在准备下载...";
    window.setTimeout(() => {
      link.textContent = link.dataset.originalText;
    }, 1600);
  });
});

window.addEventListener("scroll", () => {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / max));
  scrollMeter.style.width = `${progress * 100}%`;
});

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

function openDemo() {
  if (!demoModal) return;
  demoModal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => demoSearch?.focus(), 80);
}

function closeDemo() {
  if (!demoModal) return;
  demoModal.hidden = true;
  document.body.style.overflow = "";
}

openDemoButtons.forEach((button) => {
  button.addEventListener("click", openDemo);
});

closeDemoButtons.forEach((button) => {
  button.addEventListener("click", closeDemo);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && demoModal && !demoModal.hidden) {
    closeDemo();
  }
});

document.querySelectorAll(".js-add-clip").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".sound-card");
    const name = card?.dataset.name || card?.querySelector("h4")?.textContent || "音效";
    const tracks = [...document.querySelectorAll(".edit-track")];
    if (!tracks.length) return;

    const track = tracks[clipCount % tracks.length];
    const clip = document.createElement("span");
    const width = 18 + ((clipCount * 7) % 18);
    const left = 9 + ((clipCount * 17) % Math.max(18, 82 - width));
    clip.className = "clip";
    clip.textContent = name;
    clip.style.setProperty("--left", `${left}%`);
    clip.style.setProperty("--width", `${width}%`);
    track.appendChild(clip);

    clipCount += 1;
    button.textContent = "已添加";
    window.setTimeout(() => {
      button.textContent = "添加到时间线";
    }, 900);
  });
});

if (demoSearch) {
  demoSearch.addEventListener("input", () => {
    const keyword = demoSearch.value.trim().toLowerCase();
    document.querySelectorAll(".demo-sounds .sound-card").forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = !keyword || text.includes(keyword) ? "" : "none";
    });
  });
}
