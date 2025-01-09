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

    const oeisSequences = [
        { id: "A000755", name: "No-3-in-line problem on n X n grid: total number of ways of placing 2n points on n X n grid so no 3 are in a line. No symmetries are taken into account." },
        { id: "A000983", name: "Size of minimal binary covering code of length n and covering radius 1." },
        { id: "A001197", name: "Zarankiewicz's problem k_2(n)." },
        { id: "A001839", name: "The coding-theoretic function A(n,4,3)." },
        { id: "A002564", name: "Number of different ways one can attack all squares on an n X n chessboard using the minimum number of queens." },
        { id: "A003192", name: "Length of uncrossed knight's path on an n X n board." },
        { id: "A004035", name: "The coding-theoretic function A(n,4,5)." },
        { id: "A004056", name: "The coding-theoretic function A(n,14,12)." },
        { id: "A005864", name: "The coding-theoretic function A(n,4)." },
        { id: "A006075", name: "Minimal number of knights needed to cover an n X n board." },
        { id: "A065825", name: "Smallest k such that n numbers may be picked in {1,...,k} with no three terms in arithmetic progression." },
        { id: "A070214", name: "Maximal number of occupied cells in all monotonic matrices of order n." },
        { id: "A072567", name: "A variant of Zarankiewicz problem: maximal number of 1s in n X n 01-matrix with no four 1s forming a rectangle." },
        { id: "A075324", name: "Independent domination number for queens' graph Q(n)." },
        { id: "A075458", name: "Domination number for queens' graph Q(n)." },
        { id: "A087329", name: "Independence numbers for KT_4 knight on hexagonal board." },
        { id: "A140859", name: "Border-domination number of queen graph for n X n board." },
        { id: "A157416", name: "Length of maximal uncrossed cycle of knight moves on n X n board." },
        { id: "A190394", name: "Maximum number of nonattacking nightriders on an n X n board." },
        { id: "A219760", name: "Martin Gardner's minimal no-3-in-a-line problem." },
        { id: "A247181", name: "Total domination number of the n-hypercube graph." },
        { id: "A250000", name: "Peaceable coexisting armies of queens: the maximum number m such that m white queens and m black queens can coexist on an n X n chessboard without attacking each other." },
        { id: "A251419", name: "Domination number of the n-triangle grid graph TG_n having n vertices along each side." },
        { id: "A251532", name: "Independence number of the n-triangular honeycomb obtuse knight graph." },
        { id: "A251534", name: "Domination number of the n-triangular honeycomb obtuse knight graph." },
        // { id: "A261752", name: "Minimum number of knights on an n X n chessboard such that every square is attacked." },
        { id: "A264041", name: "a(n) is the maximum number of diagonals that can be placed in an n X n grid made up of 1 X 1 unit squares when diagonals are placed in the unit squares in such a way that no two diagonals may cross or intersect at an endpoint." },
        { id: "A269706", name: "Size of a minimum dominating set (domination number) in an n X n X n grid." },
        { id: "A272651", name: "The no-3-in-line problem: maximal number of points from an n X n square grid so that no three lie on a line." },
        { id: "A274933", name: "Maximal number of non-attacking queens on a quarter chessboard containing n^2 squares." },
        { id: "A277433", name: "Martin Gardner's minimal no-3-in-a-line problem, all slopes version." },
        { id: "A279402", name: "Domination number for queen graph on an n X n toroidal board." },
        { id: "A279404", name: "Independent domination number for queens' graph on an n X n toroidal board." },
        { id: "A279405", name: "Peaceable coexisting armies of queens on a torus: the maximum number m such that m white queens and m black queens can coexist on an n X n toroidal chessboard without attacking each other." },
        { id: "A279407", name: "Domination number for knight graph on an n X n toroidal board." },
        { id: "A286882", name: "Number of minimal dominating sets in the n X n knight graph." },
        { id: "A287864", name: "Consider a symmetric pyramid-shaped chessboard with rows of squares of lengths n, n-2, n-4, ..., ending with either 2 or 1 squares; a(n) is the maximal number of mutually non-attacking queens that can be placed on this board." },
        { id: "A287867", name: "a(n) = floor(n/2) - A287864(n)." },
        { id: "A302401", name: "Total domination number of the n X n king graph." },
        { id: "A302486", name: "Total domination number of the n-triangular grid graph." },
        { id: "A303003", name: "Total domination number of the n X n queen graph." },
        { id: "A308632", name: "Largest aggressor for the maximum number of peaceable coexisting queens as given in A250000." },
        { id: "A328283", name: "The maximum number m such that m white, m black and m red queens can coexist on an n X n chessboard without attacking each other." },
        { id: "A335445", name: "Maximum number of rooks within an n X n chessboard, where each rook has a path to an edge." },
        { id: "A342374", name: "Total domination number of the n-triangular honeycomb obtuse knight graph." },
        { id: "A342576", name: "Independent domination number for knight graph on an n X n board." },
        { id: "A352241", name: "Maximal number of nonattacking black-square queens on an n X n chessboard." },
        { id: "A352426", name: "Maximal number of nonattacking white-square queens on an n X n chessboard." },
        { id: "A364665", name: "Lower independence number of the n-triangular honeycomb obtuse knight graph." },
        { id: "A364666", name: "Lower independence number of the n X n X n grid graph." },
        { id: "A364667", name: "Lower independence number of the n-diagonal intersection graph." },
        { id: "A364669", name: "Lower independence number of the hypercube graph Q_n." }
    ];
    
    

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
    const authoredSequences = [
        { id: "A351664", name: "Discriminants of imaginary quadratic fields with class number 26 (negated)." },
        { id: "A351665", name: "Discriminants of imaginary quadratic fields with class number 27 (negated)." },
        { id: "A351666", name: "Discriminants of imaginary quadratic fields with class number 28 (negated)." },
        { id: "A351667", name: "Discriminants of imaginary quadratic fields with class number 29 (negated)." },
        { id: "A351668", name: "Discriminants of imaginary quadratic fields with class number 30 (negated)." },
        { id: "A351669", name: "Discriminants of imaginary quadratic fields with class number 31 (negated)." },
        { id: "A351670", name: "Discriminants of imaginary quadratic fields with class number 32 (negated)." },
        { id: "A351671", name: "Discriminants of imaginary quadratic fields with class number 33 (negated)." },
        { id: "A351672", name: "Discriminants of imaginary quadratic fields with class number 34 (negated)." },
        { id: "A351673", name: "Discriminants of imaginary quadratic fields with class number 35 (negated)." },
        { id: "A351674", name: "Discriminants of imaginary quadratic fields with class number 36 (negated)." },
        { id: "A351675", name: "Discriminants of imaginary quadratic fields with class number 37 (negated)." },
        { id: "A351676", name: "Discriminants of imaginary quadratic fields with class number 38 (negated)." },
        { id: "A351677", name: "Discriminants of imaginary quadratic fields with class number 39 (negated)." },
        { id: "A351678", name: "Discriminants of imaginary quadratic fields with class number 40 (negated)." },
        { id: "A351679", name: "Discriminants of imaginary quadratic fields with class number 41 (negated)." },
        { id: "A351680", name: "Discriminants of imaginary quadratic fields with class number 42 (negated)." },
        { id: "A362875", name: "Theta series of 15-dimensional lattice Kappa_15." },
        { id: "A362876", name: "Theta series of 16-dimensional lattice Kappa_16." },
        { id: "A362877", name: "Theta series of 17-dimensional lattice Kappa_17." },
        { id: "A362878", name: "Theta series of 18-dimensional lattice Kappa_18." },
        { id: "A362879", name: "Theta series of 19-dimensional lattice Kappa_19." },
        { id: "A362880", name: "Theta series of 20-dimensional lattice Kappa_20." },
        { id: "A363147", name: "Primes q == 1 (mod 4) such that there is at least one equivalence class of quaternary quadratic forms of discriminant q not representing 2." },
        { id: "A363148", name: "a(n) gives the number of equivalence classes of quaternary quadratic forms of discriminant A363147(n) not representing 2." },
        { id: "A339248", name: "List of dimensions for which there exist several non-isomorphic irreducible representations of G2." },
        { id: "A339249", name: "List of dimensions for which there exist several non-isomorphic irreducible representations of F4." },
        { id: "A339250", name: "List of dimensions for which there exist several non-isomorphic irreducible representations of E6." },
        { id: "A339251", name: "List of dimensions for which there exist several non-isomorphic irreducible representations of E7." },
        { id: "A343266", name: "List of dimensions for which there exist 8 or more non-isomorphic irreducible representations of E6." },
        { id: "A345657", name: "Theta series of the canonical laminated lattice LAMBDA_26." },
        { id: "A345658", name: "Theta series of the canonical laminated lattice LAMBDA_27." },
        { id: "A345659", name: "Theta series of the canonical laminated lattice LAMBDA_28." },
        { id: "A345660", name: "Theta series of the canonical laminated lattice LAMBDA_29." },
        { id: "A345661", name: "Theta series of the canonical laminated lattice LAMBDA_30." },
        { id: "A345662", name: "Theta series of the canonical laminated lattice LAMBDA_31." },
        { id: "A352095", name: "Dimension of the space of Siegel cusp forms of genus 3 and weight 2n." },
    ];

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
