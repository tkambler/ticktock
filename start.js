'use strict';

require('json5/lib/require');

const Ahoy = require('ahoy-di');
const path = require('path');
const fs = require('fs');

const container = new Ahoy({
    'id': 'services',
    'extendRequire': true,
    'services': path.resolve(__dirname, 'di/services')
});

container.constant('appDir', __dirname);

container.load('boot')
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });