'use strict';

const config = {
    'base_api_url': `${window.location.protocol}//${window.location.host}/api`,
    'base_api_protocol': window.location.protocol.split(':')[0],
    'base_api_host': window.location.host
};

export default config;