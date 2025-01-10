document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector('.gallery');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title'); // Ensure this exists in HTML
    const modalDescription = document.getElementById('modal-description'); // Ensure this exists in HTML
    const closeModal = document.querySelector('.modal .close');

    // this is loaded from /components/gallery.js
    // const images = [
    //     { 
    //         thumbnail: '/images/thumbnails/tile.webp', 
    //         full: '/images/gallery/tile.PNG', 
    //         alt: 'Tile Pattern', 
    //         title: 'Tile Pattern', 
    //         description: 'A tiled image where each box was an abelian sandpile constrained to a smaller box than normal (with no sink).' 
    //     },...
    
        // Populate gallery with thumbnails
    images.forEach(({ thumbnail, full, alt, title, description }) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('gallery-item');

        const titleElement = document.createElement('p');
        titleElement.textContent = title;
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
            modalTitle.textContent = title; // Set title
            modalDescription.innerHTML = description; // Set description
        });

        wrapper.appendChild(titleElement);
        wrapper.appendChild(imgElement);
        gallery.appendChild(wrapper);
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        modalImage.src = '';
        modalTitle.textContent = '';
        modalDescription.textContent = '';
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalImage.src = '';
            modalTitle.textContent = '';
            modalDescription.textContent = '';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            modalImage.src = '';
            modalTitle.textContent = '';
            modalDescription.textContent = '';
        }
    });
});