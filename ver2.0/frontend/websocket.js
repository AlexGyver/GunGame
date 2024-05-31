class WebSocketController {
    listeners = new Array(0);
    ws = null;
    timeoutID = null;
    host = null;
    is_retry = true;

    constructor() {
    }


    removeListener(func) {
        this.listeners.splice(this.listeners.indexOf(func), 1);
    }

    addListener(func) {
        this.listeners.push(func);
    }

    retry() {
        if (this.host && this.is_retry) {
            this.open(this.host);
        } else {
            clearTimeout(this.timeoutID);
        }
    }

    open(host) {
        if (!this.ws && host) {
            this.host = host ? host : this.host;
            this.listeners.forEach(func => func({type: "connecting"}));
            this.ws = new WebSocket(`ws://${host}:81`);
            this.ws.onopen = () => {
                console.log("onopen");
                this.listeners.forEach(func => func({type: "open"}));
            };
            this.ws.onclose = () => {
                console.log("onclose");
                this.listeners.forEach(func => func({type: "close"}));
                this.ws = null;
            }
            this.ws.onmessage = (e) => {
                console.log(`onmessage(${e})`);
                this.listeners.forEach(func => func({type: "message", message: e}));
            }
            this.ws.onerror = (ev) => {
                console.log(`onerror(e${ev})`);
                this.ws = null;
                this.listeners.forEach(func => func({type: "error", message: ev}));
                this.timeoutID = setTimeout(this.retry, 1000);
            }
        } else if (!host) {
            console.log("Host isn't set!");
        } else {
            console.log("Websocket is already opened!");
        }
    }

    close() {
        this.host = null;
        this.ws.close(1000, "Close");
    }

    is_open() {
        return (this.ws && this.ws.readyState === 1);
    }
}