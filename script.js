/* APKZONE v6 - blur only on popup */
let games = [];
const list = document.getElementById("list");
const search = document.getElementById("search");
const overlay = document.getElementById("overlay");
const popupInstall = document.getElementById("popupInstall");
const popupVerify = document.getElementById("popupVerify");
const popupTitle = document.getElementById("popupTitle");
const popupShortDesc = document.getElementById("popupShortDesc");
const popupImg = document.getElementById("popupImg");
const popupAndroidCount = document.getElementById("popupAndroidCount");
const popupIosCount = document.getElementById("popupIosCount");
const popupInstallBtn = document.getElementById("popupInstallBtn");
const popupClose = document.getElementById("popupClose");
const verifyLoader = document.getElementById("verifyLoader");
const verifyText = document.getElementById("verifyText");
const robotStep = document.getElementById("robotStep");
const verifyBtn = document.getElementById("verifyBtn");

fetch("games.json")
  .then((r) => r.json())
  .then((d) => {
    games = d;
    render(games);
  })
  .catch((e) => console.error("games.json load failed", e));

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}
function rndRating() {
  return (Math.random() * 1 + 4).toFixed(1);
}

function render(data) {
  list.innerHTML = data
    .map(
      (g) => `
    <article class="card" data-id="${g.id}">
      <img src="${g.img}" alt="${g.title}">
      <h3>${g.title}</h3>
      <div class="meta"><div class="stars">${"★".repeat(
        5
      )} <span style="color:#aaa;font-weight:600;"> ${rndRating()}</span></div></div>
      <div class="counts">Downloads: <span class="badge">${fmt(
        g.downloads.android
      )} Android</span> <span class="badge">${fmt(
        g.downloads.ios
      )} iOS</span></div>
      <div class="choose" style="margin-top:10px">
        <span class="choose-label">Choose your device:</span>
        <button class="btn android choose-btn" data-id="${g.id}" data-platform="android">Android</button>
        <button class="btn ios choose-btn" data-id="${g.id}" data-platform="ios">iOS</button>
      </div>
    </article>
  `
    )
    .join("");

  document.querySelectorAll(".choose-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      const game = games.find((x) => x.id === id);
      if (!game) return;
      openInstallPopup(game, b.dataset.platform);
      b.animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(6px) scale(0.98)" },
          { transform: "translateY(0)" },
        ],
        { duration: 220 }
      );
    });
  });
}

function openInstallPopup(game, platform) {
  popupTitle.textContent = game.title;
  popupShortDesc.textContent = game.desc;
  popupImg.src = game.img;
  popupAndroidCount.textContent = fmt(game.downloads.android);
  popupIosCount.textContent = fmt(game.downloads.ios);
  popupInstallBtn.dataset.target = game.link;
  popupInstallBtn.dataset.platform = platform;

  overlay.classList.add("show"); // Blur only here
  popupInstall.classList.remove("hidden");
  setTimeout(() => popupInstall.classList.add("show"), 20);
}

function closeAll() {
  popupInstall.classList.remove("show");
  popupVerify.classList.remove("show");
  setTimeout(() => {
    overlay.classList.remove("show"); // Remove blur after closing
    popupInstall.classList.add("hidden");
    popupVerify.classList.add("hidden");
  }, 180);
}

popupClose.addEventListener("click", closeAll);
overlay.addEventListener("click", closeAll);

popupInstallBtn.addEventListener("click", () => {
  popupInstall.classList.remove("show");
  setTimeout(() => {
    popupInstall.classList.add("hidden");
    popupVerify.classList.remove("hidden");
    setTimeout(() => popupVerify.classList.add("show"), 20);
    verifyLoader.style.display = "block";
    verifyText.textContent = "Verifying...";
    robotStep.classList.add("hidden");
    setTimeout(() => {
      verifyLoader.style.display = "none";
      robotStep.classList.remove("hidden");
      verifyText.textContent = "";
    }, 2000);
  }, 160);
});

verifyBtn.addEventListener("click", () => {
  verifyText.textContent = "Opening verification...";
  verifyBtn.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(6px)" },
      { transform: "translateY(0)" },
    ],
    { duration: 200 }
  );
  setTimeout(() => {
    window.open(popupInstallBtn.dataset.target, "_blank");
    closeAll();
  }, 900);
});

search.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  if (!q) return render(games);
  render(
    games.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        (x.id && x.id.toLowerCase().includes(q))
    )
  );
});
