/*
    VERSEQUEST
    Bible Study Level-Up System
*/

const STORAGE_KEYS = {
    game: "verseQuestGame",
    theme: "verseQuestDarkMode"
};

const defaultGame = {
    xp: 0,
    versesRead: 0,
    streak: 0,
    lastRead: null,
    favorites: [],
    reflections: {},
    completedDates: []
};

const verses = [
    {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
    },
    {
        reference: "Psalm 23:1",
        text: "The LORD is my shepherd; I shall not want."
    },
    {
        reference: "Philippians 4:13",
        text: "I can do all things through Christ which strengtheneth me."
    },
    {
        reference: "Proverbs 3:5",
        text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding."
    },
    {
        reference: "Joshua 1:9",
        text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest."
    },
    {
        reference: "Psalm 119:105",
        text: "Thy word is a lamp unto my feet, and a light unto my path."
    },
    {
        reference: "Jeremiah 29:11",
        text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."
    }
];

function loadGameData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.game);

        if (!saved) {
            return { ...defaultGame };
        }

        const parsed = JSON.parse(saved);

        return {
            ...defaultGame,
            ...parsed,
            favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
            reflections: parsed.reflections && typeof parsed.reflections === "object" ? parsed.reflections : {},
            completedDates: Array.isArray(parsed.completedDates) ? parsed.completedDates : []
        };
    } catch (error) {
        console.warn("Failed to load saved game data:", error);
        return { ...defaultGame };
    }
}

let game = loadGameData();

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function getDayNumber() {
    const start = new Date("2026-01-01");
    const today = new Date();
    const difference = Math.floor((today - start) / 86400000);
    return Math.abs(difference);
}

function getTodayVerse() {
    return verses[getDayNumber() % verses.length];
}

function getLevel() {
    return Math.floor(game.xp / 100) + 1;
}

function getLevelName(level) {
    if (level >= 20) return "Bible Master";
    if (level >= 15) return "Scripture Scholar";
    if (level >= 10) return "Faith Leader";
    if (level >= 7) return "Dedicated Student";
    if (level >= 5) return "Growing Disciple";
    if (level >= 3) return "Faith Explorer";
    return "New Reader";
}

function saveGame() {
    localStorage.setItem(STORAGE_KEYS.game, JSON.stringify(game));
}

function updateUI() {
    const level = getLevel();
    const levelXP = game.xp % 100;
    const progress = Math.min(levelXP, 100);

    const levelNumber = document.getElementById("levelNumber");
    const levelName = document.getElementById("levelName");
    const totalXP = document.getElementById("totalXP");
    const versesRead = document.getElementById("versesRead");
    const streak = document.getElementById("streak");
    const achievementCount = document.getElementById("achievementCount");
    const xpBadge = document.getElementById("xpBadge");
    const currentLevelText = document.getElementById("currentLevelText");
    const nextLevelText = document.getElementById("nextLevelText");
    const xpProgress = document.getElementById("xpProgress");
    const bigLevel = document.getElementById("bigLevel");
    const bigLevelName = document.getElementById("bigLevelName");
    const bigXPProgress = document.getElementById("bigXPProgress");
    const bigXPText = document.getElementById("bigXPText");
    const progressXP = document.getElementById("progressXP");
    const progressVerses = document.getElementById("progressVerses");
    const progressStreak = document.getElementById("progressStreak");

    if (levelNumber) levelNumber.textContent = level;
    if (levelName) levelName.textContent = getLevelName(level);
    if (totalXP) totalXP.textContent = `${game.xp} XP`;
    if (versesRead) versesRead.textContent = game.versesRead;
    if (streak) streak.textContent = game.streak;
    if (achievementCount) achievementCount.textContent = getUnlockedAchievements();
    if (xpBadge) xpBadge.textContent = `${game.xp} XP`;
    if (currentLevelText) currentLevelText.textContent = `Level ${level}`;
    if (nextLevelText) nextLevelText.textContent = `${levelXP} / 100 XP`;
    if (xpProgress) xpProgress.style.width = `${progress}%`;
    if (bigLevel) bigLevel.textContent = level;
    if (bigLevelName) bigLevelName.textContent = getLevelName(level);
    if (bigXPProgress) bigXPProgress.style.width = `${progress}%`;
    if (bigXPText) bigXPText.textContent = `${levelXP} / 100 XP`;
    if (progressXP) progressXP.textContent = game.xp;
    if (progressVerses) progressVerses.textContent = game.versesRead;
    if (progressStreak) progressStreak.textContent = game.streak;

    updateAchievements();
    updateFavoriteButton();
    updateStudyButtonState();
}

function getDateKey(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split("T")[0];
}

function loadVerse() {
    const verse = getTodayVerse();

    const verseReference = document.getElementById("verseReference");
    const verseText = document.getElementById("verseText");
    const verseDate = document.getElementById("verseDate");
    const reflection = document.getElementById("reflection");
    const today = getDateKey();

    if (verseReference) verseReference.textContent = verse.reference;
    if (verseText) verseText.textContent = verse.text;
    if (verseDate) verseDate.textContent = new Date().toLocaleDateString();
    if (reflection) reflection.value = game.reflections[today] || "";

    updateStudyButtonState();
}

function updateStudyButtonState() {
    const button = document.getElementById("completeButton");
    if (!button) return;

    const today = getDateKey();
    const completed = game.completedDates.includes(today);

    button.disabled = completed;
    button.classList.toggle("completed", completed);
    button.setAttribute("aria-pressed", String(completed));
    button.textContent = completed ? "✓ Study Complete" : "✓ Complete Today's Study";
    button.title = completed ? "You already completed today’s study." : "Complete today’s Bible study and earn XP.";
}

function completeStudy() {
    const today = getDateKey();

    if (game.completedDates.includes(today)) {
        updateStudyButtonState();
        return;
    }

    const oldLevel = getLevel();

    game.xp += 25;
    game.versesRead += 1;
    updateStreak();
    game.completedDates.push(today);
    saveGame();

    const newLevel = getLevel();

    if (newLevel > oldLevel) {
        showToast(`🎉 Level up! You reached Level ${newLevel}.`);
    } else {
        showToast("📖 Daily study complete! +25 XP");
    }

    loadVerse();
    updateUI();
}

function updateStreak() {
    const today = getDateKey();

    if (!game.lastRead) {
        game.streak = 1;
    } else {
        const yesterday = getDateKey(-1);

        if (game.lastRead === yesterday) {
            game.streak += 1;
        } else if (game.lastRead !== today) {
            game.streak = 1;
        }
    }

    game.lastRead = today;
}

function toggleFavorite() {
    const verse = getTodayVerse();
    const exists = game.favorites.some(item => item.reference === verse.reference);

    if (exists) {
        game.favorites = game.favorites.filter(item => item.reference !== verse.reference);
    } else {
        game.favorites.push(verse);
    }

    saveGame();
    updateFavoriteButton();
    renderFavorites();
}

function updateFavoriteButton() {
    const verse = getTodayVerse();
    const exists = game.favorites.some(item => item.reference === verse.reference);
    const button = document.getElementById("favoriteButton");

    if (!button) return;

    button.classList.toggle("favorite", exists);
    button.textContent = exists ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(exists));
}

function renderFavorites() {
    const container = document.getElementById("favoritesList");
    if (!container) return;

    container.innerHTML = "";

    if (game.favorites.length === 0) {
        container.innerHTML = `
            <div class="favorite-item">
                <h3>No favorites yet</h3>
                <p>Tap the ♡ button on a verse to save it here.</p>
            </div>
        `;
        return;
    }

    game.favorites.forEach(verse => {
        const item = document.createElement("div");
        item.className = "favorite-item";
        item.innerHTML = `
            <h3>${verse.reference}</h3>
            <p>“${verse.text}”</p>
        `;
        container.appendChild(item);
    });
}

const achievements = [
    {
        icon: "🌱",
        title: "First Step",
        description: "Read your first verse.",
        check: () => game.versesRead >= 1
    },
    {
        icon: "🔥",
        title: "7-Day Streak",
        description: "Study for 7 days in a row.",
        check: () => game.streak >= 7
    },
    {
        icon: "📖",
        title: "Bookworm",
        description: "Read 10 verses.",
        check: () => game.versesRead >= 10
    },
    {
        icon: "⭐",
        title: "XP Hunter",
        description: "Earn 100 XP.",
        check: () => game.xp >= 100
    },
    {
        icon: "🏆",
        title: "Faith Builder",
        description: "Reach Level 5.",
        check: () => getLevel() >= 5
    },
    {
        icon: "👑",
        title: "Bible Master",
        description: "Reach Level 20.",
        check: () => getLevel() >= 20
    }
];

function updateAchievements() {
    const container = document.getElementById("achievementGrid");
    if (!container) return;

    container.innerHTML = "";

    achievements.forEach(achievement => {
        const unlocked = achievement.check();
        const card = document.createElement("div");
        card.className = `achievement${unlocked ? " unlocked" : ""}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <p style="margin-top:10px;font-weight:700;">${unlocked ? "✓ Unlocked" : "🔒 Locked"}</p>
        `;
        container.appendChild(card);
    });
}

function getUnlockedAchievements() {
    return achievements.filter(achievement => achievement.check()).length;
}

function applySavedTheme() {
    const isDark = localStorage.getItem(STORAGE_KEYS.theme) === "true";
    document.body.classList.toggle("dark", isDark);
    const themeButton = document.getElementById("themeButton");
    if (themeButton) {
        themeButton.textContent = isDark ? "☀️" : "🌙";
    }
}

function setupNavigation() {
    document.querySelectorAll(".nav-btn").forEach(button => {
        button.addEventListener("click", () => {
            const target = button.dataset.section;

            document.querySelectorAll(".section").forEach(section => {
                section.classList.remove("active-section");
            });

            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add("active-section");
            }

            document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

function setupThemeToggle() {
    const themeButton = document.getElementById("themeButton");
    if (!themeButton) return;

    themeButton.addEventListener("click", () => {
        const dark = document.body.classList.toggle("dark");
        localStorage.setItem(STORAGE_KEYS.theme, dark ? "true" : "false");
        themeButton.textContent = dark ? "☀️" : "🌙";
    });
}

function bindEventHandlers() {
    const completeButton = document.getElementById("completeButton");
    if (completeButton) {
        completeButton.addEventListener("click", completeStudy);
    }

    const favoriteButton = document.getElementById("favoriteButton");
    if (favoriteButton) {
        favoriteButton.addEventListener("click", toggleFavorite);
    }

    const saveReflection = document.getElementById("saveReflection");
    if (saveReflection) {
        saveReflection.addEventListener("click", () => {
            const today = getDateKey();
            game.reflections[today] = document.getElementById("reflection").value;
            saveGame();

            const message = document.getElementById("savedMessage");
            if (message) {
                message.textContent = "Saved ✓";
                setTimeout(() => {
                    message.textContent = "";
                }, 2000);
            }
        });
    }
}

function initializeApp() {
    applySavedTheme();
    setupNavigation();
    setupThemeToggle();
    bindEventHandlers();
    loadVerse();
    updateUI();
    renderFavorites();
}

initializeApp();

window.addEventListener("beforeunload", () => {
    saveGame();
});
