class Scene {
    static DETAIL_LAYER = 3;
    static FOREFRONT_LAYER = 2;
    static OBJECT_LAYER = 1;
    static BACKGROUND_LAYER = 0;
    width = 1440;
    height = 900;
    clBackground = '#fff';
    layers = [[], [], [], []];

    constructor() {

    }

    setup() {
        createCanvas(windowWidth, windowHeight, WEBGL);
    }

    resume() {
        loop();
    }

    getDimension() {
        return {
            "width": this.width,
            "height": this.height
        };
    }

    pause() {
        noLoop();
    }

    resize() {
        resizeCanvas(windowWidth, windowHeight);
    }

    clear() {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i] = [];
        }
    }

    addObject(object) {
        this.layers[Scene.OBJECT_LAYER].push(object);
    }

    removeObject(object) {
        let idx = this.layers[Scene.OBJECT_LAYER].indexOf(object);
        if (idx > -1) {
            this.layers[Scene.OBJECT_LAYER].splice(idx, 1);
        }
    }

    addForefront(object) {
        this.layers[Scene.FOREFRONT_LAYER].push(object);
    }

    removeForefront(object) {
        let idx = this.layers[Scene.FOREFRONT_LAYER].indexOf(object);
        if (idx > -1) {
            this.layers[Scene.FOREFRONT_LAYER].splice(idx, 1);
        }
    }

    addDetail(object) {
        this.layers[Scene.FOREFRONT_LAYER].push(object);
    }

    removeDetail(object) {
        let idx = this.layers[Scene.DETAIL_LAYER].indexOf(object);
        if (idx > -1) {
            this.layers[Scene.DETAIL_LAYER].splice(idx, 1);
        }
    }

    addBackground(object) {
        this.layers[Scene.BACKGROUND_LAYER].push(object);
    }

    clearBackground() {
        this.layers[Scene.BACKGROUND_LAYER] = [];
    }

    removeBackground(object) {
        let idx = this.layers[Scene.BACKGROUND_LAYER].indexOf(object);
        if (idx > -1) {
            this.layers[Scene.BACKGROUND_LAYER].splice(idx, 1);
        }
    }

    draw() {
        background(this.clBackground);
        push();
        if (windowWidth * this.height > this.width * windowHeight) {
            let k = (1.0 * windowHeight) / this.height;
            translate(-0.5 * k * this.width, -0.5 * windowHeight);
            scale(k);
        } else if (windowWidth * this.height < this.width * windowHeight) {
            let k = (1.0 * windowWidth) / this.width;
            translate(-0.5 * windowWidth, -0.5 * k * this.height);
            scale(k);
        } else {
            let k = (1.0 * windowWidth) / this.width;
            translate(-0.5 * k * this.width, -0.5 * k * this.height);
            scale(k);
        }
        this.layers.forEach(layer => layer.forEach(obj => obj.draw(this)));
        pop();
    }
}
