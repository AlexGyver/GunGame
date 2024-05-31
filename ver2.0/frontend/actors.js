function randomInt(min, max) {
    rnd = Math.floor(Math.random() * (max - min) + min);
    return rnd >= max ? max - 1 : rnd;
}

class SolidBackground {
    constructor(colorCode) {
        this.colorCode = colorCode;
    }

    /**
     * update object state before draw
     * @param game
     * @param scene
     * @param event
     */
    update(game, scene, event) {

    }

    /**
     * draw actor on scene
     * @param scene
     */
    draw(scene) {
        push();
        let diension = scene.getDimension();
        fill(this.colorCode);
        stroke('#000');
        rect(0, 0, diension.width, diension.height);
        pop();
    }
}

class FieldForefront {

    constructor() {
        this.spriteField = loadImage('assets/images/field.png');
    }

    /**
     * update object state before draw
     * @param game
     * @param scene
     * @param event
     */
    update(game, scene, event) {

    }

    /**
     * draw actor on scene
     * @param scene
     */
    draw(scene) {
        push();
        let dimension = scene.getDimension();
        texture(this.spriteField);
        rect(0, 0, dimension.width, dimension.height);
        pop();
    }
}

class BoxBackground {
    constructor() {
    }

    /**
     * update object state before draw
     * @param game
     * @param scene
     * @param event
     */
    update(game, scene, event) {

    }

    /**
     * draw actor on scene
     * @param scene
     */
    draw(scene) {
        push();
        stroke('#111');
        let diension = scene.getDimension();
        let x = 0.5 * diension.width;
        let y = 0.5 * diension.height;
        fill('#333');
        rect(0, 0, diension.width, diension.height);
        fill('#222');
        rect(0.5 * x, 0.5 * y, x, y);
        line(0, 0, 0.5 * x, 0.5 * y);
        line(2.0 * x, 0, 1.5 * x, 0.5 * y);
        line(0, 2.0 * y, 0.5 * x, 1.5 * y);
        line(2.0 * x, 2.0 * y, 1.5 * x, 1.5 * y);
        pop();
    }
}

class BallActor {
    /**
     *
     * @param colorCode string like '#000'
     * @param size value to chose optimal size of circle
     */
    constructor(colorCode, size) {
        this.color = colorCode;
        this.size = size
    }

    /**
     * update object state before draw
     * @param game
     * @param scene
     * @param event
     */
    update(game, scene, event) {
        if (!this.radius) {
            let dimension = scene.getDimension();
            let baseModifier = randomInt(2, 6);
            this.radius = this.size * (0.128 * dimension.width + 20 * baseModifier);
            this.x = randomInt(this.radius, dimension.width - this.radius);
            this.y = randomInt(this.radius, dimension.height - this.radius);
        }
    }

    /**
     * draw actor on scene
     * @param scene
     */
    draw(scene) {
        push();
        noStroke();
        fill(this.color);
        circle(this.x, this.y, 2 * this.radius);
        pop();
    }
}

class MoveBallActor extends BallActor {
    constructor(colorCode, size, speed) {
        super(colorCode, size);
        this.speed = speed;
    }

    /**
     * update object state before draw
     * @param game
     * @param scene
     * @param event
     */
    update(game, scene, event) {
        let dimension = scene.getDimension();
        if (!this.v) {
            super.update(game, scene, event);
            this.v = createVector();
            this.v.x = randomInt(2, 6) * this.speed * 0.00028 * dimension.width;
            this.v.y = randomInt(2, 6) * this.speed * 0.00028 * dimension.height;
        } else {
            this.x += this.v.x;
            this.y += this.v.y;
            if (this.x > dimension.width - this.radius) {
                this.x = 2 * (dimension.width - this.radius) - this.x;
                this.v.x = -this.v.x;
            } else if (this.x < this.radius) {
                this.x = 2 * this.radius - this.x;
                this.v.x = -this.v.x;
            }
            if (this.y > dimension.height - this.radius) {
                this.y = 2 * (dimension.height - this.radius) - this.y;
                this.v.y = -this.v.y;
            } else if (this.y < this.radius) {
                this.y = 2 * this.radius - this.y;
                this.v.y = -this.v.y;
            }
        }
    }

}

class BirdActor {
    x = null;
    y = null;
    v = null;
    size = null;
    birdSize = null;
    speed = null;
    sprites = null;
    frame = null;
    seed = null;

    constructor(size, speed, sprites) {
        this.sprites = sprites;
        this.size = size;
        this.speed = speed;
        this.frame = 0;
    }

    /**
     * update object state before draw
     * @param game
     * @param scene
     * @param event
     */
    update(game, scene, event) {
        if (event === "KILLED") {
            for (let i = 0; i < randomInt(2, 6); i++) {
                scene.addForefront(new FeatherActor(this.x, this.y, this.birdSize, this.v, this.sprites[4]));
            }
        } else {
            let dimension = scene.getDimension();
            if (!this.birdSize) {
                let baseModifier = randomInt(2, 6);
                let velocity = randomInt(2, 6) * this.speed * 0.00028 * dimension.width;
                this.birdSize = this.size * (0.128 * dimension.width + 20 * baseModifier);
                this.x = randomInt(this.birdSize, dimension.width - this.birdSize);
                this.y = 0.9 * dimension.height - this.birdSize;
                this.v = createVector(0, -1);
                this.v.setMag(velocity);
                this.seed = random();
            } else {
                this.x += this.v.x;
                this.y += this.v.y;
                if (this.x > dimension.width - this.birdSize) {
                    this.x = 2 * (dimension.width - this.birdSize) - this.x;
                    this.v.x = -this.v.x;
                } else if (this.x < this.birdSize) {
                    this.x = 2 * this.birdSize - this.x;
                    this.v.x = -this.v.x;
                }
                if (this.y > 0.9 * dimension.height - this.birdSize) {
                    this.y = 2 * (0.9 * dimension.height - this.birdSize) - this.y;
                    this.v.y = -this.v.y;
                } else if (this.y < 0) {
                    this.y = -this.y;
                    this.v.y = -this.v.y;
                }
                this.seed += 0.06;
                this.v.rotate((noise(this.seed) - 0.5) * PI / 10);
            }
        }
    }

    /**
     * draw actor on scene
     * @param scene
     */
    draw(scene) {
        push();
        let spriteIdx = Math.floor((++this.frame) / 5);
        if (spriteIdx >= this.sprites.length - 1) {
            this.frame = 0;
            spriteIdx = 0;
        }
        let sprite = this.sprites[spriteIdx];
        if (this.v.x < 0) {
            rotateY(QUARTER_PI * 4);
            translate(-2 * this.x - this.birdSize, 0);
        }
        texture(sprite);
        noStroke();
        rect(this.x, this.y, this.birdSize, this.birdSize);
        pop();
    }
}

class FeatherActor {
    constructor(x, y, birdSize, birdV, sprite) {
        this.pos = createVector(x, y);
        this.size = birdSize / 4;
        this.bv = birdV.copy();
        this.sprite = sprite;
        this.v = createVector(1, 1);
        this.v.setHeading(random() * TWO_PI);
        this.v.setMag(random(0.5, 1.0) * this.size / 10);
        this.pos.add(this.v);
        this.angle = random() * TWO_PI;
        this.av = random() * PI / 20;
        this.max = 120;
        this.count = this.max;
    }

    /**
     * update object state before draw
     * @param game
     * @param scene
     * @param event
     */
    update(game, scene, event) {
    }

    /**
     * draw actor on scene
     * @param scene
     */
    draw(scene) {
        if (this.count <= 0) {
            scene.removeForefront(this);
        } else {
            this.v.add(0, 0.05);
            this.bv.setMag(this.bv.mag() * 0.95);
            this.v.setMag(this.v.mag() * 0.97);
            let V = p5.Vector.add(this.bv, this.v);
            this.angle += this.av;
            this.pos.add(V);
            this.count--;
        }
        push();
        translate(this.pos.x, this.pos.y);
        rotateZ(this.angle);
        tint(255, this.count * 255 / this.max);
        texture(this.sprite);
        noStroke();
        rect(-0.5 * this.size, -0.5 * this.size, this.size, this.size);
        pop();
    }
}