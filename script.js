const downloadLinks = document.querySelectorAll('a[href$=".exe"]');
const scrollMeter = document.querySelector(".scroll-meter");
const demoModal = document.querySelector("#pluginDemo");
const openDemoButtons = document.querySelectorAll("[data-open-demo]");
const closeDemoButtons = document.querySelectorAll("[data-close-demo]");
const demoSearch = document.querySelector("#demoSearch");
const demoFeedback = document.querySelector("#demoFeedback");
const demoCount = document.querySelector("#demoCount");
const demoSort = document.querySelector("#demoSort");
const demoEmpty = document.querySelector(".demo-empty");
let clipCount = 0;
let activeFilter = "all";
let activeType = "regular";
let activeView = "all";
let previewEnabled = true;

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

function setFeedback(message) {
  if (!demoFeedback) return;
  demoFeedback.textContent = message;
  demoFeedback.classList.add("is-hot");
  window.clearTimeout(setFeedback.timer);
  setFeedback.timer = window.setTimeout(() => {
    demoFeedback.classList.remove("is-hot");
  }, 900);
}

function getDemoCards() {
  return [...document.querySelectorAll(".demo-sounds .sound-card")];
}

function matchesCard(card) {
  const keyword = demoSearch?.value.trim().toLowerCase() || "";
  const text = card.textContent.toLowerCase();
  const tags = card.dataset.tags || "";
  const typeMatch = activeType === "all" || card.dataset.type === activeType;
  const filterMatch = activeFilter === "all" || tags.includes(activeFilter);
  const viewMatch =
    activeView === "all" ||
    (activeView === "favorites" && card.dataset.favorite === "true") ||
    (activeView === "mine" && card.dataset.mine === "true");
  const searchMatch = !keyword || text.includes(keyword);
  return typeMatch && filterMatch && viewMatch && searchMatch;
}

function updateDemoCards() {
  let visible = 0;
  getDemoCards().forEach((card) => {
    const shown = matchesCard(card);
    card.classList.toggle("is-hidden", !shown);
    if (shown) visible += 1;
  });
  if (demoCount) {
    demoCount.textContent = `${visible} 个预设`;
  }
  if (demoEmpty) {
    demoEmpty.hidden = visible !== 0;
  }
  if (visible === 0) {
    setFeedback("当前筛选没有结果，可以切回全部标签");
  }
}

function setActiveInGroup(selector, activeElement) {
  document.querySelectorAll(selector).forEach((item) => {
    item.classList.toggle("active", item === activeElement);
  });
}

function addClipFromCard(card) {
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
  setFeedback(`${name} 已添加到模拟时间线`);
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
    addClipFromCard(card);
    button.textContent = "已添加";
    window.setTimeout(() => {
      button.textContent = "添加到时间线";
    }, 900);
  });
});

if (demoSearch) {
  demoSearch.addEventListener("input", () => {
    activeView = "all";
    updateDemoCards();
    setFeedback("搜索结果已更新");
  });
}

document.querySelectorAll("[data-demo-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.demoFilter || "all";
    activeView = "all";
    setActiveInGroup("[data-demo-filter]", button);
    updateDemoCards();
    setFeedback(activeFilter === "all" ? "已显示全部标签" : `已筛选：${activeFilter}`);
  });
});

document.querySelectorAll("[data-demo-type]").forEach((button) => {
  button.addEventListener("click", () => {
    activeType = button.dataset.demoType || "regular";
    setActiveInGroup("[data-demo-type]", button);
    updateDemoCards();
    setFeedback(activeType === "project" ? "已切换到工程音效" : "已切换到常规音效");
  });
});

document.querySelectorAll("[data-demo-view]").forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.demoView || "all";
    document.querySelectorAll(".plugin-sidebar button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateDemoCards();
    setFeedback(activeView === "favorites" ? "已打开收藏夹" : "已打开我的音效");
  });
});

document.querySelectorAll("[data-demo-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    if (demoSort) demoSort.value = "recent";
    setFeedback("已按最近使用排序");
  });
});

if (demoSort) {
  demoSort.addEventListener("change", () => {
    const grid = document.querySelector(".demo-sounds");
    const cards = getDemoCards();
    if (!grid) return;
    if (demoSort.value === "name") {
      cards.sort((a, b) => (a.dataset.name || "").localeCompare(b.dataset.name || "", "zh-Hans-CN"));
      cards.forEach((card) => grid.appendChild(card));
      setFeedback("已按名称排序");
    } else if (demoSort.value === "recent") {
      cards.reverse().forEach((card) => grid.appendChild(card));
      setFeedback("已按最近使用排序");
    } else {
      setFeedback("已恢复推荐排序");
    }
    updateDemoCards();
  });
}

document.querySelectorAll(".demo-sounds .star").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".sound-card");
    const next = card.dataset.favorite !== "true";
    card.dataset.favorite = String(next);
    button.classList.toggle("active", next);
    button.textContent = next ? "★" : "☆";
    setFeedback(`${card.dataset.name} ${next ? "已加入收藏" : "已取消收藏"}`);
    if (activeView === "favorites") updateDemoCards();
  });
});

document.querySelectorAll(".demo-sounds .sound-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    if (!previewEnabled) return;
    card.classList.add("is-previewing");
    setFeedback(`正在试听：${card.dataset.name}`);
  });
  card.addEventListener("mouseleave", () => {
    card.classList.remove("is-previewing");
  });
});

document.querySelector("[data-toggle-preview]")?.addEventListener("click", (event) => {
  previewEnabled = !previewEnabled;
  event.currentTarget.classList.toggle("active", previewEnabled);
  event.currentTarget.textContent = previewEnabled ? "启用试听" : "关闭试听";
  document.querySelectorAll(".sound-card").forEach((card) => card.classList.remove("is-previewing"));
  setFeedback(previewEnabled ? "悬停试听已开启" : "悬停试听已关闭");
});

document.querySelector("[data-clear-timeline]")?.addEventListener("click", () => {
  document.querySelectorAll(".clip").forEach((clip) => clip.remove());
  clipCount = 0;
  setFeedback("模拟时间线已清空");
});

document.querySelector("[data-demo-random]")?.addEventListener("click", () => {
  const visible = getDemoCards().filter((card) => !card.classList.contains("is-hidden"));
  const pick = visible[Math.floor(Math.random() * visible.length)] || getDemoCards()[0];
  addClipFromCard(pick);
});

updateDemoCards();
