//trying to call timeout in a loop caused problems, needed to research async, await, etc
//create arrays to fill with numbers relating to the 4 colours
//one array for random numbers to copy, one for player numbers
//logic from studying this==> https://www.youtube.com/watch?v=n_ec3eowFLQ and https://codepen.io/BenLBlood/pen/LGLEoJ?editors=1010
//boolean variable indicates game has begun
//timer set using timeleft and time==> https://www.w3schools.com/jsref/met_win_clearinterval.asp
//clearInterval used througout
//gameLost boolean indicates end of game
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
let lightArray = [];
let playerLights = [];
let gameStarted=false;
let timeleft=5;
let  time ='';
let gameLost = false;

const turnCounter = document.querySelector(".count");

//called by the start button
//starts game with a sleeper timer of 3 seconds
//sets LED to green
//empties arrays and clears gameOver message
//sets turn counter to 1
async function newPlay(){
    await sleeper(3000);
    await setGameStarted(false);
    if(gameStarted === false){
        led.style.backgroundColor="green";
        playerLights = [];
        lightArray = [];
        gameOver("");
        turnCounter.innerHTML = "1";
    }else {
        return;
    }
    await addToSequence();
    await showLightSequence();

}

//changes the boolean value based on value passed in
async function setGameStarted(value){
    gameStarted = value;
}

//generates a random number from 1 to 4 to add to the array and changes the turn counter to the length of the array
async function addToSequence(){
    lightArray.push(Math.floor(Math.random() * 4) +1);
    turnCounter.innerHTML = lightArray.length;
}

//sets background colour to grey then back on the button pressed
async function flash(divId ,short,long){
    div = document.querySelector(divId);
    originalColor = getComputedStyle(div).backgroundColor;
    div.style.backgroundColor = "#F5F5F5";
    await sleeper(long);
    div.style.backgroundColor = originalColor;
    await sleeper(short);
}

//uses a for loop to call a timed flash from the flash function relevant to the number at each point of the array
//passes in the appropriate times for the flash function
async function showLightSequence() {
    gameLost = false ;
    await setGameStarted(false);
    for(let i = 0 ; i <lightArray.length ; i++){
        if(lightArray[i] === 1) {
            await flash('#green',200,1000);
        } else if(lightArray[i] === 2){
            await flash('#red',200,1000);
        } else if(lightArray[i] === 3){
            await flash('#blue',200,1000);
        } else if(lightArray[i] === 4){
            await flash('#yellow',200,1000);
        }
    }
    await setGameStarted(true);
    await setTimeleft();
    playerTimer();
}

//assesses the HTML button clicked and assigns the relevant number to be pushed onto the array
async function colourClicked(colour) {
    console.log(gameStarted);
    if(gameStarted === false) {
        return;
    }
    if(colour === 'green'){
        playerLights.push(1);
        div = document.querySelector('#green');
        originalColor = getComputedStyle(div).backgroundColor;
        div.style.backgroundColor = "#F5F5F5";
        await sleeper(300);
        div.style.backgroundColor = originalColor;
    }else if(colour === 'red'){
        playerLights.push(2);
        div = document.querySelector('#red');
        originalColor = getComputedStyle(div).backgroundColor;
        div.style.backgroundColor = "#F5F5F5";
        await sleeper(300);
        div.style.backgroundColor = originalColor;
    }else if(colour === 'blue'){
        playerLights.push(3);
        div = document.querySelector('#blue');
        originalColor = getComputedStyle(div).backgroundColor;
        div.style.backgroundColor = "#F5F5F5";
        await sleeper(300);
        div.style.backgroundColor = originalColor;
    }else if(colour === 'yellow'){
        playerLights.push(4);
        div = document.querySelector('#yellow');
        originalColor = getComputedStyle(div).backgroundColor;
        div.style.backgroundColor = "#F5F5F5";
        await sleeper(300);
        div.style.backgroundColor = originalColor;
    }

    if(playerLights.length != lightArray.length) {
        return;
    }

    //calls checkUserInputs when the arrays have an equal length
    let resp = '';
    console.log(playerLights.length +" " +lightArray.length);
    if(playerLights.length === lightArray.length ) {
        resp = checkUserInputs();
    }
    console.log(resp+" this is the resp");
    var a = resp;

    //force wait for add to sequence
    let answer = '';
    const validate = async () => {
        const a = await resp;
        answer=a;
        if(a === true ){
            console.log(a);
            await addToSequence();
        }else{
            console.log(gameLost);
            cleanUp("Incorrect Entry - You Lost");
        }
    };

    //calls async block
    validate();

    //game was showing out of time after game lost, fixed here
    if(gameLost == false){
        await sleeper(1000);
        playerLights=[];
        await showLightSequence();
        await setTimeleft();
        playerTimer();
    }
}

//compares the numbers in each array to see if they match
async function checkUserInputs() {
    clearInterval(time);

    for(var i=0;i<lightArray.length;i++) {
        if(lightArray[i]!=playerLights[i]) {
            await setGameLost();
            return false;
        }
    }
    return true;
}

//calls sleep function to create delay
async function sleeper(delay) {
    await sleep(delay);
}

//logic here==> https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//called to generate the relevant loss indicator in the top div of the HTML document
//calls clear interval to reset the time
async function gameOver(txt){
    await setGameLost();
    clearInterval(time);
    var myDiv = document.getElementById("gameOver");
    myDiv.innerHTML = txt;
}

//compares highScore to the size of the simon array and sets the length of the light array to the highScore if it is larger
//https://stackoverflow.com/questions/29370017/adding-a-high-score-to-local-storage
function doHighScore() {
    var myDiv = document.getElementById("highScore");
    var value = parseInt(myDiv.innerHTML, 10);
    if(value < lightArray.length){
        myDiv.innerHTML=lightArray.length;
    }
}

//counts down from timeleft and sets the alert/ends game if timer expires
function playerTimer(){
    console.log(gameLost+ "playerTimer");
    if(gameLost == false){
        time = setInterval(function(){  //https://www.w3schools.com/jsref/met_win_setinterval.asp
            if(timeleft <= 0){
                clearInterval(time);
                cleanUp("Game Over - Ran Out Of Time");
            }
            timeleft -= 1;
        }, 1000);
    }
}

//resets timer and displays message in first div depending on how game ends (message passed from relevant function)
//calls doHighScore to assess if a new high score is to be set
//resets both arrays
//resets LED to red
//calls flashFiceTimes to indicate game is over
function cleanUp(reason){
    gameLost=true;
    clearInterval(time);
    doHighScore();
    playerLights=[];
    lightArray = [];
    led.style.backgroundColor="red";
    gameOver(reason);
    flashFiveTimes();
}

//used to reset the 5 second timer
async function setTimeleft(){
    clearInterval(time);
    console.log("setting time");
    timeleft=5;
    console.log(timeleft);
}

async function setGameLost(){
    gameLost=true;
}


//uses for loop and sleeper to set the background colours of each button to grey and then back to their original repeatedly
async function flashFiveTimes(){

    for(let i = 0 ; i < 5 ; i++) {
        div = document.querySelector('#red');
        originalColor = getComputedStyle(div).backgroundColor;
        div.style.backgroundColor = "#F5F5F5";

        div1 = document.querySelector('#blue');
        originalColor1 = getComputedStyle(div1).backgroundColor;
        div1.style.backgroundColor = "#F5F5F5";

        div2 = document.querySelector('#green');
        originalColor2 = getComputedStyle(div2).backgroundColor;
        div2.style.backgroundColor = "#F5F5F5";

        div3 = document.querySelector('#yellow');
        originalColor3 = getComputedStyle(div3).backgroundColor;
        div3.style.backgroundColor = "#F5F5F5";

        await sleeper(400);
        div.style.backgroundColor = originalColor;
        div1.style.backgroundColor = originalColor1;
        div2.style.backgroundColor = originalColor2;
        div3.style.backgroundColor = originalColor3;
        await sleeper(100);
    }
}