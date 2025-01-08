document.addEventListener("DOMContentLoaded", () => {
    const knightGallery = document.getElementById('knight-gallery');
    const barnesWallGallery = document.getElementById('barnes-wall-gallery');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close');

    // Function to check if an image exists
    const imageExists = (url) =>
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });

    // Generate Knight's Domination Gallery
    const generateKnightGallery = async () => {
        const start = 4;
        const end = 45;

        for (let i = start; i <= end; i++) {
            const thumbnail = `/images/thumbnails/knight${i}.webp`;
            const fullImage = `/images/gallery/knights/knight${i}.png`;
            const altText = `Knight n=${i}`;
            const label = `n = ${i}`;

            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('gallery-item');

            const labelElement = document.createElement('p');
            labelElement.textContent = label;

            imgWrapper.appendChild(labelElement);

            if (await imageExists(thumbnail)) {
                const imgElement = document.createElement('img');
                imgElement.src = thumbnail;
                imgElement.alt = altText;
                imgElement.dataset.fullImage = fullImage;

                imgWrapper.appendChild(imgElement);

                imgElement.addEventListener('click', () => {
                    modal.style.display = 'block';
                    modalImg.src = fullImage;
                    modalImg.alt = altText;
                });
            }

            knightGallery.appendChild(imgWrapper);
        }
    };

    // Generate Barnes-Wall Gallery
    const generateBarnesWallGallery = async () => {
        const images = [
            { thumbnail: '/images/thumbnails/theta_4.webp', full: '/images/gallery/theta_4.png', alt: 'Theta Series 4', label: 'Theta Series n = 4' },
            { thumbnail: '/images/thumbnails/theta_8.webp', full: '/images/gallery/theta_8.png', alt: 'Theta Series 8', label: 'Theta Series n = 8' },
            { thumbnail: '/images/thumbnails/theta_16.webp', full: '/images/gallery/Theta_16.png', alt: 'Theta Series 16', label: 'Theta Series n = 16' },
            { thumbnail: '/images/thumbnails/theta_32.webp', full: '/images/gallery/Theta32_gimp.png', alt: 'Theta Series 32', label: 'Theta Series n = 32' },
            { thumbnail: '/images/thumbnails/theta_64.webp', full: '/images/gallery/theta_64.png', alt: 'Theta Series 64', label: 'Theta Series n = 64' }
        ];

        for (const { thumbnail, full, alt, label } of images) {
            if (await imageExists(thumbnail)) {
                const imgWrapper = document.createElement('div');
                imgWrapper.classList.add('gallery-item');

                const labelElement = document.createElement('p');
                labelElement.textContent = label;
                imgWrapper.appendChild(labelElement);

                const imgElement = document.createElement('img');
                imgElement.src = thumbnail;
                imgElement.alt = alt;
                imgElement.dataset.fullImage = full;

                imgWrapper.appendChild(imgElement);
                barnesWallGallery.appendChild(imgWrapper);

                imgElement.addEventListener('click', () => {
                    modal.style.display = 'block';
                    modalImg.src = full;
                    modalImg.alt = alt;
                });
            }
        }
    };

    // Close modal functionality
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        modalImg.src = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalImg.src = '';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            modalImg.src = '';
        }
    });

    // Run gallery generation
    generateKnightGallery();
    generateBarnesWallGallery();
});
