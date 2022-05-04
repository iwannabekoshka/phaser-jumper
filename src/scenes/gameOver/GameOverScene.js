import * as Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("gameOver");
  }

  /**
   * Текст конца игры
   * @type {Phaser.GameObjects.Text}
   */
  text;

  /**
   * Результат, полученный со сцены "game"
   * @type {number}
   */
  score;

  /**
   * Текст с результатом
   * @type {Phaser.GameObjects.Text}
   */
  scoreText;

  init(data) {
    this.score = data.score;
  }

  create() {
    this.drawText();
    this.startAgainHandler();
  }

  drawText() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.text = this.add
      .text(width / 2, height / 2, "Game Over", {
        fontSize: 48,
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(
        width / 2,
        height / 2 + this.text.height + 10,
        `Score: ${this.score}`,
        {
          fontSize: 48,
        }
      )
      .setOrigin(0.5);
  }

  startAgainHandler() {
    this.input.keyboard.once("keydown", (e) => {
      this.scene.start("game");
    });
  }
}
