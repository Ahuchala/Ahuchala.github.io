// File: /scripts/scripts.js

/* ============================
   1) MODAL INIT
============================ */
export function initModal() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModal = document.querySelector('.modal .close');
  
    document.querySelectorAll('.clickable').forEach((img) => {
      img.addEventListener('click', (event) => {
        if (event.target.closest('.no-modal')) return; 
        const fullImage = img.dataset.fullImage || '';
        const title = img.dataset.title || '';
        const description = img.dataset.description || '';
  
        modal.style.display = 'flex';
        modalImage.src = fullImage;
        modalImage.alt = title;
        modalTitle.innerHTML = title;
        modalDescription.innerHTML = description;
  
        if (window.MathJax) {
          MathJax.typesetPromise([modalDescription]);
        }
      });
    });
  
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
      modalImage.src = '';
      modalTitle.innerHTML = '';
      modalDescription.innerHTML = '';
    });
  
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        modalImage.src = '';
        modalTitle.innerHTML = '';
        modalDescription.innerHTML = '';
      }
    });
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
        modalImage.src = '';
        modalTitle.textContent = '';
        modalDescription.textContent = '';
      }
    });
  }
  
  /* ============================
     2) MENU / NAVBAR INIT
  ============================ */
  export function initMenuToggle() {
    const menuButton = document.querySelector('.menu-button');
    const navbarMenu = document.querySelector('.navbar ul');
  
    if (menuButton && navbarMenu) {
      menuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        menuButton.classList.toggle('active');
        navbarMenu.classList.toggle('active');
      });
  
      document.body.addEventListener('click', () => {
        if (navbarMenu.classList.contains('active')) {
          navbarMenu.classList.remove('active');
          menuButton.classList.remove('active');
        }
      });
    }
  }
  
  /* ============================
     3) SETTINGS INIT
  ============================ */
  export function initSettings() {
    const settingsContainer = document.querySelector(".settings-container");
    const darkModeToggle = document.getElementById("dark-mode-btn");
  
    // Toggle the settings container
    settingsContainer.addEventListener("click", (event) => {
      event.stopPropagation();
      settingsContainer.classList.toggle("active");
    });
  
    // Close settings when clicking outside
    document.addEventListener("click", (event) => {
      if (!settingsContainer.contains(event.target)) {
        settingsContainer.classList.remove("active");
      }
    });
  
    // Apply saved dark mode preference
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "enabled") {
      document.documentElement.classList.add("dark-mode");
      darkModeToggle.checked = true;
    }
  
    // Toggle dark mode
    darkModeToggle.addEventListener("change", () => {
      const isDarkMode = darkModeToggle.checked;
      document.documentElement.classList.toggle("dark-mode", isDarkMode);
      localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    });
  }
  