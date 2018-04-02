'use strict';

import _ from 'lodash';
import tmpStates from 'glob-loader!./modules.states.pattern';
import 'glob-loader!./modules.components.pattern';

const states = {};
_.each(tmpStates, (state, k) => {
    const name = k.split('/')[2];
    states[name] = state;
    states[name].name = name;
});

_.each(states, (state) => {
    const parent = state.name.split('.').reverse().slice(1).reverse().join('.');
    if (!parent) return;
    if (!states[parent]) {
        states[parent] = {
            'name': parent,
            'abstract': true
        };
    }
});

export default states;