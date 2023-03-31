const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");
const gameOverSound = new Audio("assets/sounds/gameOver.wav");
const gameWinSound = new Audio("assets/sounds/gameWin.mp3");

// Defines a function that creates a rectangle on the canvas.
let createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};

let gameOver = false;//Track whether the game is over.
let gamePaused = false;//Track whether the game is paused.

// Direction variables 
const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;

let lives = 3;
let ghostCount = 3;
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

// Game variables
let fps = 30;
let pacman;
let oneBlockSize = 20;
let score = 0;
let ghosts = [];
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor = "black";

// we now create the map of the walls,
// if 1 blue wall, if 0 not wall 2 dots, 4 yellow wall
// 21 columns // 23 rows
let initialMapValue = () => {
    return [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1, 1, 2, 1, 0, 1, 2, 1],
        [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
}

let map = initialMapValue();// Initialize the map of the game
let madeFirstMove = false;// Checks if the user has moved Pacman

//Checks if there is a collision with a wall
let checkCollisions = (x, y) => {
    let col = Math.floor(x / oneBlockSize);
    let row = Math.floor(y / oneBlockSize);
    if (map[row][col] === 1) {
        return true; // collision with wall
    }
    else {
        return false; // no collision with wall
    }
};

let randomTargetsForGhosts = [
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    {
        x: (map[0].length - 2) * oneBlockSize,
        y: (map.length - 2) * oneBlockSize,
    },
];

let createNewPacman = () => {
    pacman = new Pacman(
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5
    );
};

// This function is the main game loop that updates and draws the game every frame.
let gameLoop = () => {
    if (gamePaused) {
        return;
    }
    update();
    draw();
};

let gameInterval = setInterval(gameLoop, 1200 / fps);

let restartPacmanAndGhosts = () => {
    createNewPacman();
    createGhosts();
};

// This function is called when Pac-Man collides with a ghost.
let onGhostCollision = () => {
    lives--;
    restartPacmanAndGhosts();
    gameOverSound.play();
    if (lives === 0) {
        gameOver = true;
        gameOverSound.play();
        gamePaused = true;
        score = 0;
        // Display the game over modal
        const modal = document.getElementById("game-over-modal");
        modal.classList.remove("hidden");

        // Add an event listener to the restart button
        const restartButton = document.getElementById("restart-lose-button");
        restartButton.addEventListener("click", () => {
            gamePaused = false;
            modal.classList.add("hidden");
            lives = 3; // Reset the lives count
            // Reset map
            map = initialMapValue();
            restartPacmanAndGhosts();
            madeFirstMove = false;
        });
    }
};

// This function is called when Pac-Man has eaten all the food on the map.
let winGame = () => {
    let win = map.flat().filter((tile) => tile === 2).length;
    if (win === 0) {
        gamePaused = true;
        const fireworks=fireworksOn();
        gameWinSound.play();
        // Display the game over modal
        const modal = document.getElementById("game-win-modal");
        modal.classList.remove("hidden");
        fireworks.classList.remove("hidden");

        // Add an event listener to the restart button
        const restartButton = document.getElementById("restart-win-button");
        restartButton.addEventListener("click", () => {
            gamePaused = false;
            fireworks.classList.add("hidden");
            modal.classList.add("hidden");
            lives = 3; // Reset the lives count
            score = 0;
            restartPacmanAndGhosts();
            map = initialMapValue();
            madeFirstMove = false;
        });
    }
}

// This function updates the game state every frame.
let update = () => {
    pacman.moveProcess();
    pacman.eat();
    updateGhosts();
    if (pacman.checkGhostCollision(ghosts)) {
        onGhostCollision();
    }
};

let drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === 2) {
                createRect(
                    j * oneBlockSize + oneBlockSize / 3,
                    i * oneBlockSize + oneBlockSize / 3,
                    oneBlockSize / 3,
                    oneBlockSize / 3,
                    "#FEB897"
                );
            }
        }
    }
};

let drawRemainingLives = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Lives: ", 280, oneBlockSize * (map.length + 1));

    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            350 + i * oneBlockSize,
            oneBlockSize * map.length + 2,
            oneBlockSize,
            oneBlockSize
        );
    }
};

let drawScore = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText(
        "Score: " + score,
        0,
        oneBlockSize * (map.length + 1)
    );
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, "black");
    drawWalls();
    drawFoods();
    drawGhosts();
    pacman.draw();
    drawScore();
    winGame();
    drawRemainingLives();
};

let drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === 1) {
                createRect(
                    j * oneBlockSize,
                    i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize,
                    "#342DCA"
                );
                if (j > 0 && map[i][j - 1] === 1) {
                    createRect(
                        j * oneBlockSize,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] === 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] === 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] === 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

let createGhosts = () => {
    ghosts = [];
    for (let i = 0; i < ghostCount * 2; i++) {
        let newGhost = new Ghost(
            9 * oneBlockSize + (i % 2 === 0 ? 0 : 1) * oneBlockSize,
            10 * oneBlockSize + (i % 2 === 0 ? 0 : 1) * oneBlockSize,
            oneBlockSize,
            oneBlockSize,
            pacman.speed / 2,
            ghostImageLocations[i % 4].x,
            ghostImageLocations[i % 4].y,
            124,
            116,
            6 + i
        );
        ghosts.push(newGhost);
    }
};

createNewPacman();
createGhosts();
gameLoop();

window.addEventListener("keydown", (event) => {
    let k = event.keyCode;
    setTimeout(() => {
        if (k == 37 || k === 65) {
            // left arrow or a
            pacman.nextDirection = DIRECTION_LEFT;
            madeFirstMove = true;
        } else if (k === 38 || k === 87) {
            // up arrow or w
            pacman.nextDirection = DIRECTION_UP;
            madeFirstMove = true;
        } else if (k === 39 || k === 68) {
            // right arrow or d
            pacman.nextDirection = DIRECTION_RIGHT;
            madeFirstMove = true;
        } else if (k === 40 || k === 83) {
            // bottom arrow or s
            pacman.nextDirection = DIRECTION_BOTTOM;
            madeFirstMove = true;
        }
    }, 1);
});

let fireworksOn = () => {
        const fireworks = document.getElementById("fireworks");
        fireworks.width = window.innerWidth;
        fireworks.height = window.innerHeight;
        var ctx = fireworks.getContext("2d");
        function Firework(x, y, height, yVol, R, G, B) {
            this.x = x;
            this.y = y;
            this.yVol = yVol;
            this.height = height;
            this.R = R;
            this.G = G;
            this.B = B;
            this.radius = 2;
            this.boom = false;
            var boomHeight = Math.floor(Math.random() * 200) + 50;
            this.draw = function () {
                ctx.fillStyle = "rgba(" + R + "," + G + "," + B + ")";
                ctx.strokeStyle = "rgba(" + R + "," + G + "," + B + ")";
                ctx.beginPath();
                //   ctx.arc(this.x,boomHeight,this.radius,Math.PI * 2,0,false);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, Math.PI * 2, 0, false);
                ctx.fill();
            }
            this.update = function () {
                this.y -= this.yVol;
                if (this.radius < 20) {
                    this.radius += 0.35;
                }
                if (this.y < boomHeight) {
                    this.boom = true;

                    for (var i = 0; i < 120; i++) {
                        particleArray.push(new Particle(
                            this.x,
                            this.y,
                            // (Math.random() * 2) + 0.5//
                            (Math.random() * 2) + 1,
                            this.R,
                            this.G,
                            this.B,
                            1,
                        ))

                    }
                }
                this.draw();
            }
            this.update()
        }

        window.addEventListener("click", (e) => {
            var x = e.clientX;
            var y = fireworks.height;
            var R = Math.floor(Math.random() * 255)
            var G = Math.floor(Math.random() * 255)
            var B = Math.floor(Math.random() * 255)
            var height = (Math.floor(Math.random() * 20)) + 10;
            fireworkArray.push(new Firework(x, y, height, 5, R, G, B))
        })

        function Particle(x, y, radius, R, G, B, A) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.R = R;
            this.G = G;
            this.B = B;
            this.A = A;
            this.timer = 0;
            this.fade = false;

            // Change random spread
            this.xVol = (Math.random() * 10) - 4
            this.yVol = (Math.random() * 10) - 4


            this.draw = function () {
                //   ctx.globalCompositeOperation = "lighter"
                ctx.fillStyle = "rgba(" + R + "," + G + "," + B + "," + this.A + ")";
                ctx.save();
                ctx.beginPath();
                // ctx.fillStyle = "white"
                ctx.globalCompositeOperation = "screen"
                ctx.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false);
                ctx.fill();

                ctx.restore();
            }
            this.update = function () {
                this.x += this.xVol;
                this.y += this.yVol;

                // Comment out to stop gravity. 
                if (this.timer < 200) {
                    this.yVol += 0.12;
                }
                this.A -= 0.02;
                if (this.A < 0) {
                    this.fade = true;
                }
                this.draw();
            }
            this.update();
        }

        var fireworkArray = [];
        var particleArray = [];
        for (var i = 0; i < 6; i++) {
            var x = Math.random() * fireworks.width;
            var y = fireworks.height;
            var R = Math.floor(Math.random() * 255)
            var G = Math.floor(Math.random() * 255)
            var B = Math.floor(Math.random() * 255)
            var height = (Math.floor(Math.random() * 20)) + 10;
            fireworkArray.push(new Firework(x, y, height, 5, R, G, B))
        }
        function animate() {
            requestAnimationFrame(animate);
            // ctx.clearRect(0,0,fireworks.width,fireworks.height)
            ctx.fillStyle = "rgba(0,0,0,0.1)"
            ctx.fillRect(0, 0, fireworks.width, fireworks.height);
            for (var i = 0; i < fireworkArray.length; i++) {
                fireworkArray[i].update();
            }
            for (var j = 0; j < particleArray.length; j++) {
                particleArray[j].update();
            }
            if (fireworkArray.length < 4) {
                var x = Math.random() * fireworks.width;
                var y = fireworks.height;
                var height = Math.floor(Math.random() * 20);
                var yVol = 5;
                var R = Math.floor(Math.random() * 255);
                var G = Math.floor(Math.random() * 255);
                var B = Math.floor(Math.random() * 255);
                fireworkArray.push(new Firework(x, y, height, yVol, R, G, B));
            }
            fireworkArray = fireworkArray.filter(obj => !obj.boom);
            particleArray = particleArray.filter(obj => !obj.fade);
        }
        animate();

        window.addEventListener("resize", (e) => {
            fireworks.width = window.innerWidth;
            fireworks.height = window.innerHeight;
        });
        return fireworks;
    }

