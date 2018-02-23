'use strict';

const { Writable } = require('stream');

class WritableStream extends Writable {
    
    constructor() {
        
        super();
        
    }
    
    get output() {
        
        return this._output ? this._output : this._output = new Buffer(0);
        
    }
    
    set output(value) {
        
        return this._output = value;
        
    }
    
    _write(chunk, encoding, done) {
        
        this.output = Buffer.concat([this.output, chunk]);
        done();
        
    }
    
}

module.exports = WritableStream;