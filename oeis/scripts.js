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
        { n: 4, file: 'theta_4.png' },
        { n: 8, file: 'theta_8.png' },
        { n: 16, file: 'theta_16.png' },
        { n: 32, file: 'theta_32.png' },
        { n: 64, file: 'theta_64.png' },
        { n: 128, file: 'theta_128.png' }
    ];
    const thetaPath = '/images/gallery/';
    const thetaThumbnailPath = '/images/thumbnails/';

    thetaImages.forEach(({ n, file }) => {
        const label = `Theta Series n = ${n}`;
        const imageUrl = {
            full: `${thetaPath}${file}`,
            thumbnail: `${thetaThumbnailPath}${file.replace('.png', '.webp')}`
        };
        addGalleryItem(label, imageUrl, thetaGallery, true);
    });

    // Modal functionality
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            modalImg.src = '';
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const oeisGrid = document.querySelector('.oeis-grid');
     // const oeisSequences = [
        // { id: "A000755", name: "No-3-in-line problem on n X n grid: total number of ways of placing 2n points on n X n grid so no 3 are in a line. No symmetries are taken into account." },...
    
    
    

    oeisSequences.forEach(sequence => {
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

    const sequenceGrid = document.querySelector(".sequence-grid");

    authoredSequences.forEach(sequence => {
        const card = document.createElement("div");
        card.className = "sequence-card";
        card.innerHTML = `
            <a href="https://oeis.org/${sequence.id}" target="_blank">
                <h3>${sequence.id}</h3>
                <p>${sequence.name}</p>
            </a>
        `;
        sequenceGrid.appendChild(card);
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const maxVisibleRows = 2; // Number of rows initially visible
    // const authoredSequences = [
    //     { id: "A351664", name: "Discriminants of imaginary quadratic fields with class number 26 (negated)." },...
    
    const applyToggle = (grid, button) => {
        const items = Array.from(grid.children);
        const columns = parseInt(
            getComputedStyle(grid).gridTemplateColumns.split(" ").length,
            10
        );

        // Apply visibility and fade
        items.forEach((item, index) => {
            if (index >= columns * maxVisibleRows) {
                item.classList.add("hidden");
            } else if (index >= columns) {
                item.classList.add("faded-row");
            }
        });

        let isExpanded = false;
        button.addEventListener("click", () => {
            isExpanded = !isExpanded;

            items.forEach((item, index) => {
                if (index >= columns * maxVisibleRows) {
                    item.classList.toggle("hidden", !isExpanded);
                }
                if (index >= columns && index < columns * maxVisibleRows) {
                    item.classList.toggle("faded-row", !isExpanded);
                }
            });

            button.innerHTML = isExpanded ? "Show Less &#9650;" : "Show More &#9660;";
        });
    };

    const addToggleButton = (grid, container) => {
        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("toggle-button");
        const button = document.createElement("button");
        button.innerHTML = "Show More &#9660;";
        buttonWrapper.appendChild(button);
        container.appendChild(buttonWrapper);
        applyToggle(grid, button);
    };

    // Apply to Knight's Domination grid
    const knightGrid = document.getElementById("knight-gallery");
    if (knightGrid) addToggleButton(knightGrid, knightGrid.parentElement);

    // Apply to other grids
    const oeisGrid = document.querySelector(".oeis-grid");
    const sequenceGrid = document.querySelector(".sequence-grid");
    if (oeisGrid) addToggleButton(oeisGrid, oeisGrid.parentElement);
    if (sequenceGrid) addToggleButton(sequenceGrid, sequenceGrid.parentElement);
});
