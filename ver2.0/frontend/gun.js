class GunDriver {
    static colors = ["Red", "Green", "Blue", "Yellow", "Cyan", "Magenta", "Black", "White"];
    static codes = ['f00', '0f0', '00f', 'ff0', '0ff', 'f0f', '000', 'fff'];
    static rgbs = [
        [255, 0, 0], [0, 255, 0], [0, 0, 255],
        [255, 255, 0], [0, 255, 255], [255, 0, 255],
        [0, 0, 0], [255, 255, 255]
    ];
    calibrate = {
        "white": [8000, 10000, 10000],
        "black": [18000, 30000, 30000],
        "treshold": 10
    }
    M = [
        [0, 1, 0, 2, 1, 2],
        [1, 0, 1, 2, 0, 2],
        [2, 0, 2, 1, 0, 1],
        [0, 2, 1, 2, 0, 1],
        [1, 0, 2, 0, 1, 2],
        [0, 1, 2, 1, 0, 2],
    ];

    constructor() {
    }

    set_treshold(treshold) {
        this.calibrate.treshold = treshold;
    }

    set_white(pkg) {
        console.log("set_white=" + pkg);
        this.calibrate.white = [pkg[0], pkg[1], pkg[2]];
    }

    set_black(pkg) {
        console.log("set_black=" + pkg);
        this.calibrate.black = [pkg[0], pkg[1], pkg[2]];
    }

    static truncate(value, black, white) {
        if (black > white) {
            return value > black ? black : value < white ? white : value;
        } else {
            return value > white ? white : value < black ? black : value;
        }
    }

    to_pkg(message) {
        return message.data.split(',').map(v => Number(v));
    }

    raw_rgb(pkg) {
        let rgb = [0, 0, 0];
        console.log("1 pkg=" + pkg);
        for (let i = 0; i < 3; i++) {
            let v = GunDriver.truncate(pkg[i], this.calibrate.black[i], this.calibrate.white[i]);
            rgb[i] = Math.round((255 * (v - this.calibrate.black[i])) / (this.calibrate.white[i] - this.calibrate.black[i]));
        }
        console.log("2 rgb=" + rgb);
        return rgb;
    }

    to_index(pkg) {
        let shot_rgb = this.raw_rgb(pkg);
        if (shot_rgb[0] <= this.calibrate.treshold
            && shot_rgb[1] <= this.calibrate.treshold
            && shot_rgb[2] <= this.calibrate.treshold) {
            console.log("3 index=" + 6);
            return 6;
        } else if (shot_rgb[0] >= 255 - this.calibrate.treshold
            && shot_rgb[1] >= 255 - this.calibrate.treshold
            && shot_rgb[2] >= 255 - this.calibrate.treshold) {
            console.log("3 index=" + 7);
            return 7;
        }
        for (let i = 0; i < 6; i++) {
            if (shot_rgb[this.M[i][0]] - shot_rgb[this.M[i][1]] >= this.calibrate.treshold
                && shot_rgb[this.M[i][2]] - shot_rgb[this.M[i][3]] >= this.calibrate.treshold
                && Math.abs(shot_rgb[this.M[i][4]] - shot_rgb[this.M[i][5]]) <= this.calibrate.treshold) {
                console.log("3 index=" + i);
                return i;
            }
        }
        console.log("3 index=None");
    }

    to_name(pkg) {
        return GunDriver.colors[Number(this.to_index(pkg))];
    }

    to_code(pkg) {
        return GunDriver.codes[Number(this.to_index(pkg))];
    }

    to_rgb(pkg) {
        return GunDriver.rgbs[Number(this.to_index(pkg))];
    }
}

class Gun {
    webSocket;
    driver;
    menu;
    listeners = [];

    constructor(idx) {
        this.menu = new GunMenu(idx);
        this.webSocket = new WebSocketController();
        this.driver = new GunDriver();
        this.menu.addListener(this.menuEventAction.bind(this));
        this.webSocket.addListener(this.wsEventAction.bind(this));
    }

    menuEventAction(event) {
        if (event && "type" in event) {
            switch (event.type) {
                case "connect":
                    this.webSocket.open(event.ip);
                    break;
                case "disconnect":
                    this.webSocket.close();
                    break;
                case "treshold":
                    this.driver.set_treshold(event.value);
                    break;
                case "name":
                    console.log("Name was changed! >" + event.value);
                    break;
            }
        }
    }

    wsEventAction(event) {
        if (event && "type" in event) {
            switch (event.type) {
                case "connecting":
                    this.menu.setConnectingState();
                    break;
                case "open":
                    this.menu.setConnectedState();
                    break;
                case "close":
                    this.menu.setCloseState();
                    break;
                case "message":
                    let pkg = this.driver.to_pkg(event.message)
                    let raw_rgb = this.driver.raw_rgb(pkg);
                    let computed_rgb = this.driver.to_rgb(pkg);
                    this.menu.setDebugColors(raw_rgb, computed_rgb);
                    let shot = {
                        "type": "shot",
                        "name": this.menu.getName(),
                        "driver": this.driver,
                        "package": pkg
                    };
                    this.listeners.forEach(listener => listener(shot));
                    break;
                case "error":
                    this.menu.setErrorState();
                    break;
            }
        }
    }

    addShotListener(listener) {
        this.listeners.push(listener);
    }

    removeShotListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
}