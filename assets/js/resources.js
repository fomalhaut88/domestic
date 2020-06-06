import { v4 as uuidv4 } from 'uuid';


const DEFAULT_BLOCK_ID = '0';


class _Resource {
    constructor(api, name, getBlockId) {
        this._api = api;
        this.name = name;
        this.getBlockId = getBlockId;

        if (this.getBlockId === undefined) {
            this.getBlockId = objId => DEFAULT_BLOCK_ID;
        }
    }

    getDataKey(blockId) {
        return `${this.name}:${blockId}`;
    }

    getBlock(blockId, callback) {
        if (!blockId) {
            blockId = DEFAULT_BLOCK_ID;
        }
        var dataKey = this.getDataKey(blockId);
        this._api.get(
            dataKey,
            item => {
                var block = JSON.parse(item.data);
                callback(block);
            },
            () => {
                callback({});
            }
        );
    }

    saveBlock(blockId, block, callback) {
        if (!blockId) {
            blockId = DEFAULT_BLOCK_ID;
        }
        var dataKey = this.getDataKey(blockId);
        var data = JSON.stringify(block);
        this._api.save(dataKey, data, callback);
    }

    deleteBlock(blockId, callback) {
        if (!blockId) {
            blockId = DEFAULT_BLOCK_ID;
        }
        var dataKey = this.getDataKey(blockId);
        this._api.delete(dataKey, callback);
    }

    get(objId, callback) {
        var blockId = this.getBlockId(objId);
        this.getBlock(blockId, block => {
            callback(block[objId]);
        });
    }

    save(objId, obj, callback) {
        var blockId = this.getBlockId(objId);
        this.getBlock(blockId, block => {
            block[objId] = obj;
            this.saveBlock(blockId, block, callback);
        });
    }

    delete(objId, callback) {
        var blockId = this.getBlockId(objId);
        this.getBlock(blockId, block => {
            delete block[objId];
            if (Object.keys(block).length) {
                this.saveBlock(blockId, block, callback);
            } else {
                this.deleteBlock(blockId, callback);
            }
        });
    }
}


export default class Resources {
    constructor() {
        this.general = null;
        this.issues = null;
        this.history = null;
        this.marks = null;
    }

    init(api) {
        this.general = new _Resource(api, 'general');
        this.issues = new _Resource(api, 'issues');
        this.history = new _Resource(api, 'history');
        this.marks = new _Resource(api, 'marks', objId => objId.split(':')[0]);
    }

    generateUniqueId() {
        return uuidv4();
    }
}
