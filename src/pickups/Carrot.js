import * as Phaser from "phaser";

export default class Carrot extends Phaser.Physics.Arcade.Sprite {
  constructor(scent, x, y, texture) {
    super(scent, x, y, texture);

    this.setScale(0.5);
  }
}
