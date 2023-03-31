class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 4;
        this.nextDirection = 4;
        this.frameCount = 7;
        this.currentFrame = 1;
        this.wakaSound = new Audio("assets/sounds/wakawaka.mp3");

        setInterval(() => {
            this.changeAnimation();
        }, 100);
    }

    // The moveProcess function is responsible for handling the movement of the pacman character. 
    moveProcess() {
        if (madeFirstMove) {
            this.changeDirectionIfPossible();
            this.moveForwards();
            if (this.checkCollisions()) {
                this.moveBackwards();
                return;
            }
        }
    }

    // The eat function checks whether the pacman character is in the same position as a dot or power pellet on the game map. 
    // If it is, the dot or power pellet is eaten and the score is increased.
    eat() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (
                    map[i][j] === 2 &&
                    this.getMapX() === j &&
                    this.getMapY() === i
                ) {
                    map[i][j] = 3;
                    score++;
                    this.wakaSound.play();
                }
            }
        }
    }

    // The moveBackwards function moves the pacman character backwards one step in the opposite direction to the current direction.
    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: // Right
                this.x -= this.speed;
                break;
            case DIRECTION_UP: // Up
                this.y += this.speed;
                break;
            case DIRECTION_LEFT: // Left
                this.x += this.speed;
                break;
            case DIRECTION_BOTTOM: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    // The moveForwards function moves the pacman character forwards one step in the current direction.
    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: // Right
                this.x += this.speed;
                break;
            case DIRECTION_UP: // Up
                this.y -= this.speed;
                break;
            case DIRECTION_LEFT: // Left
                this.x -= this.speed;
                break;
            case DIRECTION_BOTTOM: // Bottom
                this.y += this.speed;
                break;
        }
    }

    // The checkCollisions function checks whether the pacman character is colliding with a wall on the game map. 
    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
            parseInt(this.x / oneBlockSize)
            ] === 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
            parseInt(this.x / oneBlockSize)
            ] === 1 ||
            map[parseInt(this.y / oneBlockSize)][
            parseInt(this.x / oneBlockSize + 0.9999)
            ] === 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
            parseInt(this.x / oneBlockSize + 0.9999)
            ] === 1
        ) {
            isCollided = true;
            this.wakaSound.pause();
        }
        return isCollided;
    }

    // Checks if Pac-Man has collided with any of the ghosts
    checkGhostCollision(ghosts) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (
                ghost.getMapX() === this.getMapX() &&// Compares the map X position of Pac-Man and ghost
                ghost.getMapY() === this.getMapY()  // Compares the map Y position of Pac-Man and ghost
            ) {
                return true;
            }
        }
        return false;
    }

    // Changes the direction of Pac-Man if possible, based on the nextDirection variable
    changeDirectionIfPossible() {
        if (this.direction === this.nextDirection) return;// If the current and next direction are the same, do nothing
        let tempDirection = this.direction;   // Stores the current direction in a temporary variable
        this.direction = this.nextDirection; // Sets the direction to the nextDirection
        this.moveForwards();
        if (this.checkCollisions()) {// If Pac-Man collides with something
            this.moveBackwards();// Moves Pac-Man backwards
            this.direction = tempDirection;// Sets the direction back to the current direction
        } else {
            this.moveBackwards();// If there is no collision, move Pac-Man backwards
        }
    }

    // Gets the current map X position of Pac-Man
    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize);// Calculates the map X position using Pac-Man's x position
        return mapX; // Returns the map X position
    }

    // Gets the current map Y position of Pac-Man
    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize);// Calculates the map Y position using Pac-Man's y position
        return mapY;// Returns the map Y position
    }

    // Gets the map X position of the right side of Pac-Man
    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);// Calculates the map X position of the right side of Pac-Man
        return mapX;// Returns the map X position
    }

    // Gets the map Y position of the bottom side of Pac-Man
    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        canvasContext.save();
        canvasContext.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180);
        canvasContext.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        canvasContext.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}
