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
        <p>A $9,000 \\times 9,000$ abelian sandpile with millions of grains. This, along with a zoomed in version, was originally submitted to the Jordan Schnitzer Museum of Art in 2020 and was <a href="https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885">displayed in their virtual gallery</a> until the museum was able to resume in-person operation in 2021. Also currently on display in gate A of the Eugene airport. It was also <a href="https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf">published in Girls\' Angle magazine</a>, a magazine aimed to increase engagement of girls in math.</p>
        
        <p><em>Original Caption: This piece attempts to capture the spirit of the infinite and print it on a single page. It uses what's called an Abelian Sandpile model, which is a fractal that colors "grains of sand" by their slope. A fractal is a kind of
mathematical picture with a repeated motif no matter how far in or out you zoom. The Abelian Sandpile model achieves this by stacking a large number of grains of sand in the center of a grid, and then "topples" it onto
the adjacent 4 tiles. The taller the pile of sand at the start, the more times you can topple, and the closer to the illusion of infinity you get. Adding color depicting the different heights of sand helps us visualize the
resulting fractal structure.
    </em>
        </p>
        `
    },
    { 
        thumbnail: '/images/thumbnails/billion_center.webp', 
        full: '/images/gallery/billion_center.png', 
        alt: 'Billion Center', 
        title: 'Billion Center', 
        description: 
        /* html */`
        <p>When toppling a billion (actually $2^{30}$) grains of sand, the center of an abelian sandpile revealed an interesting mandala-like pattern at high zoom and resolution. This image was <a href="https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885">also displayed in the JSMA virtual gallery</a> and <a href="https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf">appeared in Girls\' Angle magazine</a>.
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
        description: 
        /* html */`
        <p>
        The character formula of the Lie algebra SU(3) with highest weight (2,5) plotted in Sage. I've since written <a href="https://cruzgodar.com/applets/complex-maps/?glsl-textarea=su3_character%285%252C2%252Cz%29">an implementation in glsl on Cruz's website</a> which can generate this image and many others.
    </p>
        `
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
        description: 
        /* html */`
        <p>
        The Ising model is a way to simulate ferromagnetism by looking at points on a rectangular grid and labeling them as either up or down, and then setting rules for them to try to agree with their neighbors dictated by temperature. A higher temperature means higher randomness (hence less correlation among neighbors), and as the metal cools, it reaches a critical point where it tends to spontaneously pick a preference towards having all atoms pointing in a particular direction. As this particular simulation approached its critical point it appeared to have a preference for spookiness.
    </p>
        `
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
        description: 'This appears to be one over the weierstrass function of z, but the angle tau is unknown to me.' 
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
        description:
        /* html */`
        <p> Another race condition in an abelian sandpile implementation, this one caused an asymmetry in toppling. It terminated early and produced this image which bizarrely looks like a cracked screen. The bands of color are from coloring pile height mod 4 (since some piles still remained taller than 4).
        </p>`
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
        description: 
        /* html */`
        <p>A $3,000 \\times 3,000$ sandpile that was also a little bit too big for its bounding box.
        </p>
        `
    },
    { 
        thumbnail: '/images/thumbnails/inverse_wp.webp', 
        full: '/images/gallery/inverse_wp.png', 
        alt: 'Weierstrass Inverse', 
        title: 'Weierstrass', 
        description: 
        /* html */`
        <p>I implemented the weierstrass $\\wp$-function and its inverse on <a href="cgodar.com">Cruz's website</a>. Computing the $\\wp$-function was straightforward enough, but the inverse required a lot of thinking outside the box. There was a region ($|z|>1$) which converged nicely, but for small moduli I decided to use gradient descent to approximate an inverse. Comparing the composition of the $\\wp$-function and its inverse to the identity map produced this image. 
    </p>
        `
    },
    { 
        thumbnail: '/images/thumbnails/colormap2.webp', 
        full: '/images/gallery/colormap2.png', 
        alt: 'Knight\'s Domination', 
        title: 'Knight\'s Domination', 
        description: 
        /* html */`
        <p>In undergrad I investigated <a href="https://oeis.org/A261752">OEIS A261752: Minimum number of knights on an n x n chessboard such that every square is attacked</a> and its generalizations to m x n boards. This is a colormap of that data, i.e. the domination number of the $i \\times j$ knight graph is encoded as the color of pixel $(i,j)$.
    </p>
        `
    },
    { 
        thumbnail: '/images/thumbnails/lattice_weierstrass.webp', 
        full: '/images/gallery/lattice_weierstrass.png', 
        alt: 'Weierstrass Lattice', 
        title: 'Weierstrass Lattice', 
        description: 
        /* html */`
        <p>A plot of the weierstrass $\\wp$-function when $g_2=0$, $g_3=\\frac{-9}{16}$ (i.e. a plot of $-\\wp(z,1,\\rho)$ where $\\rho = e^{2\\pi i/3}$). This image is from Sage, but I've <a href="https://cruzgodar.com/applets/complex-maps/?glsl-textarea=-wp%28z%252Crho%29">implemented it in glsl on Cruz's website</a> as well (just click generate!).
    </p>
        `
    },
    { 
        thumbnail: '/images/thumbnails/theta_4.webp', 
        full: '/images/gallery/theta_4.png', 
        alt: 'Theta 4', 
        title: 'Theta 4', 
        description: 
        /* html */`
        <p>A plot of the <a href=" A004011">theta function of the Barnes-Wall lattice in dimension 4</a>. A theta function counts the number of points in a lattice of squared length n from the origin. For example, on a 2D square lattice, there is one point of square norm zero (the origin), four points of square norm 1 (corresponding to the four cardinal directions), four points of square norm 2 (explicitly $(1,1), (1,-1), (-1,1), (-1,-1)$, and so on.) <a href="https://oeis.org/A004018">The theta function of a 2D square lattice</a> is $1 + 4q + 4q^2 + $....
    </p>
        `
    },
    { 
        thumbnail: '/images/thumbnails/graphene.webp', 
        full: '/images/gallery/graphene.png', 
        alt: 'Graphene', 
        title: 'Graphene', 
        description: 
        /* html */`
        <p>A bonus image from a scope when I worked at the graphene lab at UW. Initially I was tasked with performing mechanical exfoliation (glorified scotch-taping) to procure possible viable samples of graphene, purifying the silicon wafer of tape residue (the blue-whiteish streaks in the picture), and then manually searching for graphene (the purple shape at the very center of the screen). Eventually I moved on to helping the lab develop computer vision software to automatically search for graphene.
    </p>
    <p>This particular specimen was probably too close to the surrounding thicker clumps of carbon to be extracted for the solid state physicists to use as a superconductor, but I thought the image was neat.
    </p>
        `
    }
];