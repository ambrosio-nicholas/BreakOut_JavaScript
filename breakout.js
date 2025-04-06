//sound effects
let bounceSnd = new Audio("bounce.wav");
bounceSnd.volume = 0.7;
let breakSound = new Audio("break.wav");
breakSound.volume = 0.8;
let lvlUpSnd = new Audio("levelUp.wav");
lvlUpSnd.volume = 1.2;

//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

//player
let playerHeight = 10;
let playerWidth = 80;
let playerVelocityX = 10;

let player = {     // Kinda like a struct in C++
    x: boardWidth/2 - playerWidth/2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 2;     //Add more rows as the game goes on
let blockMaxRows = 10;
let blockCount = 0;
//starting block corner
let blockX = 15;
let blockY = 45;

//score
let score = 0;
let level = 1;

//Win conditions
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //Draw the player on load
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height)

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    //create blocks
    createBlocks();
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    //Clear the canvas
    context.clearRect(0, 0, board.width, board.height)

    //Draw the player on the board
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height)

    //Draw the ball on the board
    context.fillStyle = "lightgray";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //Checks for wallbouncing
    if (ball.y <= 0) { //If ball hits the top
        ball.velocityY *= -1;
        bounceSnd.play();
        bounceSnd.currentTime = 0;
    }
    else if (ball.x <= 0 || (ball.x + ball.width) >= boardWidth) { //If ball hits the sides
        ball.velocityX *= -1;
        bounceSnd.play();
        bounceSnd.currentTime = 0;
    }
    else if (ball.y + ball.height >= boardHeight) { //If ball hits the bottom
        context.fillStyle = "lightgray";
        context.font = "20px sans-serif";
        context.fillText("Score: " + score, 80, 375);
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true; //gameover
    }

    //bounce ball off the paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;
        bounceSnd.play();
        bounceSnd.currentTime = 0;
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)){
        ball.velocityX *= -1;
        bounceSnd.play();
        bounceSnd.currentTime = 0;
    }

    //Draw the blocks and check for collisions while we go through each block
    context.fillStyle = "darkred";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) { //Check top and bottom collision
                block.break = true;
                ball.velocityY *= -1;
                breakSound.play();
                breakSound.currentTime = 0;
                blockCount -= 1;
                score += (10 * (1 + level / 2));
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) { //Check left and right collision
                block.break = true;
                ball.velocityX *= -1;
                breakSound.play();
                breakSound.currentTime = 0;
                blockCount -= 1;
                score += (10 * level);
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //Check for next level
    if (blockCount <= 0) {
        nextLevel();
    }

    //Draw score
    context.fillStyle = "lightgray";
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(key) {
    if (gameOver && key.code == "Space") {
        resetGame();
    }
    if (key.code == "ArrowLeft") {
        let nextplayerX = player.x - player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
    else if (key.code == "ArrowRight") {
        let nextplayerX = player.x + player.velocityX;
        if (!outOfBounds(nextplayerX)) {
            player.x = nextplayerX;
        }
    }
} 

function detectCollision(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width) && //Check that rect1's top left corner doesn't reach rect2's top right corner
           (rect1.x + rect1.width > rect2.x) && //Check that rect1's top right corner doesn't reach rect2's top left corner
           (rect1.y < rect2.y + rect2.height) &&//Check that rect1's top left corner doesn't reach rect2's bottom left corner
           (rect1.y + rect1.height > rect2.y)   //Check that rect1's bottom left corner doesn't reach rect2's top left corner
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && ball.y <= (block.y + block.height);
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && ball.x <= (block.x + block.width);
}

function createBlocks() {
    blockArray = []; // clear the array]
    for (let col = 0; col < blockColumns; col++) {
        for (let row = 0; row < blockRows; row++) {
            let block = {
                x: blockX + col * blockWidth + (col * 10), // col * 10 is some extra spacing between the blocks
                y: blockY + row * blockHeight + (row * 10), // row * is some extra spacing between the blocks
                width: blockWidth,
                height: blockHeight,
                break: false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame(){
    gameOver = false;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    }
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY
    }
    blockArray = [];
    blockRows = 2;
    score = 0;
    level = 1;
    createBlocks();
}

function nextLevel() {
    level++;
    lvlUpSnd.play();
    if (!(blockRows == blockMaxRows - 1)) {
        blockRows += 1;
    }
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    }
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX * (1 + level / 20), //add a 5 % increase in horizontal speed for each level
        velocityY: ballVelocityY * (1 + level / 50), //add a 2 % increase in vertical speed for each level
    }
    blockArray = [];
    createBlocks();
}