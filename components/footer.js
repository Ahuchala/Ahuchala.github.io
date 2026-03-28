export function footer() {
  const year = new Date().getFullYear()
  return /* html */`
    <div class="gradient-bar"></div>

    <div class="footer-content">
      <p>&copy; ${year} Andy Huchala |
        <a class="footer-button" href="/">Home</a>
      </p>
    </div>

    <div class="gradient-bar"></div>
  `
}
