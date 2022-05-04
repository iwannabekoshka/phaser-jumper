import * as Phaser from "phaser";
import ASSETS from "./ASSETS";
import getAssetImageSizes from "../../utils/getAssetImageSizes";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../main";
import Carrot from "../../pickups/Carrot";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;

  /**
   * Группа платформ. Имеет тело, но не имеет гравитации
   * @type {Phaser.Physics.Arcade.StaticGroup}
   */
  platforms;

  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  carrots;

  /**
   * Количество собранных морковок
   * @type {number}
   */
  carrotsCollected = 0;

  /**
   * Текст количества собранных морковок
   * @type {Phaser.GameObjects.Text}
   */
  carrotsCollectedText;

  init() {
    this.resetScore();
  }

  preload() {
    // Background
    this.load.image(ASSETS.background.key, ASSETS.background.url);
    // Platform
    this.load.image(ASSETS.platform.key, ASSETS.platform.url);
    // Player
    this.load.image(ASSETS.playerStand.key, ASSETS.playerStand.url);
    this.load.image(ASSETS.playerJump.key, ASSETS.playerJump.url);
    // Carrots
    this.load.image(ASSETS.carrot.key, ASSETS.carrot.url);
    // Cursors
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    // Background
    this.add
      .image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, ASSETS.background.key)
      .setScrollFactor(1, 0);

    /* ---- PLATFORMS ----- */
    const PLATFORM_SPRITE_SIZES = getAssetImageSizes(this, ASSETS.platform.key);
    const PLATFORM_SCALE = 0.5;

    /**
     * Желаемые размеры платформы
     * @type {{width: number, height: number}}
     */
    const platformSizes = {
      width: PLATFORM_SPRITE_SIZES.width * PLATFORM_SCALE,
      height: PLATFORM_SPRITE_SIZES.height * PLATFORM_SCALE,
    };

    const PLATFORM_OFFSET_BETWEEN = 150;

    this.platforms = this.physics.add.staticGroup();

    /* ---- CARROT ----- */
    this.carrots = this.physics.add.group({
      classType: Carrot,
    });
    this.physics.add.collider(this.platforms, this.carrots);

    // Генерация платформ в цикле
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(
        platformSizes.width / 2,
        CANVAS_WIDTH - platformSizes.width / 2
      );
      const y = PLATFORM_OFFSET_BETWEEN * i;

      /**
       * Созданная платформа
       * @type {Phaser.Physics.Arcade.Sprite}}
       */
      const platform = this.platforms.create(x, y, ASSETS.platform.key);
      platform.scale = PLATFORM_SCALE;

      const body = platform.body;
      body.updateFromGameObject();

      this.addCarrotAbove(platform);
    }

    /* ---- PLAYER ----- */
    const PLAYER_SPRITE_SIZES = getAssetImageSizes(
      this,
      ASSETS.playerStand.key
    );
    const PLAYER_SCALE = 0.5;

    this.player = this.physics.add
      .sprite(240, 320, ASSETS.playerStand.key)
      .setScale(PLAYER_SCALE);

    // PLAYER-PLATFORM COLLISION
    this.physics.add.collider(this.platforms, this.player);

    // PLAYER-CARROT INTERACTION
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.collectCarrotHandler,
      undefined,
      this
    );

    // PLAYER будет иметь коллизию только при движении вниз
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    /* SCORE */
    /**
     * @type Phaser.Types.GameObjects.Text.TextStyle
     */
    const style = {
      color: "hsl(280, 100%, 50%)",
      fontSize: 24,
      fontFamily: "monospace",
    };
    this.carrotsCollectedText = this.add
      .text(10, 10, "Carrots: 0", style)
      .setScrollFactor(0);

    /* ---- CAMERA ----- */
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 2);
  }

  update(time, delta) {
    /* ---- PLAYER JUMP ----- */
    const PLAYER_JUMP_SPEED = 500;
    const playerTouchingDown = this.player.body.touching.down;

    if (playerTouchingDown) {
      this.player.setVelocityY(-1 * PLAYER_JUMP_SPEED);

      this.player.setTexture(ASSETS.playerJump.key);
    }

    const vy = this.player.body.velocity.y;
    if (vy > 0 && this.player.texture.key !== ASSETS.playerStand.key) {
      this.player.setTexture(ASSETS.playerStand.key);
    }

    /* ---- PLAYER HORIZONTAL WRAP ----- */
    const halfWidth = this.player.displayWidth / 2;
    const gameWidth = this.scale.width;

    if (this.player.x < -1 * halfWidth) {
      this.player.x = gameWidth + halfWidth;
    } else if (this.player.x > gameWidth + halfWidth) {
      this.player.x = -1 * halfWidth;
    }

    /* ---- PLATFORMS SCROLL ----- */
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;

      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + CANVAS_HEIGHT + 120) {
        platform.y = scrollY;
        platform.body.updateFromGameObject();

        this.addCarrotAbove(platform);
      }
    });

    /* ---- CHECK IF PLAYER FELL DOWN ---- */
    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start("gameOver", { score: this.carrotsCollected });
    }

    /* ---- KEYBOARD INPUTS ----- */
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }
  }

  resetScore() {
    this.carrotsCollected = 0;
  }

  /**
   * Добавляет морковку над платформой
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, y, ASSETS.carrot.key);

    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);

    carrot.body.setSize(carrot.width, carrot.height);

    this.physics.world.enable(carrot);

    return carrot;
  }

  collectCarrotHandler(player, carrot) {
    this.carrotsCollected++;
    this.carrotsCollectedText.text = `Carrots: ${this.carrotsCollected}`;

    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);

    this.findBottomMostPlatform();
  }

  /**
   * Возвращает нижнюю платформу
   * @returns {Phaser.GameObjects.GameObject}
   */
  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];

    for (let i = 1; i < platforms.length; i++) {
      const platform = platforms[i];
      if (platform.y < bottomPlatform.y) {
        continue;
      }

      bottomPlatform = platform;
    }

    return bottomPlatform;
  }
}
