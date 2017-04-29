import { on, off, debounce } from '../core/utils';
import appState from '../core/state';


const DOWN = 'DOWN';
const UP = 'UP';
const STAGNANT = 'STAGNANT';

function getDefaultSpeed() {
  return window.innerHeight * 0.61 * 2;
}

// function toBottom() {
//   const container = appState.get('containerElement');
//   const screen = appState.get('screenElement');
//   const minTop = screen.offsetHeight - container.offsetHeight;
//   container.style.top = `${minTop}px`;
// }

class ScrollbarHandler {

  constructor() {
    this.wheelHandler = this.wheelHandler.bind(this);
    this.status = STAGNANT;
    this.timeSlot = 20;
  }

  setupParameter() {
    const container = appState.get('containerElement');
    this.speed = getDefaultSpeed();
    this.maxTop = container.offsetTop;
  }

  on() {
    on(window, 'wheel', this.wheelHandler());
    this.setupParameter();
  }

  off() {
    off(window, 'wheel', this.wheelHandler());
  }

  wheelHandler() {
    return debounce((event) => {
      this.event = event;
      if (this.status !== STAGNANT) {
        if (this.shouldDown() && this.status === DOWN) {
          this.speed += getDefaultSpeed();
          return;
        }
        if (!this.shouldDown() && this.status === UP) {
          this.speed += getDefaultSpeed();
          return;
        }
        this.speed -= getDefaultSpeed();
      } else {
        this.run();
      }
    }, {
      prefunc(event) {
        event.preventDefault();
      },
      timespan: 50,
    });
  }

  down(distance) {
    this.status = DOWN;
    this.setPosition(-1 * distance);
  }

  up(distance) {
    this.status = UP;
    this.setPosition(distance);
  }

  run() {
    let tm;
    const k = this.timeSlot / 1000;
    const decrease = this.speed * k;

    const loop = () => {
      if (this.speed < 1) {
        this.status = STAGNANT;
        clearTimeout(tm);
        this.setupParameter();
        return;
      }

      const nextSpeed = this.speed - decrease;
      const distance = ((this.speed + nextSpeed) * k) / 2;
      this.speed = nextSpeed;

      if (this.shouldDown()) {
        this.down(distance);
      } else {
        this.up(distance);
      }

      tm = setTimeout(() => {
        loop();
      }, this.timeSlot);
    };

    loop();
  }

  shouldDown() {
    return this.event.deltaY > 0;
  }

  setPosition(move) {
    const container = appState.get('containerElement');
    const screen = appState.get('screenElement');
    const minTop = screen.offsetHeight - container.offsetHeight;
    const currentTop = Number(container.style.top.replace('px', '')) || 0;

    let target = currentTop + move;
    if (target > 0) {
      target = 0;
      this.speed = 0;
    }
    if (target < minTop) {
      target = minTop;
      this.speed = 0;
    }
    container.style.top = `${target}px`;
    appState.trigger('wheel');
  }

  toBottom() { // eslint-disable-line class-methods-use-this
    const container = appState.get('containerElement');
    const screen = appState.get('screenElement');
    const minTop = screen.offsetHeight - container.offsetHeight;
    container.style.top = `${minTop}px`;
  }

}

export default ScrollbarHandler;
