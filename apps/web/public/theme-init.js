(function () {
  try {
    const stored = localStorage.getItem('theme');
    const theme = stored === 'light'
      ? 'light'
      : stored === 'dark'
        ? 'dark'
        : stored === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : 'dark';

    document.documentElement.classList.add(theme);
  } catch (_err) {
    document.documentElement.classList.add('dark');
  }
})();
