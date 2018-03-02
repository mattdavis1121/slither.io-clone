Game = function () {
};

Game.prototype = {
    preload: function () {
        this.game.load.image('circle', 'asset/circle.png');
        this.game.load.image('background', 'asset/tile.png');

        this.game.load.image('eye-white', 'asset/eye-white.png');
    	this.game.load.image('eye-black', 'asset/eye-black.png');
    },
    create: function () {
        this.cameraUtil = new CameraUtil(this.game);

        var width = this.game.width;
        var height = this.game.height;

        this.game.world.setBounds(-width, -height, width * 2, height * 2);  // Squares game world size - 1x1 becomes 2x2
        this.game.stage.backgroundColor = '#444';

        // add background
        var background = this.game.add.tileSprite(-width, -height,
            this.game.world.width, this.game.world.height, 'background');

        this.game.physics.startSystem(Phaser.Physics.P2JS);

        this.game.snakes = [];

        // create player
        var snake = new PlayerSnake(this.game, 'circle', 0, 0);
        this.game.camera.follow(snake.head);

        new BotSnake(this.game, 'circle', -200, 0);
        new BotSnake(this.game, 'circle', 200, 0);
    },
    update: function () {
        this.cameraUtil.update();

        // update snakes
        this.game.snakes.forEach(function(snake) {
            snake.update();
        });
    }
};