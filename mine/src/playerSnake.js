PlayerSnake = function(game, spriteKey, x, y) {
    Snake.call(this, game, spriteKey, x, y);
    this.cursors = game.input.keyboard.createCursorKeys();
    this.wasd = {
        up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
    };
    console.log(this.cursors);  // TODO: Remove

    // Handle space key so player's snake can speed up
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.spaceKeyDown, this);
    spaceKey.onUp.add(this.spaceKeyUp, this);
    this.addDestroyedCallback(function() {
        spaceKey.onDown.remove(this.spaceKeyDown, this);
        spaceKey.onUp.remove(this.spaceKeyUp, this);
    }, this);
};

PlayerSnake.prototype = Object.create(Snake.prototype);
PlayerSnake.prototype.constructor = PlayerSnake;

// Snake lights up and accelerates when space key down
PlayerSnake.prototype.spaceKeyDown = function() {
    this.speed = this.fastSpeed;
};
// slows down when space key up again
PlayerSnake.prototype.spaceKeyUp = function() {
    this.speed = this.slowSpeed;
};

PlayerSnake.prototype.tempUpdate = PlayerSnake.prototype.update;
PlayerSnake.prototype.update = function() {
    var mousePosX = this.game.input.activePointer.worldX;
    var mousePosY = this.game.input.activePointer.worldY;
    var headX = this.head.body.x;
    var headY = this.head.body.y;

    // Find degrees between head and mouse and decide if faster
    // to turn left or right to align with mouse
    var angle = Util.angleBetweenPoints(mousePosX, headX, mousePosY, headY);
    if (angle > 0) {
        angle = 180 - angle;
    } else {
        angle = -180-angle;
    }

    var diff = this.head.body.angle - angle;
    this.head.body.setZeroRotation();

    // Allow arrow keys to be used -- try WASD also? (Edit later: fuck yeah wasd!)
    // This overrides go-to-pointer functionality and feels
    // a little weird, because if no arrow keys are pressed,
    // snake reverts to tracking cursor, which is likely
    // still floating somewhere on the screen
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
        this.head.body.rotateLeft(this.rotationSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        this.head.body.rotateRight(this.rotationSpeed);
    }

    // Go-to-pointer functionality
    else if (diff < 0 && diff > -180 || diff > 180) {
        this.head.body.rotateRight(this.rotationSpeed);
    }  else if (diff > 0 && diff < 180 || diff < -180) {
        this.head.body.rotateLeft(this.rotationSpeed);
    }

    this.tempUpdate();  // call Snake.update()
};