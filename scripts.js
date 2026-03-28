/* ============================
   1) MENU / NAVBAR INIT
============================ */
export function initMenuToggle() {
  const menuButton = document.querySelector('.menu-button');
  const navbarMenu = document.querySelector('.navbar ul');

  if (menuButton && navbarMenu) {
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = menuButton.classList.toggle('active');
      navbarMenu.classList.toggle('active');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.body.addEventListener('click', () => {
      if (navbarMenu.classList.contains('active')) {
        navbarMenu.classList.remove('active');
        menuButton.classList.remove('active');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ============================
   2) SETTINGS INIT
============================ */
export function initSettings() {
  const settingsContainer = document.querySelector('.settings-container');
  const darkModeToggle = document.getElementById('dark-mode-btn');
  const reduceMotionToggle = document.getElementById('reduce-motion-btn');

  // Toggle the settings panel
  settingsContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    settingsContainer.classList.toggle('active');
  });

  // Close settings when clicking outside
  document.addEventListener('click', (event) => {
    if (!settingsContainer.contains(event.target)) {
      settingsContainer.classList.remove('active');
    }
  });

  // Dark mode — prefer saved value, fall back to OS preference.
  // Note: the initial class is set by an inline script in index.html to
  // prevent a flash of the wrong mode before this module loads.
  const savedMode = localStorage.getItem('darkMode');
  const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedMode !== null ? savedMode === 'enabled' : osDark;
  document.documentElement.classList.toggle('dark-mode', isDark);
  darkModeToggle.checked = isDark;

  darkModeToggle.addEventListener('change', () => {
    const enabled = darkModeToggle.checked;
    document.documentElement.classList.toggle('dark-mode', enabled);
    localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
  });

  // Reduce motion — prefer saved value, fall back to OS preference.
  const savedReduceMotion = localStorage.getItem('reduceMotion');
  const osReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduceMotion = savedReduceMotion !== null ? savedReduceMotion === 'enabled' : osReduceMotion;
  document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  reduceMotionToggle.checked = reduceMotion;

  reduceMotionToggle.addEventListener('change', () => {
    const enabled = reduceMotionToggle.checked;
    document.documentElement.classList.toggle('reduce-motion', enabled);
    localStorage.setItem('reduceMotion', enabled ? 'enabled' : 'disabled');
  });
}
