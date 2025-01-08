document.addEventListener("DOMContentLoaded", () => {
    // Modal functionality for full-size image preview
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '1000';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.textAlign = 'center';

    const modalImg = document.createElement('img');
    modalImg.style.maxWidth = '80%';
    modalImg.style.maxHeight = '80%';
    modalImg.style.borderRadius = '10px';
    modal.appendChild(modalImg);

    document.body.appendChild(modal);

    // Add click listener to images
    document.querySelectorAll('.clickable').forEach((img) => {
        img.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImg.src = img.src.replace('/Thumbnails/', '/gallery/');
        });
    });

    // Close modal on click or escape key
    modal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
});
