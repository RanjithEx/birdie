/*
Game Name: Birdie
Author: Ranjith V Raghunathan
Description: This file contains the game logic. 
License: This game is licensed under the MIT License. For more information, please visit https://opensource.org/licenses/MIT
Follow on Twitter [@RanjithEx] for more updates and games!
*/

    // required elements, for easy access
    let birdie = document.getElementById("birdie");
    let canvas = document.getElementById("game-area");
    let layer0 = document.getElementById("layer0");
    let layer1 = document.getElementById("layer1");
    let layerContainer = document.getElementById("layer-container");
    let gameOverDlg = document.getElementById("game-over");
    let debugRect = document.getElementById("debug-rect");
    let gameStartDlg = document.getElementById("game-start");
    let scoreDistance = document.getElementById("dist-value");
    let scoreCoins = document.getElementById("coin-count");

    let activeLayer = layer0;
    let scoreCard = document.getElementById("score-card");


    // Array of obstacles and coins. 
    // populated at runtime
    let layerBlocks = null;
    let layerCoins = null;

    // Floor level 
    const floorHeight = screen.height * 0.70;

    // start x offset
    const birdieXOffset = 400;

    // Initial position of the birdie
    birdie.style.top = floorHeight;
    birdie.style.left = birdieXOffset;

    // current velocity
    let velocity  = 0;

    // current game speed
    let gameSpeed = 3.2;

    // gravity constant. Its not 9.8
    let gravity = 0.1;

    // acceleration.
    let accel = 5.0;        

    // holds current layer visible to the user. 
    let currScreen = layer0;

    // controls gameplay pause/stop
    let running = false;

    // Score card items
    let totalDistance = 0;
    let totalCoins = 0;

    // Init everything.
    init();

    // Prepare the layers with initial content.
    // Initialize layer 0 elements.
    resetLayer(layer0);
    generatePipes(layer0, [0.2, 0.2, 0.7, 0.8, 1.0]);
    generateGrass(layer0);
    generateClouds(layer0);

    // collision structures, 
    layerBlocks = layer0.querySelectorAll('.blocks');
    layerCoins = layer0.querySelectorAll('.gold-coin');

    // Initialize Layer1 elements
    generatePipes(layer1, [1, 1, 1, 1, 1]);
    generateGrass(layer1);
    generateClouds(layer1);
    generateCoins(layer1);

    /***
     * Initialize everything
     * */
    function init(){

        randomizeSkyColors();

        // The game area is fixed 1920x1080 pixels.
        // 
        let gameArea = document.getElementById("game-area")
        let scale = (screen.width-500) / 1920.00;            

        /*
        updateScoreCard();
        currKeyHandler = gameStartKeyHandler;*/

        resetGameState();

        //gameArea.style.setProperty("--screen-scale", scale);

    }

    function randomizeSkyColors() {

        let color1 = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        let color2 = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        document.getElementById("layer0").style.setProperty('--sky-grad-start', color1);
        document.getElementById("layer0").style.setProperty('--sky-grad-end', color2);
        document.getElementById("layer1").style.setProperty('--sky-grad-start', color1);
        document.getElementById("layer1").style.setProperty('--sky-grad-end', color2);

    }

    function showGameOver() {

        gameOverDlg.style.visibility = "visible";
        currKeyHandler = gameOverDialogKeyHandler;
    }

    function writeStatText(text) {
        let statBox = document.getElementById("stat-box");
        statBox.innerHTML = text;
    }


    function playerControl() {

        // Get the current position of the div
        let xPos = parseInt(birdie.style.left);
        let yPos = parseInt(birdie.style.top);
                
        if(yPos + velocity >= floorHeight)
        {
            //birdie.style.left = xPos + 1;                
            velocity = 0;
        }
        else
        {
            velocity += gravity;
        }            

        birdie.style.top = yPos + velocity;
        
        let collX = parseInt(birdie.style.left) ;
        let collY = parseInt(birdie.style.top) + scoreCard.clientHeight;
        let collW = parseInt(birdie.clientWidth);
        let collH = parseInt(birdie.clientHeight);

        // this will check the collsion with obstacles. 
        checkCollisions(collX, collY, collW, collH, '.blocks', layerBlocks, (hitObj) => {

            running = false;
            let birdie = getBirdie();
            birdie.style.setProperty("--birdie-anim", "fall");
            birdie.style.setProperty("--anim-iterations", "1");

            let currBlock = hitObj;
            
            let objX = parseInt(currBlock.style.left) + currBlock.parentElement.offsetLeft + currBlock.parentElement.parentElement.offsetLeft;
            let objY = parseInt(currBlock.style.top) + currBlock.parentElement.offsetTop + currBlock.parentElement.parentElement.offsetTop;
            let blockWidth = parseInt(currBlock.clientWidth);
            let blockHeight = parseInt(currBlock.clientHeight);

            //console.log("X: " + x + ", Y: " + y);
            //console.log("ObjX: " + objX + ", ObjY: " + objY);
            //console.log("width: " + width + ", height: " + height);
            drawDebugRect(objX+3, objY+4, blockWidth, blockHeight);                

            showGameOver();

            hit = true;

        });

        checkCollisions(collX, collY, collW, collH, '.gold-coin', layerCoins, (hitObj)=>{

            let currBlock = hitObj;
            let objX = parseInt(currBlock.style.left) + currBlock.parentElement.offsetLeft + currBlock.parentElement.parentElement.offsetLeft;
            let objY = parseInt(currBlock.style.top) + currBlock.parentElement.offsetTop + currBlock.parentElement.parentElement.offsetTop;
            let blockWidth = parseInt(currBlock.clientWidth);
            let blockHeight = parseInt(currBlock.clientHeight);

            //drawDebugRect(objX+3, objY+4, blockWidth, blockHeight);

            //hitObj.style.visibility = "none";
            

            if(hitObj.style.visibility != "hidden")
            {
                totalCoins++;;
                hitObj.style.visibility = "hidden";
            }                
        });
    }


    function gameArea() {
        return document.getElementById("game-area");
    }
    function drawDebugRect(x, y, width, height) {
        let rect = document.getElementById("debug-rect");
        rect.style.left = x;
        rect.style.top = y;
        rect.style.width = width;
        rect.style.height = height;
        rect.style.visibility = "visible";
    } 
    function getBirdie() {
        return document.getElementById("birdie");
    }


    function control(stop) {
        running = stop;
    }

    function resetLayer(targetLayer)
    {
        while(targetLayer.firstElementChild)
        {
            targetLayer.removeChild(targetLayer.firstElementChild);
        }
    }

    function generateCoins(targetLayer)
    {
        let height = Math.random() * 500;
        for(let i = 0; i < 3; i++)
        {
            let block = document.createElement("div");
            let blockHeight = 100;
            block.classList.add("gold-coin");                
            
            block.style.left = 200 + (200 * i);
            block.style.top = 300 + height;
            block.height = blockHeight;
            block.width = blockHeight;
            targetLayer.append(block);
        }
    }
    /**
     * Generates the pipes on a layer(DIV). 
     * @param targetLayer - The DIV in which the pipes elements be added. 
     * @param heightScales - A float array with values(0..1). 
     * */
    function generatePipes(targetLayer, heightScales)
    {
        for(let i=0; i< heightScales.length; i++)
        {
            let block = document.createElement("div");
            let blockHeight = 100 + Math.random() * gameArea().clientHeight * 0.4;
            block.classList.add("blocks");
            block.style.left = 400 * i;
            block.style.height = blockHeight * heightScales[i];
            block.style.top = gameArea().clientHeight - blockHeight * heightScales[i]-10;
            targetLayer.append(block);
        }
    }

    /**
     * 
     * Generate some grass on the ground 
     * @param targetLayer - The layer(DIV) on which the grass is to be generated.
     * 
     * */
    function generateGrass(targetLayer)
    {            
        for(let i=0; i<97; i++)
        {
            let block = document.createElement("div");
            let blockHeight = 10 + Math.random() * 100;
            block.classList.add("grass");
            block.style.left = 40 * i;
            block.style.height = blockHeight;
            block.style.top = gameArea().clientHeight - blockHeight- scoreCard.clientHeight;                
            targetLayer.append(block);
        }
    }

    /***
     * 
     * Genearate stones - Unused 
     * 
     * */
    function generateStones(targetLayer)
    {            
        for(let i=0; i< 20; i++)
        {
            let block = document.createElement("div");
            let blockHeight = 10 + Math.random() * 150;
            let rotation = -20 + Math.random() * 20;
            block.classList.add("stone");
            block.style.left = Math.random() * 400 * i;
            block.style.height = blockHeight;
            block.style.transform = "scale(" + (1.0 + (Math.random())) + ") rotate(" + rotation + "deg)";
            block.style.top = gameArea().clientHeight - blockHeight;
            targetLayer.append(block);
        }
    }

    /**
     * 
     * Generate clouds on a specific layer. 
     * 
     * */
    function generateClouds(targetLayer) {

        
        for(let i=0; i<5; i++)
        {
            let block = document.createElement("div");
            block.classList.add("cloud");
            block.style.left = i * 400 + Math.random() * 500; 
            block.style.top = 300 + Math.random() * 400;
            block.style.opacity = 0.3 + Math.random();
            targetLayer.append(block);
        }
    }

    /**
     * Refresh - reconstruct the pipes, grass clouds and coins on a layer 
     * */
    function reloadLayer(targetLayer)
    {
        resetLayer(targetLayer);
        generatePipes(targetLayer, [0.2, 0.4, 1, 1, 1, 1, 1, 1]);
        generateGrass(targetLayer);
        generateClouds(targetLayer);
        generateCoins(targetLayer);
    }

    /**
     * 
     * Check if a rectangle collides with a list of other rectangular objects
     * 
     * */
    function checkCollisions(x, y, width, height, className, objList, callback) {
        
        const allBlocks = objList;

        let hit = false;            

        for(let i=0; i< allBlocks.length; i++)
        {
            let currBlock = allBlocks[i];
            let objX = parseInt(currBlock.style.left) + currBlock.parentElement.offsetLeft + currBlock.parentElement.parentElement.offsetLeft;
            let objY = parseInt(currBlock.style.top) + currBlock.parentElement.offsetTop + currBlock.parentElement.parentElement.offsetTop;
            let blockWidth = parseInt(currBlock.clientWidth);
            let blockHeight = parseInt(currBlock.clientHeight);

            let cond0 = (x > objX) && (x < (objX + blockWidth)) && (y > objY) && (y < (objY + blockHeight)); // (x, y)
            let cond1 = (x + width > objX) && (x + width < objX + width) && (y > objY) && (y < objY + blockHeight);   // (x + w, y)
            let cond2 = (x + width > objX) && (x + width < objX + blockWidth) && (y + height > objY) && (y + height < objY + blockHeight);   // (x + w, y+h)
            let cond3 = (x> objX) && (x < objX + blockWidth) && (y + height > objY) && (y + height < objY + blockHeight);   // (x, y+h)
            
            if(cond0 || cond1 || cond2 || cond3 )
            {                    
                callback(currBlock);                    
                break;
            }
        }
    }


    /**
     * Updat the score card with the recent values
     */
    function updateScoreCard() {

        scoreDistance.innerText = totalDistance.toString();
        scoreCoins.innerText = totalCoins.toString();
    }


    function scrollLayers() {
        
        layerContainer.firstElementChild.style.left = parseInt(layerContainer.firstElementChild.style.left) - gameSpeed;
        layerContainer.firstElementChild.nextElementSibling.style.left = parseInt(layerContainer.firstElementChild.style.left) + parseInt(layerContainer.firstElementChild.clientWidth)-1;        

        if(parseInt(activeLayer.style.left) <= -activeLayer.clientWidth + birdieXOffset)
        {                
            let nextLayer = activeLayer.nextElementSibling;               
            activeLayer = nextLayer;

            console.log("Birdie on a new layer" + activeLayer.id);
            
            layerCoins = activeLayer.querySelectorAll(".gold-coin");
            layerBlocks = activeLayer.querySelectorAll('.blocks');
        }
                    
        if(parseInt(layerContainer.firstElementChild.style.left) <= -(layerContainer.firstElementChild.clientWidth + 100))
        {
            let firstChild = layerContainer.firstElementChild;
            layerContainer.removeChild(layerContainer.firstElementChild);                
            layerContainer.appendChild(firstChild);
            reloadLayer(firstChild);
        }

        totalDistance += 1;                        
    }
    /**
     * Reset the game state to defaults
     */
    function resetGameState() {

        updateScoreCard();

        reloadLayer(layerContainer.firstElementChild);

        activeLayer = layerContainer.firstElementChild;
        layerContainer.firstElementChild.style.left = 0;
        layerContainer.lastElementChild.style.left = layerContainer.firstElementChild.clientWidth;
        gameOverDlg.style.visibility = "hidden";
        debugRect.style.visibility = "hidden";            
        birdie.style.setProperty("--birdie-anim", "birdanim");
        birdie.style.setProperty("--anim-iterations", "infinite");

        gameStartDlg.style.visibility = "visible";
        totalCoins = 0;
        totalDistance = 0;
        
        layerBlocks = layerContainer.firstElementChild.querySelectorAll('.blocks');
        layerCoins = layerContainer.firstElementChild.querySelectorAll('.gold-coin');    
        
        currKeyHandler = gameStartKeyHandler;

    }

    /**
     * Star the game.
     */
    function startGame() {
        running = true;
        document.getElementById("game-start").style.visibility = "hidden";
        currKeyHandler = gameplayKeyHandler;
    }

    /**
     * This is being called on mouse press and space bar. 
     * Pushes the birdie upward.
     */
    function birdieFly() {

        velocity -= accel;
    }

    /**
     * The mouse handler
     * @param {T} event 
     */
    canvas.onmousedown = function(event) {

        birdieFly();           
                    
    }

    /**
     * The keydown event handler
     */
    document.onkeydown = function(event) {

        // call the currently selected event handler
        currKeyHandler(event);
    }

    function gameplayKeyHandler(event) {

        // todo: magic values, named constants required.
        if(event.keyCode == 32) // space
        {
            birdieFly();
        }
        else if(event.keyCode == 27) // escape
        {
            running = !running;
        }
    }
    function gameOverDialogKeyHandler(event) {

        // todo: magic values, named constants required.
        if(event.keyCode == 27) // escape
        {
            resetGameState();
        }

    }

    function gameStartKeyHandler(event) {

        // todo: magic values, named constants required.
        if(event.keyCode == 32)
        {
            startGame();                
        }
    }

    /**
     * The game loop;
     */
    function gameLoop() {

        if(running)
        {                
            playerControl();
            scrollLayers();    
            updateScoreCard();
        }
                    
        setTimeout(gameLoop, 0);
    }

    // Start it!
    gameLoop();


