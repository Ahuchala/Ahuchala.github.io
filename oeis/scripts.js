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
            img.src = imageUrl.thumbnail || '';
            img.alt = label;
            img.classList.add('clickable');
            img.dataset.fullImage = imageUrl.full || '';
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

    // Knights Gallery (n = 4 to 40)
    const knights = Array.from({ length: 37 }, (_, i) => i + 4); // 4 to 40
    const existingKnights = [
        4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 36, 38, 40
    ];
    const knightPath = '/images/gallery/';
    const knightThumbnailPath = '/images/thumbnails/';
    const knightExtension = '.png';

    knights.forEach((n) => {
        const label = `n = ${n}`;
        const hasImage = existingKnights.includes(n);
        const imageUrl = {
            full: `${knightPath}knight${n}${knightExtension}`,
            thumbnail: `${knightThumbnailPath}knight${n}.webp`
        };
        const title = `Knight's Domination for n = ${n}`;
        const description = `This is a minimal covering of an ${n} x ${n} board by knights.`;
        addGalleryItem(label, imageUrl, knightGallery, hasImage, title, description);
    });

    // Barnes-Wall Lattice Theta Series
    const thetaImages = [
        { n: 4, file: 'theta_4.png', title:  /* html */`<a href="https://oeis.org/A004011">A004011</a>: n = 4`, description:  /* html */`
            The theta series for the $n = 4$ Barnes-Wall lattice. In this case, this is just the usual $D_4$ lattice, i.e. the set of integer points in $\\mathbb{R}^4$. Also, this is the unique normalized weight 2 modular form for $\\Gamma_0(2)$. This admits the description
            $$\\Theta_{D_4}(q) = 1 + 24 \\sum_{n>0} \\dfrac{nq^n}{1 + q^n} = 1 + 24q^2 + 24q^4 + 96q^6+\\ldots$$
        ` },
        { n: 8, file: 'theta_8.png', title: /* html */`<a href="https://oeis.org/A004009">A004009</a>: n = 8`, description:  /* html */`
            The theta function for the Barnes-Wall lattice in dimension 8 goes by many names. The lattice itself is the root lattice for the Lie algebra $E_8$, and its theta function is the Eisenstein series $E_4$, which along with the Eisenstein series $E_6$, generates the full space of modular forms. It admits a nice description
            $$E_4(q) = 1 + 240\\sum_{n \\geq 1} \\dfrac{n^3 q^n}{1 - q^n} = 1 + 240q^2 + 2160q^4 + 6720q^6 + \\ldots
            $$

        `},
        { n: 16, file: 'theta_16.png', title: /* html */`<a href="https://oeis.org/A008409">A008409</a>: n = 16`, description: /* html */`
        The Barnes-Wall lattice of dimension 16 is typically what one refers to as "the" Barnes-Wall lattice. Its theta series is
        $$1 + 4320q^2 + 61440q^3 + 522720q^4+\\ldots
        $$
        ` },
        { n: 32, file: 'theta_32.png', title: /* html */`<a href="https://oeis.org/A004670">A004670</a>: n = 32`, description: /* html */`
        Theta series for the Barnes-Wall lattice of dimension $n = 32$. This is a modular form of weight 16, which may be written as
        $$E_4^4-960\\Delta E_4 = 1 + 146880q^2 + 64757760q^3 + 4844836800q^4+\\ldots
        $$
        where $E_4$ is the Eisenstein series (with coefficients in A004009) and $\\Delta$ is the cusp form of weight 12.
        <!-- prec = 1000
e4 = eisenstein_series_qexp(4, prec, normalization = "integral");
delta = CuspForms(1, 12).0.q_expansion(prec);
g = (e4^4 - 960*delta*e4)
ls_g = list(g)
def f(z):
    if abs(z)>=1:
        return 0
    return exp(arg(sum(ls_g[i]*z^i for i in range(len(ls_g))))*I)
    plt = complex_plot(f,(-1,1),(-1,1),plot_points=200)
    plt.show(axes=False,aspect_ratio=1,figsize=[10,10]) -->
        `},
        { n: 64, file: 'theta_64.png', title: /* html */`<a href="https://oeis.org/A103936">A103936</a>: n = 64`, description: /* html */`
        Theta series for the Barnes-Wall lattice of dimension $n = 64$. This is given by
        $$1 + 9694080q^4 + 89754255360q^6 + 10164979630080q^7+\\ldots
        $$
        `},
        { n: 128, file: 'theta_128.png', title: /* html */`<a href="https://oeis.org/A100004">A100004</a>: n = 128`, description: /* html */`
        Theta series for the Barnes-Wall lattice of dimension $n = 128$. This is given by
        $$1+1260230400q^4+211691822284800q^6+167823813692620800q^7+\\ldots
        $$
        The noisiness in the image is largely due to the enormous size of the coefficients involved.
        `}
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

    function populateSequences(gridSelector, sequences) {
        const oeisGrid = document.querySelector(gridSelector);
        if (!oeisGrid || !sequences) return;

        sequences.forEach(sequence => {
            const sequenceDiv = document.createElement('div');
            sequenceDiv.classList.add('oeis-sequence');

            const idEl = document.createElement('div');
            idEl.className = 'sequence-id';
            idEl.textContent = sequence.id;

            const nameEl = document.createElement('div');
            nameEl.className = 'sequence-name';
            nameEl.textContent = sequence.name;

            sequenceDiv.appendChild(idEl);
            sequenceDiv.appendChild(nameEl);

            sequenceDiv.addEventListener('click', () => {
                window.open(`https://oeis.org/${sequence.id}`, '_blank');
            });

            oeisGrid.appendChild(sequenceDiv);
        });
    }

    populateSequences('.oeis-edits', editedSequences);
    populateSequences('.oeis-authored', authoredSequences);
    populateSequences('.oeis-favorite', favoriteSequences);

    // Collapsible sections
    const collapsibleSections = [
        { selector: '#knight-gallery', itemClass: 'gallery-item', itemMinWidth: 150 },
        { selector: '.oeis-edits', itemClass: 'oeis-sequence', itemMinWidth: 250 },
        { selector: '.oeis-authored', itemClass: 'oeis-sequence', itemMinWidth: 250 },
        { selector: '#theta-gallery', itemClass: 'gallery-item', itemMinWidth: 150 }
    ];

    // Collect per-section applyVisibility fns; register a single debounced resize handler
    const allApplyFns = [];

    collapsibleSections.forEach(({ selector, itemClass, itemMinWidth }) => {
        const section = document.querySelector(selector);
        if (!section) return;

        const items = Array.from(section.querySelectorAll(`.${itemClass}`));
        const toggleButton = section.parentElement.querySelector('.show-more');
        if (!toggleButton) return;

        const applyVisibility = () => {
            const sectionWidth = section.clientWidth;
            // Use the CSS minmax minimum width to compute columns reliably,
            // even before items have been laid out (when offsetWidth would be 0).
            const itemsPerRow = Math.max(1, Math.floor(sectionWidth / itemMinWidth));
            const totalRows = Math.ceil(items.length / itemsPerRow);

            items.forEach((item, index) => {
                const rowIndex = Math.floor(index / itemsPerRow);
                if (rowIndex === 0 || totalRows <= 2) {
                    item.style.display = 'block';
                    item.classList.add('visible');
                    item.classList.remove('hidden', 'obscured');
                } else if (rowIndex === 1) {
                    item.style.display = 'block';
                    item.classList.add('obscured');
                    item.classList.remove('hidden', 'visible');
                } else {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                    item.classList.remove('visible', 'obscured');
                }
            });

            toggleButton.style.display = totalRows <= 2 ? 'none' : 'inline-block';
        };

        toggleButton.addEventListener('click', () => {
            if (toggleButton.textContent === 'Show More') {
                items.forEach((item) => {
                    item.style.display = 'block';
                    item.classList.add('visible');
                    item.classList.remove('hidden', 'obscured');
                });
                toggleButton.textContent = 'Show Less';
            } else {
                applyVisibility();
                toggleButton.textContent = 'Show More';
            }
        });

        applyVisibility();
        allApplyFns.push(applyVisibility);
    });

    // Single debounced resize handler for all sections
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => allApplyFns.forEach(fn => fn()), 100);
    });
});
