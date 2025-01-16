export function header() {
    return /* html */`
    <div class="circle-container">
      <header>
        <div class="intro-highlight"></div> <!-- Highlight Element -->
        <div class="header-content">
          <h1>Andy Huchala</h1>
        </div>
      </header>

      <nav class="navbar">
        <button class="menu-button" aria-label="Toggle navigation">
          <div class="hamburger">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </button>
        <ul class="navbar-items">
          <li><a href="/index.html">Home</a></li>
          <li><a href="/gallery">Gallery</a></li>
          <li><a href="/research">Math Research</a></li>
          <li><a href="/teaching">Teaching</a></li>
          <li><a href="/oeis">OEIS</a></li>
        </ul>
        <div class="settings-container">
          <button class="settings-button" aria-label="Settings">
            ⚙️
          </button>
          <div class="settings-content">
            <label class="dark-mode-label">
              <span>Dark Mode</span>
              <div class="toggle">
                <input type="checkbox" id="dark-mode-btn" />
                <span class="slider"></span>
              </div>
            </label>
          </div>
        </div>
      </nav>

      <div class="gradient-bar"></div>
    </div>
    `;
}
