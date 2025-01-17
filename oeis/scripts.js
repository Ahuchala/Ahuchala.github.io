document.addEventListener("DOMContentLoaded", () => {
    const knightGallery = document.getElementById('knight-gallery');
    const thetaGallery = document.getElementById('theta-gallery');

    // Function to add gallery items
    const addGalleryItem = (label, imageUrl, gallery, hasImage, title = '', description = '') => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('gallery-item');

        const labelElement = document.createElement('p');
        labelElement.innerHTML = label;
        wrapper.appendChild(labelElement);

        if (hasImage) {
            const img = new Image();
            img.src = imageUrl.thumbnail || ''; // Ensure thumbnail is defined
            img.alt = label;
            img.classList.add('clickable');
            img.dataset.fullImage = imageUrl.full || ''; // Ensure full image path is defined
            img.dataset.title = title;
            img.dataset.description = description;

            wrapper.appendChild(img);
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
    // Knights Gallery
// Knights Gallery
const knightPath = '/images/gallery/'; // Full-size images in /images/gallery/
const knightThumbnailPath = '/images/thumbnails/'; // Thumbnails in /images/thumbnails/
const knightExtension = '.png';

knights.forEach((n) => {
    const label = `n = ${n}`;
    const hasImage = existingKnights.includes(n);
    const imageUrl = {
        full: `${knightPath}knight${n}${knightExtension}`, // Full image in gallery/
        thumbnail: `${knightThumbnailPath}knight${n}.webp` // Thumbnail in thumbnails/
    };
    const title = `Knight's Domination for n = ${n}`;
    const description = `This is a minimal covering of an ${n} x ${n} board by knights.`;
    addGalleryItem(label, imageUrl, knightGallery, hasImage, title, description);
});


    // Barnes-Wall Lattice Theta Series
    const thetaImages = [
        { n: 4, file: 'theta_4.png', title:  /* html */`<a href="https://oeis.org/A004011">A004011</a>: n = 4`, description:  /* html */`
            G.f. = $1 + 24z + 24z^2 + 96z^3+\\ldots$, theta series for the $n = 4$ Barnes-Wall lattice. In this case, this is just the usual $D_4$ lattice, i.e. the set of integer points in $\\mathbb{R}^4$.
        ` },
        { n: 8, file: 'theta_8.png', title: /* html */`<a href="https://oeis.org/A004009">A004009</a>: n = 8`, description:  /* html */`
            The theta function for the Barnes-Wall lattice in dimension 8 goes by many names. The lattice itself is the root lattice for the Lie algebra $E_8$, and its theta function is the Eisenstein series $E_4$, which along with the Eisenstein series $E_6$, generates the full space of modular forms. It admits a nice description
            $$1 + 240\\sum_{n >= 1} n^3 q^n/(1 - q^n) = 1 + 240q^2 + 2160q^4 + 6720q^6 + \\ldots
            $$
            although for aesthetic purposes I've chosen to plot the graph in $z=q^2$.
        `},
        { n: 16, file: 'theta_16.png', title: /* html */`<a href="https://oeis.org/A008409">A008409</a>: n = 16`, description: 'Theta series for n = 16.' },
        { n: 32, file: 'theta_32.png', title: /* html */`<a href="https://oeis.org/A004670">A004670</a>: n = 32`, description: 'Theta series for n = 32.' },
        { n: 64, file: 'theta_64.png', title: /* html */`<a href="https://oeis.org/A103936">A103936</a>: n = 64`, description: 'Theta series for n = 64.' },
        { n: 128, file: 'theta_128.png', title: /* html */`<a href="https://oeis.org/A100004">A100004</a>: n = 128`, description: 'Theta series for n = 128.' }
    ];

    const thetaPath = '/images/gallery/';
    const thetaThumbnailPath = '/images/thumbnails/';

    thetaImages.forEach(({ n, file, title, description }) => {
        const imageUrl = {
            full: `${thetaPath}${file}`,
            thumbnail: `${thetaThumbnailPath}${file.replace('.png', '.webp')}`
        };
        addGalleryItem(title, imageUrl, thetaGallery, true, title, description);
    });
});


document.addEventListener("DOMContentLoaded", () => {
    function populateSequences(gridSelector, sequences) {
        const oeisGrid = document.querySelector(gridSelector);
        if (!oeisGrid || !sequences) return;

        sequences.forEach(sequence => {
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
    }

    // Call the function for each sequence category
    populateSequences('.oeis-edits', editedSequences);
    populateSequences('.oeis-authored', authoredSequences);
    populateSequences('.oeis-favorite', favoriteSequences);
});

document.addEventListener("DOMContentLoaded", () => {
    // Define sections to apply collapsible behavior
    const collapsibleSections = [
        { selector: '#knight-gallery', itemClass: 'gallery-item' },
        { selector: '.oeis-edits', itemClass: 'oeis-sequence' },
        { selector: '.oeis-authored', itemClass: 'oeis-sequence' },
        { selector: '#theta-gallery', itemClass: 'gallery-item' }

    ];

    collapsibleSections.forEach(({ selector, itemClass }) => {
        const section = document.querySelector(selector);
        if (!section) return; // Skip if the section doesn't exist

        const items = Array.from(section.querySelectorAll(`.${itemClass}`));
        const toggleButton = section.parentElement.querySelector('.show-more'); // Target existing button
        if (!toggleButton) return; // Skip if no button exists

        let itemsPerRow = 1;

        // Function to calculate and apply visibility rules
        const applyVisibility = () => {
            const sectionWidth = section.clientWidth;
            const itemWidth = items[0]?.offsetWidth || 1; // Prevent division by zero
            itemsPerRow = Math.floor(sectionWidth / itemWidth);
            const totalRows = Math.ceil(items.length / itemsPerRow);

            items.forEach((item, index) => {
                const rowIndex = Math.floor(index / itemsPerRow);

                if (rowIndex === 0 || totalRows <= 2) {
                    // Fully visible first row
                    item.style.display = 'block';
                    item.classList.add('visible');
                    item.classList.remove('hidden', 'obscured');
                } else if (rowIndex === 1) {
                    // Obscured second row
                    item.style.display = 'block';
                    item.classList.add('obscured');
                    item.classList.remove('hidden', 'visible');
                } else {
                    // Hidden rows after the second
                    item.style.display = 'none';
                    item.classList.add('hidden');
                    item.classList.remove('visible', 'obscured');
                }
            });
            

            // Toggle the visibility of the "Show More" button based on the number of rows
            if (totalRows <= 2) {
                toggleButton.style.display = 'none';
            } else {
                toggleButton.style.display = 'inline-block';
            };
            
        };
        
        
        // Attach functionality to the existing button
        toggleButton.addEventListener('click', () => {
            if (toggleButton.textContent === 'Show More') {
                // Show all items
                items.forEach((item) => {
                    item.style.display = 'block';
                    item.classList.add('visible');
                    item.classList.remove('hidden', 'obscured');
                });
                toggleButton.textContent = 'Show Less';
            } else {
                // Reapply visibility rules
                applyVisibility();
                toggleButton.textContent = 'Show More';
            }
        });

                // Apply visibility rules immediately on page load
                applyVisibility();

                // Reapply visibility rules when the screen is resized
                window.addEventListener('resize', applyVisibility);
        
                // Ensure visibility is correct after DOM content is fully loaded
                window.addEventListener('load', applyVisibility);
    });
});

