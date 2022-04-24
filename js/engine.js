var Engine = (function(global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 707;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    function main() {
                // Freezes the game when the player's lives equals 0
                if (player.lives != 0) {
                    var now = Date.now(),
                    dt = (now - lastTime) / 1000.0;

                    update(dt);
                    render();

                    lastTime = now;
                }

                win.requestAnimationFrame(main);

    }

    function init() {
        if (!isMobile) {
            gameStartPopup.create();
            var delayInit;

            // Delays the start of the game until a character has been chosen
            delayInit = setInterval(function() {
                if (player.sprite != "") {
                    lastTime = Date.now();
                    clearInterval(delayInit);
                    main();
                }
            }, 500);
        } else {
            handheldPopup.create();
        }
    }

    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    function render() {
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 4 of stone
                'images/stone-block.png',   // Row 2 of 4 of stone
                'images/stone-block.png',   // Row 3 of 4 of stone
                'images/stone-block.png',   // Row 3 of 4 of stone                
                'images/grass-block.png'   // Row 1 of 1 of grass
            ],
            numRows = 6,
            numCols = 7,
            row, col;

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    function renderEntities() {
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        allBonuses.forEach(function(bonus) {
            bonus.render();
        });

        player.render();
    }

    function reset() {
        // noot
    }

    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Heart.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Star.png',
        'images/clock.png'
    ]);
    Resources.onReady(init);

    global.ctx = ctx;
})(this);
