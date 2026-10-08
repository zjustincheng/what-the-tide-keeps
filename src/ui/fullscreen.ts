// Full screen covers the whole game area, so the touch controls and equipment button stay reachable.
export function bindFullscreen() {
  const button = document.getElementById('fullscreen') as HTMLButtonElement;
  const area = document.querySelector('main')!;
  // Some browsers, such as Safari on iPhone, cannot put an element full screen.
  if (!document.fullscreenEnabled) { button.hidden = true; return; }
  const label = () => { button.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen'; };
  button.addEventListener('click', () => {
    const request = document.fullscreenElement ? document.exitFullscreen() : area.requestFullscreen();
    request.catch(() => { /* The browser refused; stay as we are. */ });
  });
  document.addEventListener('fullscreenchange', () => {
    label();
    // The map takes keyboard focus back so movement keys work right away.
    document.getElementById('game')?.focus({ preventScroll: true });
  });
  label();
}
