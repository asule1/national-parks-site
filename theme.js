/* ==========================================================================
   theme.js - the dark mode switch for the whole site

   How it works, in short:
   style.css holds two sets of color variables. The normal set lives on
   :root, and the dark set lives inside a "body.dark-mode" block. So all
   this file has to do is put the dark-mode class on <body> or take it off,
   and the browser repaints every page with the other colors.

   It also saves the choice in localStorage, which is a small store the
   browser keeps for my site, so the setting survives closing the tab and
   carries across to the other pages.
   ========================================================================== */

/* The name I save the setting under, and the two values it can hold.
   Keeping them in constants means a typo breaks the build in one obvious
   place instead of silently failing somewhere else. */
const THEME_KEY = "website_theme";
const DARK = "dark_mode";
const LIGHT = "default";

/* Grab the button from the nav bar. Every page has one with id="themeToggle". */
const toggleButton = document.getElementById("themeToggle");

/* ---------------------------------------------------------------------------
   applyTheme
   Puts the site into one theme or the other.
   - adds or removes the class that swaps the CSS variables
   - updates the button text so it says what clicking it will do
   - updates aria-pressed so a screen reader announces the on/off state
   --------------------------------------------------------------------------- */
function applyTheme(theme) {
  const isDark = theme === DARK;

  /* classList.toggle with a second argument adds the class when the
     argument is true and removes it when it is false. */
  document.body.classList.toggle("dark-mode", isDark);

  if (toggleButton) {
    toggleButton.setAttribute("aria-pressed", isDark ? "true" : "false");

    /* querySelector looks inside the button for the text span, so the
       little circle icon next to it is left alone. */
    const label = toggleButton.querySelector(".theme-toggle-label");
    if (label) {
      label.textContent = isDark ? "Light mode" : "Dark mode";
    }
  }
}

/* ---------------------------------------------------------------------------
   readSavedTheme
   Reads the saved setting back out of localStorage.

   The try/catch is here because localStorage throws an error instead of
   returning nothing in a few cases, such as a private browsing window or a
   browser with site data blocked. Without the catch, that error would stop
   the rest of the script and the button would do nothing at all.
   --------------------------------------------------------------------------- */
function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
}

/* ---------------------------------------------------------------------------
   saveTheme
   Writes the setting so the next page load can read it back.
   Same try/catch reasoning as above.
   --------------------------------------------------------------------------- */
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    /* Saving failed, so the choice will not stick after a reload. The site
       still works for this visit, so there is nothing to tell the user. */
  }
}

/* ---------------------------------------------------------------------------
   startingTheme
   Works out which theme to open the page in.

   1. If I have been here before, use whatever I picked last time.
   2. If not, fall back to the setting on the computer itself.
      matchMedia asks the browser a CSS question from JavaScript, and
      prefers-color-scheme is the operating system's own dark mode setting.
   --------------------------------------------------------------------------- */
function startingTheme() {
  const saved = readSavedTheme();

  if (saved === DARK || saved === LIGHT) {
    return saved;
  }

  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? DARK : LIGHT;
}

/* Run once, straight away, so the page is in the right theme before anyone
   has clicked anything. */
applyTheme(startingTheme());

/* ---------------------------------------------------------------------------
   The click handler.
   Reads whether the class is on right now, flips it, and saves the result.
   --------------------------------------------------------------------------- */
if (toggleButton) {
  toggleButton.addEventListener("click", function () {
    const nowDark = document.body.classList.contains("dark-mode");
    const nextTheme = nowDark ? LIGHT : DARK;

    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
}

/* ---------------------------------------------------------------------------
   Keeping other tabs in sync.

   The storage event fires in every OTHER open tab of my site whenever one
   tab writes to localStorage. So if the site is open twice and I switch the
   theme in one tab, this makes the other tab follow along instead of being
   left on the old colors.
   --------------------------------------------------------------------------- */
window.addEventListener("storage", function (event) {
  if (event.key === THEME_KEY) {
    applyTheme(startingTheme());
  }
});
