import { images } from '/components/gallery.js';

// 2) Wrap in a DOMContentLoaded check (unless you're deferring or doing this in main.js)
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector('.gallery');
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const closeModal = document.querySelector('.modal .close');

  // Populate research page with thumbnails
  const zeta = images.find(img => img.title === 'Zeta Function');
  if (zeta) {
    const { thumbnail, full, alt, title, description } = zeta;

    const wrapper = document.createElement('div');
    wrapper.classList.add('gallery-item');

    const titleElement = document.createElement('p');
    titleElement.innerHTML = title;
    titleElement.classList.add('thumbnail-title');

    const imgElement = document.createElement('img');
    imgElement.src = thumbnail;
    imgElement.alt = alt;
    imgElement.dataset.fullImage = full;
    imgElement.dataset.title = title;
    imgElement.dataset.description = description;

    imgElement.addEventListener('click', () => {
      modal.style.display = 'flex';
      modalImage.src = full;
      modalImage.alt = alt;
      modalTitle.innerHTML = title;
      modalDescription.innerHTML = description;

      if (window.MathJax) MathJax.typesetPromise([modalDescription]);
    });

    // wrapper.appendChild(titleElement);
    wrapper.appendChild(imgElement);
    gallery.appendChild(wrapper);
  }

    // Close modal on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModalModal(modal, modalImage, modalTitle, modalDescription);
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModalModal(modal, modalImage, modalTitle, modalDescription);
      }
    });
  });

// Helper to DRY up modal closing
function closeModalModal(modal, modalImage, modalTitle, modalDescription) {
  modal.style.display = 'none';
  modalImage.src = '';
  modalTitle.innerHTML = '';
  modalDescription.innerHTML = '';
}