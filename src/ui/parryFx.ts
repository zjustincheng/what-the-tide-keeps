import type { Dodge } from '../rules/battle';

// The parry screen's effects: a slash as it opens, the path from circle to circle, each circle popping in,
// a burst of sparks where one is struck, a crack where one is missed, and the clash or the blow at the end.
// With reduced motion, only fades: nothing shakes, flies, or flashes.
const moving = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE_OUT = 'cubic-bezier(.2,.9,.3,1.2)';

export function enter(screen: HTMLElement, heading: HTMLElement, field: HTMLElement) {
  screen.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
  if (!moving()) return;
  heading.animate([
    { transform: 'translateY(-18px) scale(1.35)', opacity: 0, letterSpacing: '.35em' },
    { transform: 'translateY(0) scale(1)', opacity: 1, letterSpacing: '0em' },
  ], { duration: 280, easing: EASE_OUT });
  field.animate([{ transform: 'scale(1.08)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 240, easing: 'ease-out' });
  // A blade's streak across the screen as it opens.
  const slash = document.createElement('span'); slash.className = 'parry-slash';
  screen.append(slash);
  slash.animate([{ transform: 'translateX(-130%) rotate(-18deg)', opacity: 0 }, { opacity: 1, offset: .3 }, { transform: 'translateX(130%) rotate(-18deg)', opacity: 0 }], { duration: 420, easing: 'ease-in' })
    .finished.then(() => slash.remove(), () => slash.remove());
}

// The path from 1 to 2 to 3, drawn a stretch at a time as each next circle appears.
export function trace(field: HTMLElement, layout: readonly (readonly [number, number])[], appear: readonly number[]) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'parry-path'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
  layout.slice(1).forEach(([x, y], i) => {
    const [fx, fy] = layout[i];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(fx * 100)); line.setAttribute('y1', String(fy * 100));
    line.setAttribute('x2', String(x * 100)); line.setAttribute('y2', String(y * 100));
    line.setAttribute('pathLength', '1'); line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(line);
    line.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 260, delay: appear[i + 1], easing: 'ease-out', fill: 'both' });
  });
  field.prepend(svg);
}

export function popIn(circle: HTMLElement) {
  circle.animate(moving()
    ? [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .65 }, { transform: 'scale(1)', opacity: 1 }]
    : [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
}

// Where a circle was struck: a shockwave, sparks, and the word for how well. Missed, it cracks red and the screen jolts.
export function burst(field: HTMLElement, circle: HTMLElement, result: Dodge) {
  const at = { left: circle.style.left, top: circle.style.top };
  const place = (element: HTMLElement) => { element.style.left = at.left; element.style.top = at.top; field.append(element); return element; };
  const gone = (animation: Animation, element: Element) => animation.finished.then(() => element.remove(), () => element.remove());
  const word = place(document.createElement('span'));
  word.className = 'parry-word'; word.dataset.result = result;
  word.textContent = result === 'perfect' ? 'PERFECT' : result === 'graze' ? 'GRAZE' : 'MISS';
  gone(word.animate([{ transform: 'translate(-50%, -40px) scale(.8)', opacity: 0 }, { transform: 'translate(-50%, -58px) scale(1.1)', opacity: 1, offset: .25 }, { transform: 'translate(-50%, -84px) scale(1)', opacity: 0 }], { duration: 650, easing: 'ease-out' }), word);
  if (!moving()) return;
  if (result === 'miss') {
    circle.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px) rotate(-6deg)' }, { transform: 'translateX(6px) rotate(6deg)' }, { transform: 'translateX(0)' }], { duration: 240 });
    field.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-8px,4px)' }, { transform: 'translate(7px,-5px)' }, { transform: 'translate(-4px,2px)' }, { transform: 'translate(0,0)' }], { duration: 300 });
    return;
  }
  const wave = place(document.createElement('span')); wave.className = 'parry-wave'; wave.dataset.result = result;
  gone(wave.animate([{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(2.8)', opacity: 0 }], { duration: 420, easing: 'ease-out' }), wave);
  const sparks = result === 'perfect' ? 10 : 5;
  for (let i = 0; i < sparks; i++) {
    const spark = place(document.createElement('span')); spark.className = 'parry-spark'; spark.dataset.result = result;
    const angle = (i / sparks) * Math.PI * 2 + i * 0.37, reach = 46 + (i % 3) * 14;
    gone(spark.animate([
      { transform: 'translate(-50%,-50%) translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(-50%,-50%) translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach}px) scale(.2)`, opacity: 0 },
    ], { duration: 380 + (i % 4) * 40, easing: 'cubic-bezier(.1,.8,.3,1)' }), spark);
  }
  circle.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.28)', offset: .4 }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
}

// How long the screen stays after the parry resolves, while its end plays.
export const OUTRO = 520;

// The end: a clash and the word, if every circle held; the blow, if one didn't. Then the screen fades.
export function finish(screen: HTMLElement, result: Dodge) {
  screen.style.pointerEvents = 'none';
  const word = document.createElement('p'); word.className = 'parry-verdict'; word.dataset.result = result;
  word.textContent = result === 'perfect' ? 'PARRIED' : result === 'graze' ? 'GRAZED' : 'IT LANDS';
  screen.append(word);
  if (moving()) {
    word.animate([{ transform: 'scale(2.2)', opacity: 0 }, { transform: 'scale(.95)', opacity: 1, offset: .35 }, { transform: 'scale(1)', opacity: 1 }], { duration: 360, easing: EASE_OUT });
    const flash = document.createElement('span'); flash.className = 'parry-flash'; flash.dataset.result = result; screen.append(flash);
    flash.animate([{ opacity: result === 'miss' ? .55 : .7 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' });
    if (result === 'miss') screen.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-12px,6px)' }, { transform: 'translate(10px,-8px)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(0,0)' }], { duration: 340 });
  }
  screen.animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: OUTRO, fill: 'forwards' });
}
