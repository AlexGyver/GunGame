// =========================== CORE ===========================
class GameCore {
  shots = 0;
  hits = 0;
  objects = {};

  constructor(data) {
    this.data = data;
  }

  tick() {
    fill(config.dark ? 255 : 0);
    text('Accuracy: ' + (this.shots ? Math.round(this.hits / this.shots * 100) : 100) + '%', 10, windowHeight - 10);

    let shot = this.data.shot;
    if (shot !== null) {
      this.shots++;
      assets.shots[randomInt(assets.shots.length)].play();
      if (shot == '000' || !(shot in this.objects)) {
        // miss
      } else {
        this.objects[shot].hit = true;
        assets.hits[randomInt(assets.hits.length)].play();
        this.hits++;
      }
      this.data.shot = null;
    }
  }
};

// =========================== OBJECTS ===========================
class BallObj {
  hit = false;
  constructor(r) {
    this.size = windowWidth / 2 * config.size + r * 20;
    this.x = randomInt(this.size / 2, windowWidth - this.size / 2);
    this.y = randomInt(this.size / 2, windowHeight - this.size / 2);
    this.col = '#' + Colors.codes[r];
  }
  draw() {
    noStroke();
    fill(this.col);
    circle(this.x, this.y, this.size);
  }
};

class MoveBallObj {
  hit = false;
  constructor(r) {
    this.escaped = false;
    this.size = windowWidth / 2 * config.size + r * 20;
    this.col = '#' + Colors.codes[r];
    this.v = createVector();
    let vx = randomInt(2, 8) * (r + 1) / 6 * 5 * config.speed / 100;
    let vy = randomInt(2, 8) * (r + 1) / 6 * 5 * config.speed / 100;

    if (randomInt(2) == 0) {  // x
      this.x = randomInt(this.size * 2, windowWidth - this.size * 2);
      let dir = randomInt(2);
      this.y = dir ? -this.size : (windowHeight - this.size);
      this.v.x = vx;
      this.v.y = vy;
      if (!dir) this.v.y = -this.v.y;
    } else {
      this.y = randomInt(this.size * 2, windowHeight - this.size * 2);
      let dir = randomInt(2);
      this.x = dir ? -this.size : (windowWidth - this.size);
      this.v.y = vy;
      this.v.x = vx;
      if (!dir) this.v.x = -this.v.x;
    }
  }
  draw() {
    noStroke();
    fill(this.col);
    circle(this.x, this.y, this.size);

    this.x += this.v.x;
    this.y += this.v.y;

    if (!this.escaped) {
      if (this.x >= this.size / 2 && this.x < windowWidth - this.size / 2 &&
        this.y >= this.size / 2 && this.y < windowHeight - this.size / 2) this.escaped = true;
      return;
    }
    if (this.x + this.size / 2 > windowWidth || this.x - this.size / 2 < 0) {
      this.x -= this.v.x;
      this.v.x = -this.v.x;
    }
    if (this.y + this.size / 2 > windowHeight || this.y - this.size / 2 < 0) {
      this.y -= this.v.y;
      this.v.y = -this.v.y;
    }
  }
};

class BirdsObj {
  hit = false;
  constructor(r, w, h, s) {
    this.escaped = false;
    this.w = w;
    this.h = h;
    this.size = w * config.size;
    this.col = '#' + Colors.codes[r];
    this.x = random(windowWidth * (0.5 + 0.3), windowWidth * (0.5 - 0.3))
    this.y = windowHeight / 2 + h / 2 - this.size;
    this.speed = Math.floor(random(1, 6)) * 5 * config.speed / 100;
    this.speedm = Math.floor(6) * 5 * config.speed / 100;

    this.v = createVector(1, 1);
    this.v.setHeading(random(-(0.5 + 0.1) * PI, -(0.5 - 0.1) * PI));
    this.v.setMag(this.speed);

    this.seed = random();
    this.frame = 0;
    this.sprites = s;
  }
  draw() {
    if (frameCount % (this.speedm - this.speed) == 0) {
      if (++this.frame > 3) this.frame = 0;
    }

    let sprite = this.sprites[this.frame].get();
    sprite.resize(this.size, 0);
    imageMode(CENTER);

    if (this.v.x < 0) {
      push();
      scale(-1, 1);
      image(sprite, -this.x, this.y);
      pop();
    } else {
      image(sprite, this.x, this.y);
    }

    this.x += this.v.x;
    this.y += this.v.y;

    if (!this.escaped) {
      if (this.y + this.size / 2 < windowHeight / 2 + this.h / 2 - this.h / 6) this.escaped = true;
      return;
    }

    this.seed += 0.06;
    this.v.rotate((noise(this.seed) - 0.5) * PI / 10);

    if (this.x + this.size / 2 > (windowWidth + this.w) / 2 || this.x - this.size / 2 < (windowWidth - this.w) / 2) {
      this.x -= this.v.x;
      this.v.x = -this.v.x;
    }
    if (this.y + this.size / 2 > windowHeight / 2 + this.h / 2 - this.h / 6 || this.y - this.size / 2 < (windowHeight - this.h) / 2) {
      this.y -= this.v.y;
      this.v.y = -this.v.y;
    }
  }
};
class BirdsFeather {
  constructor(bird) {
    this.pos = createVector(bird.x, bird.y);
    this.size = bird.size / 4;
    this.bv = bird.v.copy();
    this.v = createVector(1, 1);
    this.v.setHeading(random() * TWO_PI);
    this.v.setMag(random(0.5, 1.0) * this.size/10);
    this.pos.add(this.v);
    this.angle = random() * TWO_PI;
    this.av = random() * PI / 20;
    this.sprites = bird.sprites;
    this.max = 30;
    this.count = this.max;
  }
  draw() {
    this.v.add(0, 0.05);
    this.bv.setMag(this.bv.mag() * 0.95);
    this.v.setMag(this.v.mag() * 0.97);
    let V = p5.Vector.add(this.bv, this.v);
    this.pos.add(V);

    push();
    translate(this.pos.x, this.pos.y);
    this.angle += this.av;
    rotate(this.angle);
    tint(255, this.count * 255 / this.max);
    let sprite = this.sprites[4].get();
    sprite.resize(this.size, 0);
    imageMode(CENTER);
    image(sprite, 0, 0);
    pop();
    this.count--;
  }
  end() {
    return this.count <= 0;
  }
};

// =========================== GAMES ===========================
class GameBalls extends GameCore {
  constructor(data) {
    super(data);
  }
  tick() {
    background(config.dark ? 10 : 255);
    if (Math.random() < 0.03) {
      let r = randomInt(6);
      if (!(Colors.codes[r] in this.objects)) {
        this.objects[Colors.codes[r]] = new BallObj(r);
      }
    }
    for (let obj in this.objects) {
      if (this.objects[obj].hit) delete this.objects[obj];
      else this.objects[obj].draw();
    }
    super.tick();
  }
};

class GameMoveBalls extends GameCore {
  constructor(data) {
    super(data);
  }
  tick() {
    background(config.dark ? 10 : 255);
    if (Math.random() < 0.03) {
      let r = randomInt(6);
      if (!(Colors.codes[r] in this.objects)) {
        this.objects[Colors.codes[r]] = new MoveBallObj(r);
      }
    }
    for (let obj in this.objects) {
      if (this.objects[obj].hit) delete this.objects[obj];
      else this.objects[obj].draw();
    }
    super.tick();
  }
};

class GameBirds extends GameCore {
  feathers = [];
  constructor(data) {
    super(data);
  }
  tick() {
    background(config.dark ? 10 : 255);
    imageMode(CENTER);
    let img = assets.sprites.field.get();
    img.resize(windowWidth, 0);
    if (img.height > windowHeight) img.resize(img.width * windowHeight / img.height, 0);

    if (Math.random() < 0.02) {
      let bird = BirdsColors[randomInt(BirdsColors.length)]
      let r = Colors[bird];
      if (!(Colors.codes[r] in this.objects)) {
        this.objects[Colors.codes[r]] = new BirdsObj(r, img.width, img.height, assets.sprites.birds[bird]);
      }
    }
    for (let obj in this.objects) {
      if (this.objects[obj].hit) {
        let feather_am = randomInt(5, 8);
        for (let i = 0; i < feather_am; i++) this.feathers.push(new BirdsFeather(this.objects[obj]));
        delete this.objects[obj];
      }
      else this.objects[obj].draw();
    }
    for (let f in this.feathers) {
      if (this.feathers[f].end()) this.feathers.splice(f, 1);
      else this.feathers[f].draw();
    }

    image(img, windowWidth / 2, windowHeight / 2);

    super.tick();
  }
};