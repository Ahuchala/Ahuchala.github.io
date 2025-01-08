document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector('.gallery');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.querySelector('.modal .close');

    const images = [
        { thumbnail: '/images/thumbnails/tile.webp', full: '/images/gallery/tile.PNG', alt: 'Tile Pattern' },
        { thumbnail: '/images/thumbnails/museum_small.webp', full: '/images/gallery/museum_small.PNG', alt: 'Museum 9k' },
        { thumbnail: '/images/thumbnails/hex.webp', full: '/images/gallery/hex.png', alt: 'Hex Pattern' },
        { thumbnail: '/images/thumbnails/broken.webp', full: '/images/gallery/broken.png', alt: 'Broken' },
        { thumbnail: '/images/thumbnails/char2,5.webp', full: '/images/gallery/char2,5.png', alt: 'Char2,5' },
        { thumbnail: '/images/thumbnails/julia.webp', full: '/images/gallery/julia.png', alt: 'Julia' },
        { thumbnail: '/images/thumbnails/creepymagnet.webp', full: '/images/gallery/creepymagnet.png', alt: 'Creepy Magnet' },
        { thumbnail: '/images/thumbnails/husky.webp', full: '/images/gallery/husky.png', alt: 'Husky' },
        { thumbnail: '/images/thumbnails/inverse_constant.webp', full: '/images/gallery/inverse_constant.png', alt: 'Inverse Constant' },
        { thumbnail: '/images/thumbnails/ising.webp', full: '/images/gallery/ising.png', alt: 'Ising' },
        { thumbnail: '/images/thumbnails/cracked.webp', full: '/images/gallery/cracked.PNG', alt: 'Cracked' },
        { thumbnail: '/images/thumbnails/julia_3.webp', full: '/images/gallery/julia_3.PNG', alt: 'Julia 3' },
        { thumbnail: '/images/thumbnails/tile2.webp', full: '/images/gallery/tile2.PNG', alt: 'Tile Pattern 2' },
        { thumbnail: '/images/thumbnails/knight31.webp', full: '/images/gallery/knight31.PNG', alt: 'Knight31' },
        { thumbnail: '/images/thumbnails/sand23_3k.webp', full: '/images/gallery/sand23_3k.png', alt: 'Sand 3k' }
    ];

    // Populate gallery with thumbnails
    images.forEach(({ thumbnail, full, alt }) => {
        const imgElement = document.createElement('img');
        imgElement.src = thumbnail;
        imgElement.alt = alt;
        imgElement.dataset.fullImage = full;

        imgElement.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImage.src = full;
            modalImage.alt = alt;
        });

        gallery.appendChild(imgElement);
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        modalImage.src = '';
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalImage.src = '';
        }
    });
});
