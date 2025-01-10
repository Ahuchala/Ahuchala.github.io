document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector('.gallery');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title'); // Ensure this exists in HTML
    const modalDescription = document.getElementById('modal-description'); // Ensure this exists in HTML
    const closeModal = document.querySelector('.modal .close');

    const images = [
        { 
            thumbnail: '/images/thumbnails/tile.webp', 
            full: '/images/gallery/tile.PNG', 
            alt: 'Tile Pattern', 
            title: 'Tile Pattern', 
            description: 'A tiled image where each box was an abelian sandpile constrained to a smaller box than normal (with no sink).' 
        },
        { 
            thumbnail: '/images/thumbnails/museum_small.webp', 
            full: '/images/gallery/museum_small.PNG', 
            alt: 'Museum 9k', 
            title: 'Museum Submission', 
            description: 
            /* html */`
            <p>A 9,000 by 9,000 abelian sandpile with millions of grains. This, along with a zoomed in version, was originally submitted to the Jordan Schnitzer Museum of Art in 2020 and was displayed in their virtual gallery until the museum was able to resume in-person operation in 2021. Also currently on display in gate A of the Eugene airport. It was also <a href="https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf">published in Girls\' Angle magazine</a>, a magazine aimed to increase engagement of girls in math.</p>
            
            <p><em>Original Caption: This piece attempts to capture the spirit of the infinite and print it on a single page. It uses what's called an Abelian Sandpile model, which is a fractal that colors "grains of sand" by their slope. A fractal is a kind of
mathematical picture with a repeated motif no matter how far in or out you zoom. The Abelian Sandpile model achieves this by stacking a large number of grains of sand in the center of a grid, and then "topples" it onto
the adjacent 4 tiles. The taller the pile of sand at the start, the more times you can topple, and the closer to the illusion of infinity you get. Adding color depicting the different heights of sand helps us visualize the
resulting fractal structure.
        </em>
            </p>
            `
        },
        { 
            thumbnail: '/images/thumbnails/hex.webp', 
            full: '/images/gallery/hex.png', 
            alt: 'Cross Pattern', 
            title: 'Cross Pattern', 
            description: 'A sandpile with little room to topple (and no sink). A tiled version of a similar image appears later in the gallery.' 
        },
        { 
            thumbnail: '/images/thumbnails/broken.webp', 
            full: '/images/gallery/broken.png', 
            alt: 'Race Condition', 
            title: 'Race Condition', 
            description: 'An abelian sandpile implementation that accidentally had a race condition. I terminated the program early when I realized it was bugged, and it made this unique pattern. The multiple bands are from coloring the tile height mod 4.' 
        },
        { 
            thumbnail: '/images/thumbnails/char2,5.webp', 
            full: '/images/gallery/char2,5.png', 
            alt: 'Char2,5', 
            title: 'Character (2,5)', 
            description: 'The character formula of the Lie algebra SU(3) with highest weight (2,5) plotted in Sage.' 
        },
        { 
            thumbnail: '/images/thumbnails/julia.webp', 
            full: '/images/gallery/julia.png', 
            alt: 'Julia', 
            title: 'Julia Set', 
            description: 'A sandpile run through GNU Image Manipulation Program (GIMP)\'s Julia filter.' 
        },
        { 
            thumbnail: '/images/thumbnails/creepymagnet.webp', 
            full: '/images/gallery/creepymagnet.png', 
            alt: 'Creepy Magnet', 
            title: 'Creepy Magnet', 
            description: 'An Ising model approaching the critical point that looked a little spooky.' 
        },
        { 
            thumbnail: '/images/thumbnails/husky.webp', 
            full: '/images/gallery/husky.png', 
            alt: 'Husky', 
            title: 'Husky Pattern', 
            description: 'A sandpile a little too big for its bounding box.' 
        },
        { 
            thumbnail: '/images/thumbnails/inverse_constant.webp', 
            full: '/images/gallery/inverse_constant.png', 
            alt: 'Inverse Constant', 
            title: 'Inverse Constant', 
            description: 'Some kind of elliptic function, maybe a Weierstrass function?' 
        },
        { 
            thumbnail: '/images/thumbnails/ising.webp', 
            full: '/images/gallery/ising.png', 
            alt: 'Ising', 
            title: 'Ising Model', 
            description: 'The Ising model doing its best imitation of a Zebra notebook.' 
        },
        { 
            thumbnail: '/images/thumbnails/cracked.webp', 
            full: '/images/gallery/cracked.PNG', 
            alt: 'Cracked', 
            title: 'Cracked Glass', 
            description: 'Another race condition in an abelian sandpile implementation, this one cause an asymmetry in toppling. It terminated early and produced this image which bizarrely looks like a cracked screen. The bands of color are from coloring pile height mod 4 (since some piles remained taller).' 
        },
        { 
            thumbnail: '/images/thumbnails/julia_3.webp', 
            full: '/images/gallery/julia_3.PNG', 
            alt: 'Julia 3', 
            title: 'Julia Variant', 
            description: 'Another sandpile run through GIMP\'s Julia filter.' 
        },
        { 
            thumbnail: '/images/thumbnails/tile2.webp', 
            full: '/images/gallery/tile2.PNG', 
            alt: 'Tile Pattern 2', 
            title: 'Tile Pattern II', 
            description: 'Tiling a sandpile similar to the cross pattern.' 
        },
        { 
            thumbnail: '/images/thumbnails/knight31.webp', 
            full: '/images/gallery/knight31.PNG', 
            alt: 'Knight31', 
            title: 'Knight31', 
            description: 'An optimal solution to the Knight\'s Domination problem. To my knowledge it\'s the largest known solution on an odd-dimensional board.' 
        },
        { 
            thumbnail: '/images/thumbnails/sand23_3k.webp', 
            full: '/images/gallery/sand23_3k.png', 
            alt: 'Sand 3k', 
            title: 'Sand 3k', 
            description: 'A 3,000 x 3,000 sandpile that was also a little bit too big for its bounding box.' 
        }
    ];
    
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