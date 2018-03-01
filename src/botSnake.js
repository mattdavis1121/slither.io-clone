BotSnake = function(game, spriteKey, x, y) {
    Snake.call(this, game, spriteKey, x, y);
    this.trend = 1;
};

// Huh. Apparently inheriting an object doesn't include
// the object's prototype. Need to do it manually.
BotSnake.prototype = Object.create(Snake.prototype);
BotSnake.prototype.constructor = BotSnake;

// Store reference to Snake.update so we can call at the
// end of BotSnake.update -- otherwise we'd overwrite
// Snake.update completely and lose all functionality
BotSnake.prototype.tempUpdate = BotSnake.prototype.update;
BotSnake.prototype.update = function() {
    this.head.body.setZeroRotation();

    // Comparing against a random int introduces variability
    // into the bot snake's turning. Sometimes it will turn
    // quickly in succession, other times it will hold
    // course for a while before changing again.
    if (this.game.rnd.between(1, 20) === 1) {
        this.trend *= -1;
    }
    this.head.body.rotateRight(this.trend * this.rotationSpeed);

    this.tempUpdate();  // Call parent class update method
};