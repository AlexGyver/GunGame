class MainMenu {
    menu;
    listeners = [];

    constructor(games) {
        this.menu = QuickSettings.create(0, 0, "Menu");
        this.menu.addDropDown("Game", games);
        // TODO this.menu.addDropDown("Hunters", [1,2,3,4,5,6]);
        this.menu.addButton('Start', this._bttnStartAction.bind(this));
        this.menu.addButton('Exit', this._bttnExitAction.bind(this));
        this.menu.disableControl('Exit');
        this.menu.hideControl('Exit');
        this.menu.setDraggable(false);
        this.menu.setWidth(150);
    }

    collapse() {
        this.menu.collapse();
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    _fireEvent(event) {
        this.listeners.forEach(listener => listener(event));
    }

    _bttnStartAction() {
        this.menu.disableControl('Game');
        this.menu.disableControl('Start');
        this.menu.hideControl('Start');
        this.menu.enableControl('Exit');
        this.menu.showControl('Exit');
        let event = {
            "type": "startGame",
            "game": this.menu.getValue('Game')
        }
        this._fireEvent(event);
    }

    _bttnExitAction() {
        this.menu.enableControl('Game');
        this.menu.disableControl('Exit');
        this.menu.hideControl('Exit');
        this.menu.enableControl('Start');
        this.menu.showControl('Start');
        let event = {
            "type": "exitGame"
        }
        this._fireEvent(event);
    }
}

class GunMenu {
    menu;
    index;
    listeners = [];

    constructor(idx) {
        this.name = `Hunter${idx}`;
        this.index = idx;
        this.menu = QuickSettings.create(idx * 150, 0, this.name);
        this.menu.addText("Name", this.name, this._txtNameChangeAction.bind(this))
        this.menu.addText('IP', '192.168.10.18');
        this.menu.addButton('Connect', this._bttnConnectAction.bind(this));
        this.menu.addButton('Disconnect', this._bttnDisconnectAction.bind(this));
        this.menu.hideControl('Disconnect');
        this.menu.addHTML("Status", "Not connected");
        this.menu.addRange("Treshold", 0, 255, 10, 5, this._rngTresholdChangeAction.bind(this));
        this.menu.addHTML("Debug", `<div id='debug_raw${idx}' class='debug'></div><div id='debug_col${idx}' class='debug'></div>`);
        this.menu.setDraggable(false);
        this.menu.setWidth(150);
        this.menu.collapse();
    }

    collapse() {
        this.menu.collapse();
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    getName() {
        return this.name;
    }

    setDebugColors(raw_rgb, compute_rgb) {
        try {
            document.getElementById(`debug_raw${this.index}`).style.background = 'rgb(' + raw_rgb + ')';
            document.getElementById(`debug_col${this.index}`).style.background = 'rgb(' + compute_rgb + ')';
        } catch (e) {
        }
    }

    setConnectingState() {
        this.menu.setValue('Status', 'Connecting');
        this.menu.disableControl('Connect');
        this.menu.hideControl('Connect');
        this.menu.disableControl('Disconnect');
        this.menu.hideControl('Disconnect');
    }

    setConnectedState() {
        this.menu.setValue('Status', 'Connected');
        this.menu.disableControl('Connect');
        this.menu.hideControl('Connect');
        this.menu.enableControl('Disconnect');
        this.menu.showControl('Disconnect');
    }

    setErrorState() {
        this.menu.setValue('Status', 'Error');
        this.menu.disableControl('Disconnect');
        this.menu.hideControl('Disconnect');
        this.menu.enableControl('Connect');
        this.menu.showControl('Connect');
    }

    setCloseState() {
        this.menu.setValue('Status', 'Disconnect');
        this.menu.disableControl('Disconnect');
        this.menu.hideControl('Disconnect');
        this.menu.enableControl('Connect');
        this.menu.showControl('Connect');

    }

    _fireEvent(event) {
        this.listeners.forEach(listener => listener(event));
    }

    _bttnConnectAction() {
        this.menu.disableControl('Connect');
        this.menu.disableControl('Disconnect');
        let event = {
            "type": "connect",
            "ip": this.menu.getValue("IP")
        };
        this._fireEvent(event);
    }

    _bttnDisconnectAction() {
        this.menu.disableControl('Connect');
        this.menu.disableControl('Disconnect');
        let event = {
            "type": "disconnect"
        };
        this._fireEvent(event);
    }

    _rngTresholdChangeAction() {
        let event = {
            "type": "treshold",
            "value": this.menu.getValue("Treshold"),
        };
        this._fireEvent(listener => listener(event));

    }

    _txtNameChangeAction(value) {
        this.name = value;
        let event = {
            "type": "name",
            "value": value,
        };
        this.listeners.forEach(listener => listener(event));
    }

}
