document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModal = document.querySelector('.modal .close');

    // Ensure gallery items have proper click listeners
    document.querySelectorAll('.clickable').forEach((img) => {
        
        img.addEventListener('click', (event) => {
            if (event.target.closest('.no-modal')) {
                return; // Prevent opening the modal
            }
            const fullImage = img.dataset.fullImage || ''; // Full image URL
            const title = img.dataset.title || ''; // Image title
            const description = img.dataset.description || ''; // Image description

            // Populate modal content
            modal.style.display = 'flex';
            modalImage.src = fullImage;
            modalImage.alt = title;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            if (window.MathJax) {
                MathJax.typesetPromise([modalDescription])
            }
        });
    });

    // Close modal when 'X' button is clicked
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        modalImage.src = ''; // Reset modal image
        modalTitle.textContent = ''; // Clear modal title
        modalDescription.textContent = ''; // Clear modal description
    });

    // Close modal when background is clicked
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalImage.src = ''; // Reset modal image
            modalTitle.textContent = ''; // Clear modal title
            modalDescription.textContent = ''; // Clear modal description
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            modalImage.src = ''; // Reset modal image
            modalTitle.textContent = ''; // Clear modal title
            modalDescription.textContent = ''; // Clear modal description
        }
    });
});


  
  document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navbarMenu = document.querySelector('.navbar ul');
  
    if (menuButton && navbarMenu) {
      menuButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent body click from closing instantly
        menuButton.classList.toggle('active');
        navbarMenu.classList.toggle('active');
      });
  
      // Close menu when clicking outside
      document.body.addEventListener('click', () => {
        if (navbarMenu.classList.contains('active')) {
          navbarMenu.classList.remove('active');
          menuButton.classList.remove('active');
        }
      });
    }
  });


  document.addEventListener("DOMContentLoaded", () => {
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

        // Save user preference
        localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    });
});
