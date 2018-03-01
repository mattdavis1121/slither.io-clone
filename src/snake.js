Snake = function(game, spriteKey, x, y) {
    this.game = game;

    if (!this.game.snakes) {
        this.game.snakes = [];
    }

    this.game.snakes.push(this);
    this.debug = false;
    this.snakeLength = 0;
    this.spriteKey = spriteKey;

    this.scale = 0.6;
    this.fastSpeed = 200;
    this.slowSpeed = 130;
    this.speed = this.slowSpeed;
    this.rotationSpeed = 40;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.sections = [];
    this.headPath = []; // Array of points that head has traveled through
    this.food = [];

    this.preferredDistance = 17 * this.scale;
    this.queuedSections = 0;

    this.sectionGroup = this.game.add.group();
    this.head = this.addSectionAtPosition(x, y);
    this.head.name = "head";
    this.head.snake = this;

    this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
    this.initSections(30);

    this.edgeOffset = 4;
    this.edge = this.game.add.sprite(x, y - this.edgeOffset, this.spriteKey);
    this.edge.name = "edge";
    this.edge.alpha = 0;
    this.game.physics.p2.enable(this.edge, this.debug);
    this.edge.body.setCircle(this.edgeOffset);

    // Keep edge in front of head
    this.edgeLock = this.game.physics.p2.createLockConstraint(
        this.edge.body, this.head.body, [0, -this.head.width*0.5-this.edgeOffset]
    );

    this.edge.body.onBeginContact.add(this.edgeContact, this);

    this.onDestroyedCallbacks = [];
    this.onDestroyedContexts = [];
};

Snake.prototype = {
    addSectionAtPosition: function(x, y) {
        var sec = this.game.add.sprite(x, y, this.spriteKey);
        this.game.physics.p2.enable(sec, this.debug);
        sec.body.setCollisionGroup(this.collisionGroup);
        sec.body.collides([]);
        sec.body.kinematic = true;  // No rebound from collision, just detection

        this.snakeLength++;
        this.sectionGroup.add(sec);
        sec.sendToBack();
        sec.scale.setTo(this.scale);

        this.sections.push(sec);

        // Add circle body to this section instead of default rect
        sec.body.clearShapes();
        sec.body.addCircle(sec.width*0.5);

        return sec;
    },
    initSections: function(num) {
        for (var i = 0; i < num; i++) {
            var x = this.head.body.x;
            var y = this.head.body.y + i * this.preferredDistance;
            this.addSectionAtPosition(x, y);
            this.headPath.push(new Phaser.Point(x, y)); // Add point to head path so section stays there
        }
    },
    addSectionAfterLast: function(amount) {
        this.queuedSections += amount;
    },
    update: function() {
        var speed = this.speed;
        this.head.body.moveForward(speed);

        var point = this.headPath.pop();                    // Remove last point in headPath
        point.setTo(this.head.body.x, this.head.body.y);    // Update to current head position
        this.headPath.unshift(point);                       // Reinsert point at front of headPath

        var index = 0;
        var lastIndex = null;
        for (var i = 0; i < this.snakeLength; i++) {

            this.sections[i].body.x = this.headPath[index].x;
            this.sections[i].body.y = this.headPath[index].y;

            // Hide sections if they are at the same position
            if (lastIndex && index === lastIndex) {
                this.sections[i].alpha = 0;
            } else {
                this.sections[i].aplha = 1;
            }

            lastIndex = index;
            index = this.findNextPointIndex(index);
        }

        // Continuously adjust the size of headPath to we
        // only keep what we need.
        if (index >= this.headPath.length - 1) {
            // Array is too short, add a point
            var lastPos = this.headPath[this.headPath.length - 1];
            this.headPath.push(new Phaser.Point(lastPos.x, lastPos.y));
        } else {
            // Array is too long, remove a point
            this.headPath.pop();
        }

        // We consider to a cycle to be the time it takes for the second
        // section of the snake (head + 1) to reach the point where the
        // head of the snake was at the end of the last cycle.
        // It represents the time to move all sections.
        var i = 0;
        var found = false;
        while (this.headPath[i].x !== this.sections[1].body.x &&
               this.headPath[i].y !== this.sections[1].body.y) {
            if (this.headPath[i].x === this.lastHeadPosition.x &&
                this.headPath[i].y === this.lastHeadPosition.y) {
                found = true;
                break;
            }
            i++;
        }
        if (!found) {
            this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
            this.onCycleComplete();
        }
    },
    /**
     * On each completed cycle, add a section at the end of snake, if sections
     * need to be added.
     */
    onCycleComplete: function() {
        if (this.queuedSections > 0) {
            var lastSec = this.sections[this.sections.length - 1];
            this.addSectionAtPosition(lastSec.body.x, lastSec.body.y);
            this.queuedSections--;
        }
    },
    findNextPointIndex: function(currentIndex) {
        var prefDist = this.preferredDistance;
        var len = 0;
        var diff = len - prefDist;
        var i = currentIndex;
        var prevDiff = null;

        // Calc the difference between points, summing until we exceed
        // prefDist.
        while (i + 1 < this.headPath.length && (diff === null || diff < 0)) {
            var dist = Phaser.Point.distance(this.headPath[i], this.headPath[i+1]);
            len += dist;
            prevDiff = diff;
            diff = len - prefDist;
            i++;
        }

        // Choose index that gets us closest to prefDist
        if (prevDiff === null || Math.abs(prevDiff) > Math.abs(diff)) {
            return i;
        } else {
            return i-1;
        }
    },
    setScale: function(scale) {
        this.scale = scale;
        this.preferredDistance = 17 * this.scale;

        // Update edge lock location with p2 physics
        this.edgeLock.localOffsetB = [
            0, this.game.physics.p2.pxmi(this.head.width*0.5+this.edgeOffset)
        ];

        //scale sections and their bodies
        for (var i = 0 ; i < this.sections.length ; i++) {
            var sec = this.sections[i];
            sec.scale.setTo(this.scale);
            sec.body.data.shapes[0].radius = this.game.physics.p2.pxm(sec.width*0.5);
        }
    },
    incrementSize: function() {
        this.addSectionAfterLast(1);
        this.setScale(this.scale * 1.01);
    },
    addDestroyedCallback: function(callback, context) {
        this.onDestroyedCallbacks.push(callback);
        this.onDestroyedContexts.push(context);
    },
    destroy: function() {
        this.game.snakes.splice(this.game.snakes.indexOf(this), 1);
        // remove edge and constraints
        this.game.physics.p2.removeConstraint(this.edgeLock);
        this.edge.destroy();

        this.sections.forEach(function(sec, index) {
            sec.destroy();
        });

        // Call snake's destruction callbacks
        for (var i = 0; i < this.onDestroyedCallbacks.length; i++) {
            if (typeof this.onDestroyedCallbacks[i] === "function") {
                this.onDestroyedCallbacks[i].apply(this.onDestroyedContexts[i], [this]);
            }
        }
    },
    edgeContact: function(phaserBody) {
        // if edge hits another snake, kill this snake
        if (phaserBody && this.sections.indexOf(phaserBody.sprite) === -1) {
            this.destroy();
        }

        // This is a hack. If snake hits itself, move edge to center of head.
        // It will then move back to the front because of the lock constraint.
        else if (phaserBody) {
            this.edge.body.x = this.head.body.x;
            this.edge.body.y = this.head.body.y;
        }
    }
};