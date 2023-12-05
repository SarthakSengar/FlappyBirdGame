
//board
let board;
let boardWidth = 360; //selected these as ts our image size
let boardHeight = 640;
let context; //used for drawing on canvas 

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12 (image)
let birdHeight = 24;
let birdX = boardWidth/8; //cordinates of bird 
let birdY = boardHeight/2;
let birdImg;

let bird = {           //JSON object
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = []; //array to store pipes 
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth; //top right corner (360,0)
let pipeY = 0;

let topPipeImg;     //two types of pipes
let bottomPipeImg;

//physics
let velocityX = -1.5; //pipes moving left speed thats why negative
let velocityY = 0; //bird jump speed
let gravity = 0.2; // brings bird down every frame   

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image(); //img object
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); 
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1000); //every 1.5 seconds it will keep calling Placepipes  function inserting new pipes 
    document.addEventListener("keydown", moveBird);  // on cliking bird jumps VilocityY
}

//it gonna update our canvas (redraw)  
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height); //every time we redraw frame we will redraw frame we will 

    //bird
    velocityY += gravity; // keeps bringing bird down 
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {     // touch ground condition
        gameOver = true;
    }

    //pipes

    // all pipes in array are being updated by place pipes and this loops updates theirs position
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // in each frame the pipe.x cord gets towrds left
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }
 
    //clear pipes as memory issues will occur
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 50, 300);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4 +20;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,  //random location for pipe
        width : pipeWidth,
        height : pipeHeight,
        passed : false        // checks is bird corssed this pipe or n
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}
 
// called by actionListner And updates bird Vilocity 
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}
//detects collisions and return a value
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}