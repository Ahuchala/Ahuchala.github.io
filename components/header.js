export function header() {
    return /* html */`
        <header>
        <div class="intro-highlight"></div> <!-- Highlight Element -->

            <div class="header-content">
                <h1>Andy Huchala</h1>
            </div>
        </header>
        <!-- disabled since the gradient bar disagrees with header. WHY -->
        <!-- <div class="gradient-bar"></div>  -->

        <nav class="navbar">
            <button class="menu-button" aria-label="Toggle navigation">
                <div class="hamburger">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <span class="hamburger-label">Menu</span>
            </button>
            <ul>
                <li><a href="/index.html">Home</a></li>
                <li><a href="/gallery">Gallery</a></li>
                <li><a href="/research">Math Research</a></li>
                <li><a href="/teaching">Teaching</a></li>
                <li><a href="/oeis">OEIS</a></li>
            </ul>
        </nav>

        <div class="gradient-bar"></div> 

    `;
}
