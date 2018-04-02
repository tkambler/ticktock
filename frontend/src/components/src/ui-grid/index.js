'use strict';

import app from 'app';
import _ from 'lodash';

require('./ui-grid.service');
require('./style.scss');

app.component('uiGrid', {
    'bindings': {
        'options': '<'
    },
    'controller': function($log, UIGrid) {

        return new class {

            $onInit() {

                // $log.debug('uiGrid', { 'this': this });
                this.options = _.cloneDeep(this.options);
                this.grid = new UIGrid(this.options);
                if (this.options.onReady) {
                    this.options.onReady({
                        'reload': () => {
                            this.grid.init();
                        }
                    });
                }
                this.grid.init()
                    .then(() => {
                        this.generatePaginationDropdown();
                        this.generateColumnsDropdown();
                        this.generateActionsDropdown();
                        this.generateFiltersDropdown();
                        this.generateSearchInput();
                    });

            }

            generatePaginationDropdown() {

                let options = {
                    'label': `Pagination: ${this.grid.activePagination}`,
                    'size': 'small',
                    'links': this.grid.pagination.map((value) => {
                        return {
                            'label': value,
                            'fn': () => {
                                return this.grid.setPagination(value)
                                    .then(this.generatePaginationDropdown.bind(this));
                            }
                        };
                    })
                };

                this.paginationDropdown = options;

            }

            generateColumnsDropdown() {

                const preferences = this.grid.preferences;

                let options = {
                    'label': 'Columns',
                    'size': 'small',
                    'links': this.grid.toggleableColumns.map((column) => {
                        return {
                            'label': column.label,
                            'klass': preferences.columns[column.object_key].toggled ? '' : 'disabled',
                            'fn': () => {
                                return this.grid.toggleColumn(column.object_key)
                                    .then(this.generateColumnsDropdown.bind(this));
                            }
                        };
                    })
                };

                this.columnsDropdown = options;

            }

            generateActionsDropdown() {

                const links = [
                    {
                        'label': 'Refresh Table',
                        'fn': () => {
                            this.grid.init();
                        }
                    },
                    {
                        'label': 'Export to CSV',
                        'fn': () => {
                            this.grid.exportCSV();
                        }
                    }
                ];

                if (this.options.toolbar_actions.length > 0) {
                    links.push({ 'divider': true });
                }

                links.splice(links.length, 0, ...this.options.toolbar_actions.map((action) => {
                    return {
                        'label': action.label,
                        'fn': () => {
                            action.fn(this.grid.getToggledRows());
                        }
                    };
                }));

                let options = {
                    'label': 'Actions',
                    'size': 'small',
                    'links': links
                };

                this.actionsDropdown = options;

            }

            generateFiltersDropdown() {

                const links = [
                    {
                        'label': 'No Filter',
                        'fn': () => {
                            this.grid.setFilter()
                                .then(this.generateFiltersDropdown.bind(this));
                        }
                    }
                ];
                
                _.each(this.grid.filters, (filters, groupName) => {

                    const group = {
                        'label': groupName
                    };

                    group.links = filters.map((filter) => {
                        return {
                            'label': filter.label,
                            'fn': () => {
                                this.grid.setFilter(filter)
                                    .then(this.generateFiltersDropdown.bind(this));
                            }
                        };
                    });

                    links.push(group);

                });

                let options = {
                    'label': this.grid.chosenFilter ? `Filter: ${this.grid.chosenFilter.label}` : 'Filter: None',
                    'size': 'small',
                    'links': _.orderBy(links, 'label')
                };

                this.filtersDropdown = options;

            }

            generateSearchInput() {

                this.searchOptions = {
                    'columns': _.filter(this.grid.toggledColumns, { 'searchable': true })
                };

            }
            
            get showCharts() {
                
                return this.grid.showCharts;
                
            }
            
            get charts() {
                
                return this.grid.charts;
                
            }
            
            get sortColumn() {
                
                return this.grid.sortColumn;
                
            }
            
            get sortDirection() {
                
                return this.grid.sortDirection;
                
            }
            
            sort(objectKey) {
                
                return this.grid.sort(objectKey);
                
            }

        };

    },
    'template': require('./template.html')
});

app.component('uiGridDropdownButton', {
    'bindings': {
        'options': '<'
    },
    'controller': function() {

        return new class {

            $onInit() {

            }

            get klass() {
                switch (_.get(this, 'options.size')) {
                    case 'small':
                        return 'btn-sm';
                    default:
                        return '';
                }
            }

            get label() {
                return _.get(this, 'options.label');
            }

            get icon() {
                return _.get(this, 'options.icon');
            }

        };

    },
    'template': `
        <button class="btn btn-default dropdown-toggle" ng-disabled="$ctrl.options.links.length === 0" ng-class="$ctrl.klass" data-toggle="dropdown" ng-if="$ctrl.label"><span ng-bind="$ctrl.label" ng-show="$ctrl.label"></span><span ng-show="$ctrl.label"> </span><span class="caret" ng-show="$ctrl.label"></span></button>
        <span ng-class="$ctrl.icon" class="dropdown-toggle dropdown-toggle-icon" data-toggle="dropdown" ng-if="$ctrl.icon"></span>
        <ul class="dropdown-menu dropdown-menu-right">
            <li ng-repeat="link in $ctrl.options.links" ng-class="{ 'dropdown': link.links, 'dropdown-submenu': link.links, 'divider': link.divider }">
                <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label" ng-class="link.klass"></a>
                <a ng-if="link['ui-sref']" ng-attr-ui-sref="{{link['ui-sref']}}" ng-bind-html="link.label" ng-class="link.klass"></a>
                <a ng-if="link.links" data-toggle="dropdown" ng-bind-html="link.label" ng-class="link.klass"></a>
                <ul ng-if="link.links" class="dropdown-menu scrollable-menu">
                  <li ng-repeat="link in link.links">
                    <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label" ng-class="link.klass"></a>
                    <a ng-if="link['ui-sref']" ng-attr-ui-sref="{{link['ui-sref']}}" ng-bind-html="link.label" ng-class="link.klass"></a>
                  </li>
                </ul>
            </li>
        </ul>
    `
});

app.component('uiGridSearchInput', {
    'bindings': {
        'options': '<',
        'onSearch': '&'
    },
    'require': {
        'uiGrid': '^^'
    },
    'controller': function($log) {

        return new class {

            $onInit() {
                this.model = {};
            }

            get columns() {
                return _.get(this, ['options', 'columns']) || [];
            }

            get activeColumn() {
                return this.uiGrid.grid.searchColumn;
            }

            setColumn(col) {
                this.uiGrid.grid.searchColumn = col;
            }

            submit() {
                return this.uiGrid.grid.search();
            }

        };

    },
    'template': `
    <form ng-submit="$ctrl.submit()">
    <div class="input-group input-group-sm">
      <input type="text" class="form-control" placeholder="Search" ng-model="$ctrl.uiGrid.grid.searchText">
      <div class="input-group-btn">
        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">Search By: <span ng-bind="$ctrl.activeColumn.label">-</span> <span class="caret"></span></button>
        <ul class="dropdown-menu dropdown-menu-right">
            <li ng-repeat="column in $ctrl.columns"><a ng-click="$ctrl.setColumn(column)" ng-bind="::column.label"></a></li>
        </ul>
      </div>
      <div class="input-group-btn">
        <button class="btn btn-default" type="submit"><i class="glyphicon glyphicon-search"></i></button>
      </div>
    </div>
    </form>
    `
});