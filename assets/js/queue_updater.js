export default class QueueUpdater {
    constructor(handler, timeout) {
        this._queue = [];
        this._handler = handler;
        this._timeout = timeout;
        this._interval = null;
        this._isProcessing = null;
    }

    push(item) {
        this._queue.push(item);
    }

    start() {
        this._interval = setInterval(() => {
            if (!this._isProcessing) {
                var item = this._queue.shift();
                if (item !== undefined) {
                    this._isProcessing = true;
                    this._handler(item, () => {
                        this._isProcessing = false;
                    });
                }
            }
        }, this._timeout);
    }

    stop() {
        clearInterval(this._interval);
    }
}
