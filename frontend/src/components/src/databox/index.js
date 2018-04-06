'use strict';

import app from 'app';
import _ from 'lodash';
require('./style.scss');

app.component('databox', {
    'bindings': {
        'options': '<'
    },
    'controller': function($log, $element, filterEnabled) {
        
        const validColumns = [6, 12];

        return new class {

            $onInit() {
                // $log.debug('databox', { 'this': this, 'sections': this.options.sections });
            }

            $onChanges(changes) {

                if (!changes.options || !changes.options.isFirstChange()) {
                    return;
                }
                
                this._heading = this.options.heading;
                
                _.defaults(this.options, {
                    'actions': [],
                    'sections': []
                });
                
                if (_.get(this, 'options.items', []).length > 0) {
                    this.options.sections.splice(0, 0, {
                        'items': this.options.items
                    });
                    delete this.options.items;
                }
                
                this._sections = _.chain(this.options.sections)
                    .cloneDeep()
                    .map((section) => {
                        _.defaults(section, {
                            'items': []
                        });
                        const items = filterEnabled(_.chain(section.items)
                            .filter((item) => {
                                return item.label;
                            })
                            .map((item) => {
                                item.value = !_.isUndefined(item.value) ? item.value : '-';
                                item.columns = validColumns.indexOf(item.columns) >= 0 ? item.columns : 6;
                                item.klass = `col-xs-${item.columns}`;
                                return item;
                            })
                            .value());
                        section.items = [];
                        items.forEach((item) => {
                            if (item.break) {
                                delete item.break;
                                section.items.push({
                                    'break': true,
                                    'klass': 'clearfix'
                                });
                                section.items.push(item);
                            } else {
                                section.items.push(item);
                            }
                        });
                        return section;
                    })
                    .value();
                    
            }

            $postLink() {
                
                _.defer(() => {
                    $element.find('[data-toggle="tooltip"]').tooltip();
                });
                
            }
            
            get actions() {
                
                return this.options.actions;
                
            }
            
            get actionOptions() {
                
                if (this._actionOptions) {
                    return this._actionOptions;
                }
                
                this._actionOptions = {
                    'label': 'Actions',
                    'size': 'small',
                    'links': this.actions
                };
                
                return this._actionOptions;
                
            }

            get sections() {
                
                return this._sections || [];
                
            }

            get heading() {
                
                return this._heading;
                
            }

        };

    },
    'template': require('./template.html')
});