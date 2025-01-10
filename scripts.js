document.addEventListener("DOMContentLoaded", () => {
    // Create the modal for full-size images
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    Object.assign(modal.style, {
        display: 'none',
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: '1000',
        overflow: 'auto', // Allows scrolling for larger images
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    });

    const modalImg = document.createElement('img');
    Object.assign(modalImg.style, {
        borderRadius: '10px',
        transition: 'transform 0.2s ease',
        cursor: 'zoom-in',
    });
    modal.appendChild(modalImg);

    const closeButton = document.createElement('span');
    closeButton.classList.add('close');
    closeButton.textContent = '×';
    Object.assign(closeButton.style, {
        position: 'absolute',
        top: '10px',
        right: '20px',
        fontSize: '30px',
        color: 'white',
        cursor: 'pointer',
        zIndex: '1001',
    });

    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    // Add click listeners for thumbnails
    document.querySelectorAll('.clickable').forEach((img) => {
        img.addEventListener('click', () => {
            const isMuseumImage = img.alt === 'Museum Submission';
            modalImg.src = isMuseumImage
                ? '/images/gallery/museum_9k.png'
                : img.src.replace('/thumbnails/', '/gallery/');
            Object.assign(modalImg.style, {
                maxWidth: isMuseumImage ? '90%' : '80%',
                maxHeight: isMuseumImage ? '90%' : '80%',
                transform: 'scale(1)', // Reset zoom
            });
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
