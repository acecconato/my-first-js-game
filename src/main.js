const Phaser = require('phaser');

import './assets/css/main.css';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
};

let game = new Phaser.Game(config);
let score = 0;
let scoreText;
let platforms;
let player;
let cursors;
let stars;
let bombs;
let gameOver;

function preload() {
    this.load.image('sky', './assets/img/sky.png');
    this.load.image('bomb', './assets/img/bomb.png');
    this.load.image('star', './assets/img/star.png');
    this.load.image('ground', './assets/img/platform.png');

    this.load.spritesheet('dude', './assets/img/dude.png', {frameWidth: 32, frameHeight: 48});
}

function create() {
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(300);

    player.anims.create({
        key: 'left',
        frames: player.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
        frameRate: 10,
    });

    player.anims.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20
    });

    player.anims.create({
        key: 'right',
        frameRate: 10,
        frames: player.anims.generateFrameNumbers('dude', {start: 5, end: 8})
    });

    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(player, platforms);

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70},
        gravityY: 300
    })

    stars.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#000'});

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, player, hitBomb, null, this);
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true);
        });

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
    this.add.text(config.width / 2, config.height / 2, 'Game Over', {fontSize: '32px'});
}

function update() {
    if (cursors.right.isDown) {
        player.body.setVelocityX(160);
        player.anims.play('right', true);

    } else if (cursors.left.isDown) {
        player.body.setVelocityX(-160);
        player.anims.play('left', true);

    } else {
        player.body.setVelocityX(0);
        player.anims.play('turn', true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.body.setVelocityY(-500);
    }
}

