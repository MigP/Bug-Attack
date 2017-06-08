'use strict';

// Enemy class
var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
};

// Enemy position
Enemy.prototype.update = function(dt) {
    this.x+= dt * this.speed;
    if (!player.isTileEmpty(Math.round(this.x), this.y)) {
        player.playerLoses();
    }
};

// Enemy render
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83 + 40);
};

// Global variable for all the bonuses
var allBonuses;

// Returns the move coordinates for the player's pressed key
function getMoveCoords(keyPressed) {
    if (keyPressed == 'left') {
        return [-1, 0];
    } else if (keyPressed == 'up') {
        return [0, -1];
    } else if (keyPressed == 'right') {
        return [1, 0];
    } else if (keyPressed == 'down') {
        return [0, 1];
    }
}

// Global variables for the player's move coords
var moveX = 0, moveY = 0;

// Player class
var Player = function(name, sprite) {
    var obj = Object.create(Player.prototype);
    obj.x = 3;
    obj.y = 4;
    obj.name = name;
    obj.sprite = sprite;
    obj.score = 0;
    obj.lives = 5;
    obj.health = 5;
    obj.level = 1;

    // Updates the player's position
    obj.update = function() {
        // Moves horizontally only within these limits
        if (obj.x + moveX >= 0 && obj.x + moveX <= 6) {
            obj.x += moveX;
        }
        // Moves vertically only within these limits
        if (obj.y + moveY >= 0 && obj.y + moveY <= 4) {
            obj.y += moveY;
        } else if (obj.y + moveY == -1) {
            player.playerWins();
        }
        // Resets the move coordinates
        moveX = 0;
        moveY = 0;
        // Looks for bonuses on the tile where the player moved to
        player.checkForBonus();
    },
    // Renders the player on the screen
    obj.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83 + 40);
    }

    return obj;
};

// Handles allowed pressed keys
Player.prototype.handleInput = function(keyPressed) {
  if (keyPressed) {
    moveX = getMoveCoords(keyPressed)[0];
    moveY = getMoveCoords(keyPressed)[1];
  }
};

// Checks if player enters a tile with a bonus on it and calls the function to collect the bonus if necessary
Player.prototype.checkForBonus = function() {
    for (var bonuses = 0; bonuses < allBonuses.length; bonuses++) {
        if (allBonuses[bonuses].x == this.x && allBonuses[bonuses].y == this.y) {
            this.collectBonus(allBonuses[bonuses].type, bonuses);
        }
    }
};

// Player's current level which handles difficulty level according to the player score
Player.prototype.adjustLevel = function() {
    this.level = Math.trunc(this.score/50) + 1;
};

// Checks if a tile is empty of enemies
Player.prototype.isTileEmpty = function(x, y) {
    var emptyTile = true;
    if (this.x == x && this.y == y) {
        emptyTile = false;
    }
    return emptyTile;
};

// Fires up when an enemy hits the player
Player.prototype.playerLoses = function() {
    // Loses 1 Health unit and returns to the start position
    this.health--;
    this.x = 3;
    this.y = 4;
    // If Health reaches zero when the player has at least 2 lives, the player loses one life and their health is fully restored
    if (this.health == 0 && this.lives > 1) {
        this.health = 5;
        this.lives--;
    // If Health reaches zero when the player is on their last Life, the player loses that life but their Health isn't restored
    } else if (this.health == 0 && this.lives == 1) {
        this.lives--;
    }
    // Updates the Game Stats on the screen
    updateGameStats();
    // If the player runs out of lives, the clock stops, the lose popup is opened, and the high scores calculated and updated on the screen
    if (this.lives == 0) {
        clearInterval(clock);
        losePopup.create();
        checkHighScores();
    }
};

// Fires up when the player reaches the river
Player.prototype.playerWins = function() {
    // When the player reaches the river, they win 1 Life and then return to the start position
    this.score += 50;
    this.x = 3;
    this.y = 4;
    // Adjusts the game difficulty acording to the player score
    this.adjustLevel();
    // Updates the Game Stats on the screen
    updateGameStats();
};

// Start a new game with the same player
Player.prototype.playAgain = function() {
    // Reset player values and start a new game
    this.health = 5;
    this.score = 0;
    this.x = 3;
    this.y = 4;
    this.level = 1;
    this.lives = 5;
    updateGameStats();
    startClock();
    closePopup();
    createNewEnemies();
    releaseTheEnemies();
};

// Start a new game with a different player
Player.prototype.newPlayer = function() {
    // Reset player values and start a new game
    this.health = 5;
    this.score = 0;
    this.x = 3;
    this.y = 4;
    this.level = 1;
    closePopup();
    gameStartPopup.create();
};

// Checks the maximum number of bonuses to appear on the screen simultaneously depending on the player difficulty level
Player.prototype.checkMaxBonuses = function() {
    if (this.level < 3) {
        return 4;
    } else if (this.level >= 3 && this.level < 5) {
        return 3;
    } else if (this.level >= 5 && this.level < 7) {
        return 2;
    } else {
        return 1;
    }
};

// Checks the type of bunus to appear depending on a random seed and the type of bonus' probability to appear
Player.prototype.checkBonusType = function(seed) {
        if (seed <= 5) {
            return 1;
        } else if (seed > 5 && seed <= 10) {
            return 5;
        } else if (seed > 10 && seed <= 20) {
            return 6;
        } else if (seed > 20 && seed <= 35) {
            return 4;
        } else if (seed > 35 && seed <= 60) {
            return 3;
        } else {
            return 2;
        }
};

// Collect a bonus and remove it from view
Player.prototype.collectBonus = function (type, index) {
    if (type == 1) {
        this.lives++;
    } else if (type == 2) {
        this.score += 5;
    } else if (type == 3) {
        this.score += 10;
    } else if (type == 4) {
        this.score += 20;
    } else if (type == 5) {
        this.health = 5;
    } else {
        timer += 10;
    }
    updateGameStats();
    allBonuses.splice(index, 1);
};

// Checks if a tyle has a bonus or not
Player.prototype.checkIfTileIsFull = function(posX, posY) {
    for (var i = 0; i < allBonuses.length; i++) {
        if ((allBonuses[i].x == posX && allBonuses[i].y == posY) || (this.x == posX && this.y == posY)) {
            return true;
        }
    }
};

// Instantiates all bonuses
Player.prototype.createNewBonuses = function () {
    allBonuses = [];

    var sprite = {"1": "images/Heart.png",
                "2": "images/Gem Blue.png",
                "3": "images/Gem Green.png",
                "4": "images/Gem Orange.png",
                "5": "images/Star.png",
                "6": "images/clock.png"};

    var bonusesTimer;
    bonusesTimer = setInterval(function() {
        var tileFull = false;
        var maxBonuses = player.checkMaxBonuses();
        // Generates a random number that can be -1, 0, or 1 to determine if a bonus is removed, added, or neither
        var newBonus = Math.floor(3 * Math.random() - 1);
        // Generates a random seed for determining the kind of bonus coming next
        var bonusSeed = Math.floor(100 * Math.random());
        var bonusType = player.checkBonusType(bonusSeed);
        var posX = Math.floor(5 * Math.random());
        var posY = Math.floor(5 * Math.random());
        tileFull = player.checkIfTileIsFull(posX, posY);

        // Generates a bonus, deletes one, or do nothing, depending on the newBonus result
        if (newBonus == 1 && allBonuses.length < maxBonuses && !tileFull) {
            var bonus = new Bonuses(bonusType, sprite[bonusType], posX, posY);
            allBonuses.push(bonus);
        } else if (newBonus == -1 && allBonuses.length > 0) {
            var bonusToDelete = Math.floor(allBonuses.length * Math.random());
            allBonuses.splice(bonusToDelete, 1);
        }
    }, 750);
};

// Global variable for the player
var player = new Player("", "");

// Bonuses class
var Bonuses = function(type, sprite, x, y) {
    var obj = {x: x, y: y, type: type, sprite: sprite};
    obj.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83 + 60);
    }

    return obj;
};

// Global variables for the enemies
var  allEnemies, numberOfEnemies;

// Instantiates all enemies with random speeds and start positions
function createNewEnemies() {
    allEnemies = [];
    numberOfEnemies = 5;
    for (var i = 0; i < numberOfEnemies; i++) {
        var enemyYPosition = Math.floor(4 * Math.random());
        var enemyXPosition = Math.floor(-5 * Math.random());
        var enemySpeed = Math.floor(3 * Math.random() + 1);
        var enemy = new Enemy(enemyXPosition, enemyYPosition, enemySpeed);
        allEnemies.push(enemy);
    }
}

// Initialises the movement of enemies
function releaseTheEnemies() {
    // Does this every half a second
    setInterval(function(){
        // Checks which enemies left the screen, removes them from the allEnemies array, and adds new ones to it depending on difficulty level
        for (var i = 0; i < allEnemies.length; i++) {
            if (allEnemies[i].x >= 7) {
                allEnemies.splice(i, 1);

                var enemyYPosition = Math.floor(4 * Math.random());
                var enemyXPosition = Math.floor(-5 * Math.random());
                var enemySpeed = Math.floor((player.level + 1) * Math.random() + 1);
                var enemy = new Enemy(enemyXPosition, enemyYPosition, enemySpeed);
                allEnemies.push(enemy);
            }
        }
    }, 500);
}

// Popup class
var popupStyle = function(color, width, height, type) {
    var obj = {color: color, width: width, height: height};
    obj.create = function() {
        createPopup(width, height, color, type);
    }
    return obj;
};

// Different types of popups are created
var gameStartPopup = popupStyle('white', 540, 460, "start"),
helpPopup = popupStyle('skyblue', 650, 550, "help"),
losePopup = popupStyle('salmon', 400, 275, "lose");

// Creates and opens a popup window
function createPopup(width, height, color, type) {
    var popupWidth = width;
    var popupHeight = height;
    var popupTop = "calc(50% - " + popupHeight/2;
    var popupLeft = "calc(50% - " + popupWidth/2;

    $(".popup")[0].innerHTML = "";
    $(".popup").css("backgroundColor", color);
    $(".popup").css("border", "black");
    $(".popup").css("width", popupWidth + "px");
    $(".popup").css("height", popupHeight + "px");
    $(".popup").css("top", popupTop + "px)");
    $(".popup").css("left", popupLeft + "px)");

    if (type == "start") {
        var popupHTML = "<div class='popupContainer'><p>What is your name?</p><input autofocus id='nameInput' name='nameInput' type='text' maxlength='15'><p>Please select your character</p><div class='charContainer'><img class='charPhoto selected' src='images/char-boy.png'><img class='charPhoto' src='images/char-cat-girl.png'><img class='charPhoto' src='images/char-horn-girl.png'><img class='charPhoto' src='images/char-pink-girl.png'><img class='charPhoto' src='images/char-princess-girl.png'></div><div id='buttons'><button class='button' onclick='beginGame();'>Play</button><button class='button' onclick='help(\"start\");'>Help</button></div></div>";
        $(".popup").append(popupHTML);
        $(".popup").css("display", "flex");
        $(".charPhoto").click(function() {
            for (var i = 0; i < $(".charPhoto").length; i++) {
                var el = $(".charPhoto")[i];

                if($(el).hasClass("selected")) {
                    $(el).removeClass("selected");
                }
            }
            $(this).toggleClass("selected");
        });
        $(".popup").css("display", "flex");
    } else if (type == "lose") {
        var popupHTML = "<div class='popupContainer'><p>Better luck next time " + player.name + ".</p><p>Your final score is " + player.score + "</p></div><div id='buttons'><button class='button' onclick='player.playAgain();'>Play again</button><button class='button' onclick='player.newPlayer();'>New player</button><button id='lose-close-button' class='button' onclick='help(\"lose\");'>Help</button></div></div>";
        $(".popup").append(popupHTML);
        $(".popup").css("display", "flex");
    } else if (type == "help") {
        var popupHTML = "<div class='popupContainer'><h1>Bug Attack</h1><h2> 1. Contents</h2><ol><li>Contents</li><li>Installation</li><li>Game play</li><li>Known issues</li><li>Version</li></ol><h2> 2. Installation</h2><p>Copy the folder and all its contents to any location in your computer and open “index.html” to run it.</p><h2> 3. Game play</h2><p>It’s a very hot day and you are desperate for a swim in the fresh water of the river on the other side of the road. You have to cross the road and avoid the killer bugs racing across it. If they get you, you lose precious health and are thrown back to your starting location. To make things worse, you’ll be running against a clock, and as soon as that timer reaches zero, you will lose one life.<br>Lose enough health and you end up losing one of your lives. To spice it up, random bonuses appear out of nowhere on the middle of the road for you to catch. Three kinds of gemstones. A blue one, and the most common, will give you a mere 5 points. A green one, a little less common, will give you 10 points. And an orange one, which will give you 20 points. There are also bonuses that will give you 10 extra time units, but these are rarer. Rarer still are the stars, which will fully restore your health. But the rarest bonus of all is the heart, which gives you an extra life.<br>Despite all these obstacles, you are desperate for that river, and each time you reach it you get 50 points. It’s just a shame that once you do, you’ll be catapulted back to the other side of the road again. <br>Good luck on your quest. And keep in mind that the more points you get the more difficult it will get to cross that road.<br><br><a href='https://github.com/MigP/Bug-Attack' target='_blank'>Bug Attack on GitHub</a><br><br><a href='https://migp.github.io/Bug-Attack/' target='_blank'>GitHub Live Demo</a><br></p><h2> 4. Known issues</h2><p>As of now, there aren’t any that I know of.</p><h2> 5. Version</h2><p>1.0</p></div><button id='help-close-button' class='button' onclick='closeHelp();'>Close</button>";
        $(".popup").append(popupHTML);
        $(".popup").find("p").css("color", "black");
        $(".popup").find("p").css("text-shadow", "none");
        $(".popup").find("p").css("font", "normal normal 1.1em \"Comic Sans MS\", cursive, sans-serif");
        $(".popupContainer").css("display", "flex");
        $(".popupContainer").css("flex-direction", "column");
        $(".popupContainer").css("overflow-y", "auto");
        $(".popupContainer").css("padding", "20px");
        $(".popupContainer").css("text-align", "justify");
        $(".popupContainer").css("margin-right", "20px");

    }
    $("p.popup").css("display", "flex");
}

// Closes a popup window
function closePopup() {
    $(".popup")[0].innerHTML = "";
    $(".popup").css("display", "none");
    $("body").css("backgroundColor", "white");
    $(".highScore").css("display", "flex");
    $(".logo").css("display", "flex");
    $(".help").css("display", "flex");
}

// Creates global variables for game time and starts the clock
var timer, clock;
function startClock() {
    timer = 16;
    $(".time").text("Time: " + 16);
    clock = setInterval(function() {
        if (timer == 0 && player.lives > 1) {
            player.x = 3;
            player.y = 4;
            player.lives--;
            player.health = 5;
            timer = 15;
            updateGameStats();
        } else if (timer == 0 && player.lives == 1) {
            player.lives--;
            updateGameStats();
            clearInterval(clock);
            losePopup.create();
            checkHighScores();
        }
        $(".time").text("Time: " + timer);
        timer--;
    }, 15 * 100);
    player.createNewBonuses();
}

// Updates game stats on the screen
function updateGameStats() {
    $(".name").text("Player: " + player.name);
    $(".score").text("Score: " + player.score);
    $(".health").html("Health: <span class='healthBar'></span>");
    var healthBarWidth = (player.health * 20) + "px";
    $(".healthBar").css("width", healthBarWidth);
    $(".lives").text("Lives: " + player.lives);
}

// Begins the game
function beginGame() {
    if (nameInput.value) {
        player.name = nameInput.value;
        player.sprite = ($(".selected")[0].src).substr(($(".selected")[0].src).indexOf("images/"));
        player.lives = 5;
        updateGameStats();
        startClock();
        closePopup();
        createNewEnemies();
        releaseTheEnemies();
    }
}

// Global variable with high scores
var highScores = [];

// Checks the five highest scores when the game is over
function checkHighScores() {
    $(".highScore")[0].innerHTML = "";
    $(".highScore").append("<p class='scoresTitle'>High Scores</p>");

    highScores.push({"name": player.name, "score": player.score});
    highScores.sort(function(a, b) {
        return parseFloat(b.score) - parseFloat(a.score);
    });
    if (highScores.length > 5) {
        highScores = highScores.slice(0, 5);
    }
    for (var i = 0; i < highScores.length; i++) {
        $(".highScore").append("<div class='scores'><span>" + highScores[i].name + "</span><span>" + highScores[i].score + "</span></div>");
    }
}
 
// Displays help popup window and creates a global variable for the origin of the click for help
var helpClickOrigin;
function help(origin) {
    helpClickOrigin = origin;
    helpPopup.create();
}

// Closes help popup window
function closeHelp() {
    if (helpClickOrigin == 'start') {
        gameStartPopup.create();
    } else if (helpClickOrigin == 'lose') {
        losePopup.create();
    }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
