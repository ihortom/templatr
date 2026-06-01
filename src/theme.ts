// Applies the active colour scheme to Bootstrap via the `data-bs-theme`
// attribute. Electron's `nativeTheme.themeSource` overrides what the renderer
// reports for `prefers-color-scheme`, so reading the media query keeps both the
// "system" and the explicit light/dark overrides in sync automatically.

const darkModeQuery = (): MediaQueryList =>
    window.matchMedia('(prefers-color-scheme: dark)');

export const applyTheme = (): void => {
    document.documentElement.setAttribute(
        'data-bs-theme',
        darkModeQuery().matches ? 'dark' : 'light'
    );
};

// Keeps the theme in sync with later changes (system appearance switch or the
// in-app toggle). Returns a cleanup function to remove the listener.
export const watchTheme = (): (() => void) => {
    applyTheme();
    const query = darkModeQuery();
    query.addEventListener('change', applyTheme);
    return () => query.removeEventListener('change', applyTheme);
};
