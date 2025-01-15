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
  
  document.addEventListener('DOMContentLoaded', () => {
    const darkModeButton = document.getElementById('dark-mode-btn');
  
    // Apply saved preference
    const savedMode = localStorage.getItem('darkMode')
    // uncomment to use dark mode based on user settings
        // ?? (matchMedia("(prefers-color-scheme: dark)").matches ? 'enabled' : 'disabled');

    if (savedMode === 'enabled') {
      document.documentElement.classList.add('dark-mode');
    }
  
    // Temporarily disable transitions on page load
    document.body.classList.add('no-transition');
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 100); // Remove the class after 100ms (or adjust as needed)
  
    // Toggle dark mode
    if (darkModeButton) {
      darkModeButton.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-mode');
  
        // Save user preference
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
      });
    }
  });
  