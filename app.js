const API_BASE = "https://vidapi.ru";
const PLAYER_BASE = "https://vaplayer.ru";
const DEFAULT_LANG = "az";

const i18n = {
  az: {
    "nav.home": "Ana səhifə", "nav.movies": "Filmlər", "nav.series": "Seriallar", "nav.episodes": "Yeni Bölümlər",
    "search.placeholder": "Film və serial axtar...",
    "hero.title": "IMDb ilə sinxron gündəlik yenilənən top filmlər",
    "hero.subtitle": "Cinema Az Netflix tərzində interfeyslə ən yeni filmləri, serialları və epizodları göstərir.",
    "sections.topMovies": "Ən Populyar Yeni Filmlər", "sections.movies": "Yeni Filmlər", "sections.series": "Yeni Seriallar", "sections.episodes": "Yeni Bölümlər",
    "sections.desc.home": "IMDb/VidAPI feed-i ilə gündəlik yenilənir.", "sections.desc.movies": "Son əlavə olunan filmlər.", "sections.desc.series": "Son əlavə olunan seriallar.", "sections.desc.episodes": "Ən son əlavə olunan serial bölümləri.",
    "card.watch": "İzləmək", "player.close": "Bağla", "misc.noResults": "Nəticə tapılmadı.",
  },
  tr: {
    "nav.home": "Ana Sayfa", "nav.movies": "Filmler", "nav.series": "Diziler", "nav.episodes": "Yeni Bölümler",
    "search.placeholder": "Film ve dizi ara...", "hero.title": "IMDb ile senkron günlük güncellenen hit filmler", "hero.subtitle": "Cinema Az, Netflix benzeri arayüzle en yeni içerikleri gösterir.",
    "sections.topMovies": "En Popüler Yeni Filmler", "sections.movies": "Yeni Filmler", "sections.series": "Yeni Diziler", "sections.episodes": "Yeni Bölümler",
    "sections.desc.home": "IMDb/VidAPI akışıyla günlük güncellenir.", "sections.desc.movies": "Son eklenen filmler.", "sections.desc.series": "Son eklenen diziler.", "sections.desc.episodes": "Son eklenen bölüm listesi.",
    "card.watch": "İzle", "player.close": "Kapat", "misc.noResults": "Sonuç bulunamadı.",
  },
  en: {
    "nav.home": "Home", "nav.movies": "Movies", "nav.series": "Series", "nav.episodes": "New Episodes",
    "search.placeholder": "Search movies and series...", "hero.title": "Daily-updated top movies synced with IMDb", "hero.subtitle": "Cinema Az uses a Netflix-style layout for fresh movies, series, and episodes.",
    "sections.topMovies": "Top New Hit Movies", "sections.movies": "Latest Movies", "sections.series": "Latest Series", "sections.episodes": "Latest Episodes",
    "sections.desc.home": "Updates daily from IMDb/VidAPI feeds.", "sections.desc.movies": "Most recently added movies.", "sections.desc.series": "Most recently added series.", "sections.desc.episodes": "Most recently added episodes.",
    "card.watch": "Watch", "player.close": "Close", "misc.noResults": "No results found.",
  },
  ru: {
    "nav.home": "Главная", "nav.movies": "Фильмы", "nav.series": "Сериалы", "nav.episodes": "Новые серии",
    "search.placeholder": "Поиск фильмов и сериалов...", "hero.title": "Топ-фильмы с ежедневным обновлением через IMDb", "hero.subtitle": "Cinema Az в стиле Netflix показывает свежие фильмы, сериалы и эпизоды.",
    "sections.topMovies": "Популярные Новые Фильмы", "sections.movies": "Новые Фильмы", "sections.series": "Новые Сериалы", "sections.episodes": "Новые Эпизоды",
    "sections.desc.home": "Ежедневное обновление из IMDb/VidAPI.", "sections.desc.movies": "Последние добавленные фильмы.", "sections.desc.series": "Последние добавленные сериалы.", "sections.desc.episodes": "Последние добавленные эпизоды.",
    "card.watch": "Смотреть", "player.close": "Закрыть", "misc.noResults": "Ничего не найдено.",
  }
};

let state = { page: "home", lang: localStorage.getItem("lang") || DEFAULT_LANG, items: [] };

const els = {
  catalog: document.getElementById("catalog"),
  template: document.getElementById("cardTemplate"),
  navButtons: [...document.querySelectorAll(".nav-btn")],
  search: document.getElementById("searchInput"),
  language: document.getElementById("languageSelect"),
  sectionTitle: document.getElementById("sectionTitle"),
  sectionDescription: document.getElementById("sectionDescription"),
  playerSection: document.getElementById("playerSection"),
  playerFrame: document.getElementById("playerFrame"),
  playerTitle: document.getElementById("playerTitle"),
  closePlayer: document.getElementById("closePlayer"),
};

function t(key) { return i18n[state.lang]?.[key] || i18n.az[key] || key; }
function applyI18n() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => node.textContent = t(node.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => node.placeholder = t(node.dataset.i18nPlaceholder));
}

function endpointForPage(page) {
  if (page === "movies") return `${API_BASE}/movies/latest/page-1.json`;
  if (page === "series") return `${API_BASE}/tvshows/latest/page-1.json`;
  if (page === "episodes") return `${API_BASE}/episodes/latest/page-1.json`;
  return `${API_BASE}/movies/latest/page-1.json`;
}

async function loadPage(page = state.page) {
  const res = await fetch(endpointForPage(page));
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  state.items = (data.items || []).sort((a, b) => (b.year || b.air_date || "").localeCompare(a.year || a.air_date || ""));
  render();
}

function render() {
  const q = els.search.value.trim().toLowerCase();
  const filtered = state.items.filter((item) => {
    const title = (item.title || item.show_title || item.episode_title || "").toLowerCase();
    return !q || title.includes(q);
  });

  els.catalog.innerHTML = "";
  if (filtered.length === 0) {
    els.catalog.innerHTML = `<p>${t("misc.noResults")}</p>`;
    return;
  }

  filtered.forEach((item) => {
    const clone = els.template.content.cloneNode(true);
    const title = item.title || item.show_title || item.episode_title;
    clone.querySelector(".poster").src = item.poster_url || "https://placehold.co/400x600?text=Cinema+Az";
    clone.querySelector(".poster").alt = title;
    clone.querySelector(".title").textContent = title;
    clone.querySelector(".details").textContent = [item.year || item.air_date, item.rating ? `⭐ ${item.rating}` : ""].filter(Boolean).join(" · ");
    clone.querySelector(".tags").textContent = item.genre || item.type || "";
    const button = clone.querySelector(".play-btn");
    button.textContent = t("card.watch");
    button.addEventListener("click", () => openPlayer(item));
    els.catalog.appendChild(clone);
  });
}

function openPlayer(item) {
  const imdb = item.imdb_id || item.show_imdb_id;
  const tmdb = item.tmdb_id || item.show_tmdb_id;
  let src = item.embed_url;

  if (!src) {
    if (item.type === "episode") src = `${PLAYER_BASE}/embed/tv/${imdb || tmdb}/${item.season_number}/${item.episode_number}`;
    else if (item.type === "tv") src = `${PLAYER_BASE}/embed/tv/${imdb || tmdb}/1/1`;
    else src = `${PLAYER_BASE}/embed/movie/${imdb || tmdb}`;
  }

  const url = new URL(src);
  url.searchParams.set("primaryColor", "#e50914");
  url.searchParams.set("lang", state.lang);

  const title = item.title || item.show_title || item.episode_title;
  els.playerTitle.textContent = title;
  els.playerFrame.src = url.toString();
  els.playerSection.classList.remove("hidden");
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function updateSectionText() {
  const map = {
    home: ["sections.topMovies", "sections.desc.home"],
    movies: ["sections.movies", "sections.desc.movies"],
    series: ["sections.series", "sections.desc.series"],
    episodes: ["sections.episodes", "sections.desc.episodes"],
  };
  const [titleKey, descKey] = map[state.page];
  els.sectionTitle.textContent = t(titleKey);
  els.sectionDescription.textContent = t(descKey);
}

els.navButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    state.page = button.dataset.page;
    els.navButtons.forEach((b) => b.classList.toggle("active", b === button));
    updateSectionText();
    await loadPage(state.page);
  });
});

els.search.addEventListener("input", () => render());
els.language.value = state.lang;
els.language.addEventListener("change", () => {
  state.lang = els.language.value;
  localStorage.setItem("lang", state.lang);
  applyI18n();
  updateSectionText();
  render();
});
els.closePlayer.addEventListener("click", () => {
  els.playerFrame.src = "";
  els.playerSection.classList.add("hidden");
});

setInterval(() => loadPage(state.page).catch(console.error), 1000 * 60 * 10);

applyI18n();
updateSectionText();
loadPage().catch((e) => {
  els.catalog.innerHTML = `<p>API unavailable: ${e.message}</p>`;
});
