import type { Story } from '../presentation/stories';
import { CinematicView } from './CinematicView';

// Endings use the same readable, player-paced scenes as the journey.
export class EndingView {
  private scene: CinematicView;
  constructor(story: Story, onClose: () => void) { this.scene = new CinematicView(story, onClose); }
  destroy() { this.scene.destroy(); }
}
