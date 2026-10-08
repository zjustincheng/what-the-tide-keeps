// Full screen covers the whole game area, so the touch controls stay reachable.
export const canFullscreen = () => document.fullscreenEnabled;

export function toggleFullscreen() {
  const request = document.fullscreenElement ? document.exitFullscreen() : document.querySelector('main')!.requestFullscreen();
  request.catch(() => { /* The browser refused; stay as we are. */ });
}

export function bindFullscreen() {
  const button = document.getElementById('fullscreen') as HTMLButtonElement;
  // Some browsers, such as Safari on iPhone, cannot put an element full screen.
  if (!canFullscreen()) { button.hidden = true; return; }
  button.addEventListener('click', toggleFullscreen);
  // F toggles full screen anywhere, unless a menu has keyboard focus.
  window.addEventListener('keydown', event => {
    if ((event.key === 'f' || event.key === 'F') && !event.repeat && !(event.target instanceof HTMLSelectElement)) toggleFullscreen();
  });
  const label = () => {
    const on = Boolean(document.fullscreenElement);
    button.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
    button.title = on ? 'Exit full screen (F)' : 'Full screen (F)';
  };
  document.addEventListener('fullscreenchange', () => {
    label();
    // The map takes keyboard focus back so movement keys work right away.
    document.getElementById('game')?.focus({ preventScroll: true });
  });
  label();
}
