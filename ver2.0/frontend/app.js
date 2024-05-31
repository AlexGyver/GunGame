// =================== DATA ===================
let engine = new Engine();
// =================== P5JS ===================
function setup() {
    engine.setup();
}
function windowResized() {
    engine.resize();
}
function draw() {
    engine.update();
}