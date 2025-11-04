// File: /components/gallery.js

export const images = [
    {
      thumbnail: '/images/thumbnails/zetafunction.webp',
      full: '/images/gallery/zetafunction.png',
      alt: 'Zeta Function',
      title: 'Zeta Function',
      description: /* html */`
        <p>Complex plot of the Hasse-Weil zeta function of a complete intersection of a cubic and a quadric over $\\mathbb F_{17}$. I wrote the code for the complex arithmetic used to render this on 
        <a href="https://cruzgodar.com/applets/complex-maps/?glsl-textarea=cdiv%28ONE-4.0*cpow%28z%252C1.0%29%252B3.0*cpow%28z%252C2.0%29%2520-%252011.0*cpow%28z%252C3.0%29%2520%252B%2520120.0*cpow%28z%252C4.0%29%2520-%2520187.0*cpow%28z%252C5.0%29%2520%252B%2520867.0*cpow%28z%252C6.0%29%2520-%252019652.0*cpow%28z%252C7.0%29%2520%252B%252083521.0*cpow%28z%252C8.0%29%252Ccmul%28ONE-z%252CONE-17.0*z%29%29%252F1.0">Cruz Godar's website.</a>
        </p>
      `
    },
    {
      thumbnail: '/images/thumbnails/tile.webp',
      full: '/images/gallery/tile.PNG',
      alt: 'Tile Pattern',
      title: 'Tile Pattern',
      description: /* html */`
        <p>A tiled image where each box was an abelian sandpile constrained 
        to a smaller box than normal (with no sink).
        </p>
      `
    },
    {
      thumbnail: '/images/thumbnails/museum_small.webp',
      full: '/images/gallery/museum_small.PNG',
      alt: 'Museum 9k',
      title: 'Museum Submission',
      description: /* html */`
        <p>A $9,000 \\times 9,000$ abelian sandpile with millions of grains. This, along with a zoomed 
        in version, was originally submitted to the Jordan Schnitzer Museum of Art in 2020 and was 
        <a href="https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885">displayed in their virtual gallery</a> 
        until the museum was able to resume in-person operation in 2021. Also currently on display in gate A 
        of the Eugene airport. It was also 
        <a href="https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf">
        published in Girls' Angle magazine</a>, a magazine aimed to increase engagement of girls in math.</p>
        
        <p><em>Original Caption: This piece attempts to capture the spirit of the infinite and print it on a 
        single page. It uses what's called an Abelian Sandpile model, which is a fractal that colors "grains 
        of sand" by their slope. A fractal is a kind of mathematical picture with a repeated motif no matter 
        how far in or out you zoom. The Abelian Sandpile model achieves this by stacking a large number of 
        grains of sand in the center of a grid, and then "topples" it onto the adjacent 4 tiles. The taller 
        the pile of sand at the start, the more times you can topple, and the closer to the illusion of infinity 
        you get. Adding color depicting the different heights of sand helps us visualize the resulting fractal 
        structure.
        </em></p>
      `
    },
    {
      thumbnail: '/images/thumbnails/billion_center.webp',
      full: '/images/gallery/billion_center.png',
      alt: 'Billion Center',
      title: 'Billion Center',
      description: /* html */`
        <p>When toppling a billion (actually $2^{30}$) grains of sand, the center of an abelian sandpile 
        revealed an interesting mandala-like pattern at high zoom and resolution. This image was 
        <a href="https://mpembed.com/show/?m=FGvT8EzPQpy&mpu=885">also displayed in the JSMA virtual gallery</a> 
        and <a href="https://www.girlsangle.org/page/bulletin-archive/GABv15n01E.pdf">appeared in Girls' Angle magazine</a>.
        </p>
      `
    },
    {
      thumbnail: '/images/thumbnails/hex.webp',
      full: '/images/gallery/hex.png',
      alt: 'Cross Pattern',
      title: 'Cross Pattern',
      description: /* html */`
        <p>A sandpile with little room to topple (and no sink). A tiled version of a similar image appears
        later in the gallery.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/broken.webp',
      full: '/images/gallery/broken.png',
      alt: 'Race Condition',
      title: 'Race Condition',
      description: /* html */`
        <p>An abelian sandpile implementation that accidentally had a race condition. I terminated the 
        program early when I realized it was bugged, and it made this unique pattern. The multiple bands 
        are from coloring the tile height mod 4.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/char2,5.webp',
      full: '/images/gallery/char2,5.png',
      alt: 'Char2,5',
      title: 'Character (2,5)',
      description: /* html */`
        <p>
        The character formula of the Lie algebra $\\mathfrak{su}(3)$ with highest weight $(2,5)$ plotted 
        in Sage. I've since written 
        <a href="https://cruzgodar.com/applets/complex-maps/?glsl-textarea=su3_character%285%252C2%252Cz%29">
        an implementation in glsl</a> which can generate this image and many others.
        </p>
      `
    },
    {
      thumbnail: '/images/thumbnails/julia.webp',
      full: '/images/gallery/julia.png',
      alt: 'Julia',
      title: 'Julia Set',
      description: /* html */`
        <p>A sandpile run through GNU Image Manipulation Program (GIMP)'s Julia filter.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/creepymagnet.webp',
      full: '/images/gallery/creepymagnet.png',
      alt: 'Creepy Magnet',
      title: 'Creepy Magnet',
      description: /* html */`
        <p>
        The Ising model is a way to simulate ferromagnetism by labeling points on a grid as up or down. 
        A higher temperature means more randomness, so as the metal cools it picks a direction (ferromagnetism). 
        As this simulation approached its critical point it appeared to have a preference for spookiness.
        </p>
      `
    },
    {
      thumbnail: '/images/thumbnails/husky.webp',
      full: '/images/gallery/husky.png',
      alt: 'Husky',
      title: 'Husky Pattern',
      description: /* html */`
        <p>A sandpile a little too big for its bounding box.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/inverse_constant.webp',
      full: '/images/gallery/inverse_constant.png',
      alt: 'Inverse Constant',
      title: 'Inverse Constant',
      description: /* html */`
        <p>This appears to be one over the weierstrass function of $z$, but the angle $\\tau$ is unknown to me.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/ising.webp',
      full: '/images/gallery/ising.png',
      alt: 'Ising',
      title: 'Ising Model',
      description: /* html */`
        <p>The Ising model doing its best imitation of a Zebra notebook.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/cracked.webp',
      full: '/images/gallery/cracked.PNG',
      alt: 'Cracked',
      title: 'Cracked Glass',
      description: /* html */`
        <p> Another race condition in an abelian sandpile implementation, causing an asymmetry in toppling. 
        It terminated early and produced this cracked-screen-like image. The bands of color are from coloring 
        pile height mod 4 (some piles remained taller than 4).</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/julia_3.webp',
      full: '/images/gallery/julia_3.PNG',
      alt: 'Julia 3',
      title: 'Julia Variant',
      description: /* html */`
        <p>Another sandpile run through GIMP's Julia filter.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/tile2.webp',
      full: '/images/gallery/tile2.PNG',
      alt: 'Tile Pattern 2',
      title: 'Tile Pattern II',
      description: /* html */`
        <p>Tiling a sandpile similar to the cross pattern.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/knight31.webp',
      full: '/images/gallery/knight31.PNG',
      alt: 'Knight31',
      title: 'Knight31',
      description: /* html */`
        <p>An optimal solution to the Knight's Domination problem. To my knowledge it’s the largest known solution 
        on an odd-dimensional board.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/sand23_3k.webp',
      full: '/images/gallery/sand23_3k.png',
      alt: 'Sand 3k',
      title: 'Sand 3k',
      description: /* html */`
        <p>A $3,000 \\times 3,000$ sandpile that was also a little bit too big for its bounding box.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/inverse_wp.webp',
      full: '/images/gallery/inverse_wp.png',
      alt: 'Weierstrass Inverse',
      title: 'Weierstrass',
      description: /* html */`
        <p>I implemented the weierstrass $\\wp$-function and its inverse on 
        <a href="https://cruzgodar.com/applets/complex-maps/?glsl-textarea=-wp%28z%252Crho%29">Cruz's website</a>. 
        Computing the $\\wp$-function was straightforward enough, but the inverse required a lot of thinking outside 
        the box. This image compares $\\wp$ and its inverse to the identity map.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/colormap2.webp',
      full: '/images/gallery/colormap2.png',
      alt: 'Knight\'s Domination',
      title: 'Knight\'s Domination',
      description: /* html */`
        <p>In undergrad I investigated <a href="https://oeis.org/A261752">OEIS A261752</a>: Minimum number of knights 
        on an n x n chessboard such that every square is attacked. This is a colormap of those data, i.e. the domination 
        number of the $(i \\times j)$ knight graph is encoded as the color of pixel $(i,j)$.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/lattice_weierstrass.webp',
      full: '/images/gallery/lattice_weierstrass.png',
      alt: 'Weierstrass Lattice',
      title: 'Weierstrass Lattice',
      description: /* html */`
        <p>A plot of the weierstrass $\\wp$-function when $g_2=0$, $g_3=\\frac{-9}{16}$ 
        (i.e. a plot of $-\\wp(z,1,\\rho)$ where $\\rho = e^{2\\pi i/3}$). This image is from Sage, 
        but I've <a href="https://cruzgodar.com/applets/complex-maps/?glsl-textarea=-wp%28z%252Crho%29">
        implemented it in glsl on Cruz's site</a> as well.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/theta_4.webp',
      full: '/images/gallery/theta_4.png',
      alt: 'Theta 4',
      title: 'Theta 4',
      description: /* html */`
        <p>A plot of the <a href="https://oeis.org/A004011">theta function of the Barnes-Wall lattice in dimension 4</a>. 
        A theta function counts the number of points in a lattice of squared length n from the origin. 
        For example, on a 2D square lattice, there is one point of square norm zero (the origin), four points 
        of square norm 1, four of square norm 2, etc.</p>
      `
    },
    {
      thumbnail: '/images/thumbnails/graphene.webp',
      full: '/images/gallery/graphene.png',
      alt: 'Graphene',
      title: 'Graphene',
      description: /* html */`
        <p>A microscope image from when I worked in the graphene lab at UW. I was performing mechanical exfoliation 
        (i.e., glorified scotch-taping) to isolate potential graphene samples. This image likely wasn't viable 
        for the physicists' superconductivity research, but it looks neat!</p>
      `
    }
  ];
  