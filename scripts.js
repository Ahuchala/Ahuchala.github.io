document.addEventListener("DOMContentLoaded", () => {
    // Create the modal for full-size images
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
    modal.style.overflow = 'auto'; // Allows scrolling for larger images
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.textAlign = 'center';

    const modalImg = document.createElement('img');
    modalImg.style.borderRadius = '10px';
    modalImg.style.transition = 'transform 0.2s ease';
    modalImg.style.cursor = 'zoom-in'; // Default to zoom-in
    modal.appendChild(modalImg);

    const closeButton = document.createElement('span');
    closeButton.classList.add('close');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '20px';
    closeButton.style.fontSize = '30px';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '1001';

    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    // Add click listeners for thumbnails
    document.querySelectorAll('.clickable').forEach((img) => {
        img.addEventListener('click', () => {
            if (img.alt === 'Museum Submission') {
                modalImg.src = '/images/gallery/museum_9k.png';
                modalImg.style.maxWidth = '90%'; // Larger but not full zoom
                modalImg.style.maxHeight = '90%';
                modalImg.style.transform = 'scale(1)'; // Reset zoom
            } else {
                modalImg.src = img.src.replace('/thumbnails/', '/gallery/');
                modalImg.style.maxWidth = '80%'; // Reset for smaller images
                modalImg.style.maxHeight = '80%';
                modalImg.style.transform = 'scale(1)'; // Reset zoom
            }
            modal.style.display = 'flex';
        });
    });

    // Zoom in/out functionality for `museum_9k.png`
    let zoomedIn = false;
    modalImg.addEventListener('click', () => {
        if (modalImg.src.includes('museum_9k.png')) {
            zoomedIn = !zoomedIn;
            modalImg.style.transform = zoomedIn ? 'scale(1.5)' : 'scale(1)';
            modalImg.style.cursor = zoomedIn ? 'zoom-out' : 'zoom-in';
        }
    });

    // Close modal on click of 'X' or background
    closeButton.addEventListener('click', () => {
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
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            modalImg.src = '';
        }
    });
});
