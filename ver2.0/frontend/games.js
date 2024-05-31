function randomInt(min, max) {
    rnd = Math.floor(Math.random() * (max - min) + min);
    return rnd >= max ? max - 1 : rnd;
}

class Engine {
    static GAMES = ["Calibrator", "Balls", "Move Balls", "Birds"]
    game = null;
    toolbar = [];
    scene = null;


    constructor() {
        this.scene = new Scene();
    }

    setup() {
        let mainMenu = new MainMenu(Engine.GAMES);
        mainMenu.addListener(this.mainMenuEventAction.bind(this))
        this.toolbar.push(mainMenu);
        for (let i = 1; i <= 3; i++) {
            let gun = new Gun(i);
            gun.addShotListener(this.gunEventAction.bind(this));
            this.toolbar.push(gun);
        }
        this.scene.setup();
    }

    update() {
        if (this.game) {
            this.game.update();
        }
        this.scene.draw();
    }

    resize() {
        this.scene.resize();
    }

    gunEventAction(event) {
        if (this.game && event) {
            this.game.shotEventAction(event);
        }
    }

    mainMenuEventAction(event) {
        if (event && "type" in event) {
            switch (event.type) {
                case "startGame":
                    switch (event.game.index) {
                        case 0:
                            this.game = new GameCallibrator(this.scene);
                            break;
                        case 1:
                            this.game = new GameBalls(this.scene);
                            break;
                        case 2:
                            this.game = new GameMoveBalls(this.scene);
                            break;
                        case 3:
                            this.game = new GameBirds(this.scene);
                            break;
                    }
                    this.game.setup();
                    this.scene.resume();
                    break;
                case "exitGame":
                    this.game = null;
                    this.scene.clear();
                    this.scene.pause();
                    break;
            }
        }
    }
}

// =========================== CORE ===========================
class GameCore {
    static codes = ['f00', '0f0', '00f', 'ff0', '0ff', 'f0f'];
    is_dark = true;
    shots_count = 0;
    hits_count = 0;
    objects = {};
    shotsSounds = [];
    hitsSounds = [];
    scene = null;

    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        // TODO this.font = loadFont("assets/Inconsolata.otf");
        for (let i = 0; i < 3; i++) {
            this.shotsSounds.push(loadSound(`./assets/sound/shot${i}.mp3`));
        }
        for (let i = 0; i < 3; i++) {
            this.hitsSounds.push(loadSound(`./assets/sound/hit${i}.mp3`));
        }
    }

    close() {
        this.scene.clear();
    }


    _hit() {
        this.hitsSounds[randomInt(0, this.hitsSounds.length)].play();
    }

    _shot() {
        this.shotsSounds[randomInt(0, this.shotsSounds.length)].play();
    }

    addObject(code, object) {
        this.objects[code] = object
        this.scene.addObject(object);
    }

    removeObject(code) {
        if (code in this.objects) {
            let object = this.objects[code]
            if (object) {
                let object = this.objects[code];
                this.scene.removeObject(object);
                delete this.objects[code];
                return object;
            }
        }
        return null;
    }

    shotEventAction(event) {
        if (event) {
            this._shot();
            this.shots_count++;
            let code = event.driver.to_code(event.package);
            let object = this.removeObject(code);
            if (object) {
                object.update(this, this.scene, "KILLED");
                this._hit();
                this.hits_count++;
            }
        }
    }

    update() {
        for (let code in this.objects) {
            this.objects[code].update(this, this.scene, null);
        }
    }

    getStatisticObject() {
        /*let accuracy = (this.shots_count > 0 ? Math.round(this.hits_count / this.shots_count * 100) : 0);
        textFont(this.font);
        textSize(32);
        fill(0);
        text('Accuracy: ' + accuracy + '%', 10, 10);*/
    }
}

// =========================== GAMES ===========================
class GameCallibrator extends GameCore {
    is_dark = true;
    object = null;

    constructor(scene) {
        super(scene);
        let colorCode = this.is_dark ? '#111' : '#fff';
        this.object = new SolidBackground(colorCode)
        scene.addObject(this.object);
    }

    shotEventAction(event) {
        if (event) {
            this._shot();
            if (this.is_dark) {
                event.driver.set_black(event.package);
                this.object.colorCode = '#fff';
                this.is_dark = false;
            } else {
                event.driver.set_white(event.package);
                this.object.colorCode = '#111';
                this.is_dark = true;
            }
        }
    }
}

class GameBalls extends GameCore {
    delay = 0;

    constructor(scene) {
        super(scene);
        scene.addBackground(new BoxBackground());
    }

    update() {
        if (this.delay <= 0) {
            this.delay = randomInt(2 * 60, 5 * 60);
            let color_idx = randomInt(0, GameCore.codes.length);
            let color_code = GameCore.codes[color_idx];
            if (!(color_code in this.objects)) {
                let object = new BallActor('#' + color_code, 0.5);
                this.addObject(color_code, object);
            }
        } else {
            this.delay -= 1;
        }
        super.update();
    }
}

class GameMoveBalls extends GameCore {
    delay = 0;

    constructor(scene) {
        super(scene);
        scene.addBackground(new BoxBackground());
    }

    update() {
        if (this.delay <= 0) {
            this.delay = randomInt(2 * 60, 5 * 60);
            let color_idx = randomInt(0, GameCore.codes.length);
            let color_code = GameCore.codes[color_idx];
            if (!(color_code in this.objects)) {
                let object = new MoveBallActor('#' + color_code, 0.5, 1);
                this.addObject(color_code, object);
            }
        } else {
            this.delay -= 1;
        }
        super.update();
    }
}

class GameBirds extends GameCore {
    static birdsCodes = ['f00', '00f', 'ff0', 'f0f'];
    static birdsColors = ['Red', 'Blue', 'Yellow', 'Magenta'];
    static birdsSprites = {};
    delay = 0;

    constructor(scene) {
        super(scene);
        scene.addBackground(new SolidBackground('#222'));
        scene.addForefront(new FieldForefront());
        for (let i = 0; i < GameBirds.birdsColors.length; i++) {
            let colorCode = GameBirds.birdsCodes[i];
            let colorName = GameBirds.birdsColors[i];
            GameBirds.birdsSprites[colorCode] = [];
            for (let j = 0; j < 5; j++) {
                GameBirds.birdsSprites[colorCode].push(loadImage(`./assets/images/birds/${colorName}${j}.png`));
            }
        }
    }

    update() {
        if (this.delay <= 0) {
            this.delay = randomInt(60, 4 * 60);
            let colorIdx = randomInt(0, GameBirds.birdsCodes.length);
            let colorCode = GameBirds.birdsCodes[colorIdx];
            if (!(colorCode in this.objects)) {
                let object = new BirdActor(0.7, 1, GameBirds.birdsSprites[colorCode]);
                this.addObject(colorCode, object);
            }
        } else {
            this.delay -= 1;
        }
        super.update();
    }
}