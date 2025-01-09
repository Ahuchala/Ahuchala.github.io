document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector('.gallery');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const closeModal = document.querySelector('.modal .close');

    const images = [
        { 
            thumbnail: '/images/thumbnails/tile.webp', 
            full: '/images/gallery/tile.PNG', 
            alt: 'Tile Pattern', 
            title: 'Tile Pattern', 
            description: 'A mesmerizing tile pattern with symmetric design.' 
        },
        { 
            thumbnail: '/images/thumbnails/museum_small.webp', 
            full: '/images/gallery/museum_small.PNG', 
            alt: 'Museum 9k', 
            title: 'Museum Submission', 
            description: 'A digital art piece representing the Museum 9k concept.' 
        },
        { 
            thumbnail: '/images/thumbnails/hex.webp', 
            full: '/images/gallery/hex.png', 
            alt: 'Hex Pattern', 
            title: 'Hex Pattern', 
            description: 'A unique hexagonal pattern with a mathematical touch.' 
        },
        { 
            thumbnail: '/images/thumbnails/broken.webp', 
            full: '/images/gallery/broken.png', 
            alt: 'Broken', 
            title: 'Broken Pattern', 
            description: 'A fragmented design symbolizing chaos and order.' 
        },
        { 
            thumbnail: '/images/thumbnails/char2,5.webp', 
            full: '/images/gallery/char2,5.png', 
            alt: 'Char2,5', 
            title: 'Char2,5', 
            description: 'A mathematical visualization of characteristic 2,5.' 
        },
        { 
            thumbnail: '/images/thumbnails/julia.webp', 
            full: '/images/gallery/julia.png', 
            alt: 'Julia', 
            title: 'Julia Set', 
            description: 'A classic representation of a Julia fractal set.' 
        },
        { 
            thumbnail: '/images/thumbnails/creepymagnet.webp', 
            full: '/images/gallery/creepymagnet.png', 
            alt: 'Creepy Magnet', 
            title: 'Creepy Magnet', 
            description: 'An abstract and haunting visual representation.' 
        },
        { 
            thumbnail: '/images/thumbnails/husky.webp', 
            full: '/images/gallery/husky.png', 
            alt: 'Husky', 
            title: 'Husky Pattern', 
            description: 'A playful design inspired by huskies and symmetry.' 
        },
        { 
            thumbnail: '/images/thumbnails/inverse_constant.webp', 
            full: '/images/gallery/inverse_constant.png', 
            alt: 'Inverse Constant', 
            title: 'Inverse Constant', 
            description: 'A mathematical artwork exploring inversion constants.' 
        },
        { 
            thumbnail: '/images/thumbnails/ising.webp', 
            full: '/images/gallery/ising.png', 
            alt: 'Ising', 
            title: 'Ising Model', 
            description: 'A visualization of the Ising model from statistical physics.' 
        },
        { 
            thumbnail: '/images/thumbnails/cracked.webp', 
            full: '/images/gallery/cracked.PNG', 
            alt: 'Cracked', 
            title: 'Cracked Surface', 
            description: 'An artistic depiction of cracked surfaces in nature.' 
        },
        { 
            thumbnail: '/images/thumbnails/julia_3.webp', 
            full: '/images/gallery/julia_3.PNG', 
            alt: 'Julia 3', 
            title: 'Julia Variant', 
            description: 'A variation on the Julia set fractal, showcasing complexity.' 
        },
        { 
            thumbnail: '/images/thumbnails/tile2.webp', 
            full: '/images/gallery/tile2.PNG', 
            alt: 'Tile Pattern 2', 
            title: 'Tile Pattern II', 
            description: 'Another mesmerizing tile pattern with geometric elegance.' 
        },
        { 
            thumbnail: '/images/thumbnails/knight31.webp', 
            full: '/images/gallery/knight31.PNG', 
            alt: 'Knight31', 
            title: 'Knight31', 
            description: 'A chess-inspired pattern representing the Knight’s path.' 
        },
        { 
            thumbnail: '/images/thumbnails/sand23_3k.webp', 
            full: '/images/gallery/sand23_3k.png', 
            alt: 'Sand 3k', 
            title: 'Sand 3k', 
            description: 'A granular simulation captured in its dynamic state.' 
        }
    ];

    // Populate gallery with thumbnails
    images.forEach(({ thumbnail, full, alt, title, description }) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('gallery-item');

        // Create the title element for the thumbnail
        const titleElement = document.createElement('p');
        titleElement.textContent = title;
        titleElement.classList.add('thumbnail-title');

        // Create the image element
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
            modalTitle.textContent = title; // Display title in the modal
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
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalImage.src = '';
            modalTitle.textContent = '';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            modalImage.src = '';
            modalTitle.textContent = '';
        }
    });
});