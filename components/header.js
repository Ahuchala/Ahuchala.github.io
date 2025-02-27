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
                <!-- SVG from https://www.svgrepo.com/svg/178267/settings-cogwheel -->
                <svg style="width: 50px; height: 50 px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(270)matrix(-1, 0, 0, -1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.255 4.18806C9.84269 5.17755 8.68655 5.62456 7.71327 5.17535C6.10289 4.4321 4.4321 6.10289 5.17535 7.71327C5.62456 8.68655 5.17755 9.84269 4.18806 10.255C2.63693 10.9013 2.63693 13.0987 4.18806 13.745C5.17755 14.1573 5.62456 15.3135 5.17535 16.2867C4.4321 17.8971 6.10289 19.5679 7.71327 18.8246C8.68655 18.3754 9.84269 18.8224 10.255 19.8119C10.9013 21.3631 13.0987 21.3631 13.745 19.8119C14.1573 18.8224 15.3135 18.3754 16.2867 18.8246C17.8971 19.5679 19.5679 17.8971 18.8246 16.2867C18.3754 15.3135 18.8224 14.1573 19.8119 13.745C21.3631 13.0987 21.3631 10.9013 19.8119 10.255C18.8224 9.84269 18.3754 8.68655 18.8246 7.71327C19.5679 6.10289 17.8971 4.4321 16.2867 5.17535C15.3135 5.62456 14.1573 5.17755 13.745 4.18806C13.0987 2.63693 10.9013 2.63693 10.255 4.18806Z" stroke="#f4f6fa" stroke-width="0.9600000000000002" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#f4f6fa" stroke-width="0.9600000000000002"></path> </g></svg>
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
  