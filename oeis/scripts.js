document.addEventListener("DOMContentLoaded", () => {
    const knightGallery = document.getElementById('knight-gallery');
    const thetaGallery = document.getElementById('theta-gallery');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close');

    // Function to add image or blank space
    const addGalleryItem = (label, imageUrl, gallery, hasImage) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('gallery-item');

        const labelElement = document.createElement('p');
        labelElement.textContent = label;
        wrapper.appendChild(labelElement);

        if (hasImage) {
            const img = new Image();
            img.src = imageUrl.thumbnail;
            img.alt = label;
            img.dataset.fullImage = imageUrl.full;
            wrapper.appendChild(img);

            img.addEventListener('click', () => {
                modal.style.display = 'block';
                modalImg.src = img.dataset.fullImage;
                modalImg.alt = label;
            });
        } else {
            const placeholder = document.createElement('div');
            placeholder.classList.add('placeholder');
            wrapper.appendChild(placeholder);
        }

        gallery.appendChild(wrapper);
    };

    // Knights Gallery
    const knights = Array.from({ length: 37 }, (_, i) => i + 4); // 4 to 45
    const existingKnights = [
        4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 36, 38, 40
    ];
    const knightPath = '/images/gallery/knights/';
    const knightThumbnailPath = '/images/thumbnails/knight';
    const knightExtension = '.png';

    knights.forEach((n) => {
        const label = `n = ${n}`;
        const hasImage = existingKnights.includes(n);
        const imageUrl = {
            full: `${knightPath}knight${n}${knightExtension}`,
            thumbnail: `${knightThumbnailPath}${n}.webp`
        };
        addGalleryItem(label, imageUrl, knightGallery, hasImage);
    });

    // Barnes-Wall Lattice Theta Series
    const thetaImages = [
        { n: 4, file: 'theta_4.png', title: 'A004011: n = 4' },
        { n: 8, file: 'theta_8.png', title: 'A004009: n = 8' },
        { n: 16, file: 'theta_16.png', title: 'A008409: n = 16' },
        { n: 32, file: 'theta_32.png', title: 'A004670: n = 32' },
        { n: 64, file: 'theta_64.png', title: 'A103936: n = 64' },
        { n: 128, file: 'theta_128.png', title: 'A100004: n = 128'}
    ];
    
    const thetaPath = '/images/gallery/';
    const thetaThumbnailPath = '/images/thumbnails/';

    thetaImages.forEach(({ n, file, title }) => {
        const imageUrl = {
            full: `${thetaPath}${file}`,
            thumbnail: `${thetaThumbnailPath}${file.replace('.png', '.webp')}`
        };
        addGalleryItem(title, imageUrl, thetaGallery, true);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const oeisGrid = document.querySelector('.oeis-edits');
     // const editedSequences = [
        // { id: "A000755", name: "No-3-in-line problem on n X n grid: total number of ways of placing 2n points on n X n grid so no 3 are in a line. No symmetries are taken into account." },...
    editedSequences.forEach(sequence => {
        const sequenceDiv = document.createElement('div');
        sequenceDiv.classList.add('oeis-sequence');

        sequenceDiv.innerHTML = `
            <div class="sequence-id">${sequence.id}</div>
            <div class="sequence-name">${sequence.name}</div>
        `;

        sequenceDiv.addEventListener('click', () => {
            window.open(`https://oeis.org/${sequence.id}`, '_blank');
        });

        oeisGrid.appendChild(sequenceDiv);
    });
});

document.addEventListener("DOMContentLoaded", () => {

    const oeisGrid = document.querySelector('.oeis-authored');

    authoredSequences.forEach(sequence => {
        const sequenceDiv = document.createElement('div');
        sequenceDiv.classList.add('oeis-sequence');

        sequenceDiv.innerHTML = `
            <div class="sequence-id">${sequence.id}</div>
            <div class="sequence-name">${sequence.name}</div>
        `;

        sequenceDiv.addEventListener('click', () => {
            window.open(`https://oeis.org/${sequence.id}`, '_blank');
        });

        oeisGrid.appendChild(sequenceDiv);
    });
});

document.addEventListener("DOMContentLoaded", () => {

    const oeisGrid = document.querySelector('.oeis-favorite');

    favoriteSequences.forEach(sequence => {
        const sequenceDiv = document.createElement('div');
        sequenceDiv.classList.add('oeis-sequence');

        sequenceDiv.innerHTML = `
            <div class="sequence-id">${sequence.id}</div>
            <div class="sequence-name">${sequence.name}</div>
        `;

        sequenceDiv.addEventListener('click', () => {
            window.open(`https://oeis.org/${sequence.id}`, '_blank');
        });

        oeisGrid.appendChild(sequenceDiv);
    });
});
