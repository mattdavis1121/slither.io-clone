CameraUtil = function(game) {
    this.game = game;
    this.cameraSpeed = 10;
    this.cursors = this.game.input.keyboard.createCursorKeys();
};

CameraUtil.prototype = {
    update: function() {
        if (this.cursors.up.isDown) {
            this.game.camera.y -= this.cameraSpeed;
        }
        else if (this.cursors.down.isDown) {
            this.game.camera.y += this.cameraSpeed;
        }

        if (this.cursors.left.isDown) {
            this.game.camera.x -= this.cameraSpeed;
        }
        else if (this.cursors.right.isDown) {
            this.game.camera.x += this.cameraSpeed;
        }
    }
};