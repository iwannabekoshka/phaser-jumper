import "../styles/style.css";

import * as Phaser from "phaser";

import GameScene from "./scenes/game/GameScene";
import GameOverScene from "./scenes/gameOver/GameOverScene";

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;

export const GRAVITY_Y = 600;

export default new Phaser.Game({
  type: Phaser.CANVAS,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  canvas: document.querySelector("#game"),
  scene: [GameScene, GameOverScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: GRAVITY_Y,
      },
      debug: false,
    },
  },
});
