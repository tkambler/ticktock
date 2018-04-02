'use strict';

const port = 9000;
const express = require('express');
const app = express();
const path = require('path');

app.use('/', express.static(path.resolve(__dirname, 'public')));

app.listen(port, (err) => {
    
    if (err) {
        throw err;
    }
    
    console.log(`Server is listening on port: ${port}`);
    
});