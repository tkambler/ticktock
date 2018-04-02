'use strict';

import app from 'app';
import _ from 'lodash';
import Promise from 'bluebird';

app.factory('UIGrid', function($http, $log, $state, $stateParams, filterEnabled, saveFile) {

    class UIGrid {

        constructor(options) {

            _.defaults(options, {
                'columns': {}
            });

            let columns;

            (() => {
                if (_.isArray(options.columns)) {
                    let cols = {};
                    options.columns.forEach((column) => {
                        cols[column.key] = column;
                    });
                    options.columns = cols;
                }
            })();

            (() => {
                if (!options.url && options.data) {
                    _.each(options.columns, (col, k) => {
                        col.toggleable = false;
                        col.show_by_default = true;
                        col.object_key = k;
                    });
                    columns = options.columns;
                }
            })();

            let toggleAll = false;
            let searchText = '';
            let searchColumn;
            let toggledRows = {};
            let activePagination = 10;
            let charts = [];
            let csvExport;
            let currentPage = 1;
            let data = options.data;
            let filters;
            let defaultValue = options.defaultValue;
            let chosenFilter = $stateParams.gridFilter;
            let metadata;
            let pagination = [10, 25, 50, 100];
            let preferences;
            let processedRows;
            let rawColumns;
            let rawRows;
            let reqCount;
            let toggledColumns;
            let totalCount = 0;
            let totalPages = 0;
            let rowActions = [];
            let totalRowActions = 0;
            let chosenChartItem;
            let sortColumn;
            let sortDirection;

            let updatePreferences = function() {
                return Promise.resolve($http({
                    'url': options.url,
                    'method': 'POST',
                    'params': {
                        'format': 'update_prefs'
                    },
                    'data': {
                        'prefs': preferences
                    }
                }))
                    .then(this.init.bind(this));
            }.bind(this);

            Object.defineProperties(this, {

                'init': {
                    'value': () => {

                        reqCount = 0;
                        searchText = '';
                        searchColumn = null;
                        toggleAll = false;

                        return this.request({});

                    }
                },

                'request': {
                    'value': function({ params, data }) {

                        if (options.url) {
                            return this.requestURL({ 'params': params, 'data': data });
                        } else {
                            return this.requestData({ 'params': params, 'data': data });
                        }

                    }
                },

                'requestURL': {
                    'value': function({ params, data }) {

                        params = params || {};
                        params.count = _.get(preferences, 'pagination');
                        params.req = reqCount;
                        params.filter = chosenFilter;
                        params.search = searchText;
                        params['search-column'] = _.get(searchColumn, 'object_key');
                        params['sort-column'] = sortColumn;
                        params['sort-dir'] = sortDirection;
                        if (_.get(searchColumn, 'column')) {
                            params['search-column'] = _.get(searchColumn, 'column');
                        }

                        return Promise.resolve($http({
                            'url': options.url,
                            'method': 'POST',
                            'params': params,
                            'data': data,
                            'transformResponse': [
                                (data) => {
                                    if (params.format === 'csv') {
                                        return {
                                            'csv': data
                                        };
                                    } else {
                                        return JSON.parse(data);
                                    }
                                }
                            ]
                        }))
                            .tap((res) => {
                                
                                if (res.data.csv) {
                                    return saveFile('data.csv', res.data.csv);
                                }

                                reqCount++;
                                toggledRows = {};

                                if (_.isArray(res.data)) {

                                    this.enablePagination = false;
                                    this.enableColumnToggling = false;
                                    this.enableFilters = false;
                                    this.enableSearching = false;

                                    if (!columns) {
                                        _.each(options.columns, (col, k) => {
                                            col.toggleable = false;
                                            col.show_by_default = true;
                                            col.object_key = k;
                                        });
                                        columns = options.columns;
                                    }

                                    rawRows = res.data;
                                    this.processColumns();
                                    this.processRows(rawRows);

                                } else {

                                    this.enablePagination = true;
                                    this.enableColumnToggling = true;
                                    this.enableFilters = true;
                                    this.enableSearching = true;

                                    activePagination = res.data.metadata.activePagination;

                                    if (!_.isUndefined(res.data.metadata.preferences)) {
                                        preferences = res.data.metadata.preferences;
                                    }
                                    if (!_.isUndefined(res.data.metadata.columns)) {
                                        columns = _(res.data.metadata.columns)
                                            .map((column, k) => {
                                                column.object_key = k;
                                                return column;
                                            })
                                            .value();
                                    }
                                    
                                    if (!_.isUndefined(res.data.metadata.charts)) {
                                        
                                        charts = res.data.metadata.charts.map((chart) => {
                                            let newChart = {
                                                'id': chart.id,
                                                'heading': chart.label,
                                                'data': chart,
                                                'filter': chart.filter,
                                                'onClick': (e) => {
                                                    return this.onChartClick(chart, e);
                                                }
                                            };
                                            return newChart;
                                        });
                                    }
                                    
                                    if (!_.isUndefined(res.data.metadata.csvExport)) {
                                        csvExport = res.data.metadata.csv_export;
                                    }
                                    if (!_.isUndefined(res.data.metadata.filters)) {
                                        filters = _.groupBy(res.data.metadata.filters, 'group');
                                    }
                                    if (!_.isUndefined(res.data.metadata.pagination)) {
                                        pagination = res.data.metadata.pagination;
                                    }
                                    if (!_.isUndefined(res.data.metadata.totalCount)) {
                                        totalCount = res.data.metadata.totalCount;
                                    }
                                    if (!_.isUndefined(res.data.metadata.totalPages)) {
                                        totalPages = res.data.metadata.totalPages;
                                    }

                                    rawRows = res.data.rows;
                                    
                                    this.processColumns();
                                    this.processRows(rawRows);
                                    
                                    searchColumn = searchColumn || columns[0];
                                    
                                    let sc;
                                    if (!sortColumn) {
                                        sc = _.find(columns, {
                                            'default_sort': true
                                        });
                                        if (!sc) {
                                            sc = _.find(columns, {
                                                'primary': true
                                            });
                                        }
                                        sortColumn = _.get(sc, 'object_key');
                                        sortDirection = 'ASC';
                                    }

                                }

                            });

                    }
                },

                'requestData': {
                    'value': function({ params, data }) {

                        return Promise.resolve()
                            .then(() => {

                                params = params || {};
                                _.defaults(params, {
                                    'count': activePagination
                                });

                                if (_.isUndefined(params.page)) {
                                    params.page = currentPage - 1;
                                }

                                let sliceStart = params.page * params.count;
                                let sliceEnd = sliceStart + params.count;
                                const sliced = options.data.slice(sliceStart, sliceEnd);
                                rawRows = _.cloneDeep(sliced);
                                totalCount = options.data.length;
                                totalPages = Math.ceil(totalCount / params.count);
                                this.processColumns();
                                this.processRows(rawRows);

                            });

                    }
                },

                'rows': {
                    'get': () => {
                        return processedRows;
                    }
                },

                'totalPages': {
                    'get': () => {
                        return totalPages;
                    }
                },

                'pagination': {
                    'get': () => {
                        return pagination;
                    }
                },

                'currentPage': {
                    'get': () => {
                        return currentPage;
                    },
                    'set': (page) => {
                        return this.request({
                            'params': {
                                'count': activePagination,
                                'page': page - 1
                            }
                        })
                            .tap(() => {
                                toggleAll = false;
                                currentPage = page;
                            });
                    }
                },

                'activePagination': {
                    'get': () => {
                        return activePagination;
                    }
                },

                'heading': {
                    'get': () => {
                        return options.heading;
                    }
                },
                
                'charts': {
                    'get': () => {
                        return charts;
                    }
                },
                
                'onChartClick': {
                    'value': (chart, e) => {
                        
                        switch (chart.type) {
                            case 'pie':
                                chosenChartItem = {
                                    'label': e.dataItem.title,
                                    'id': chart.id,
                                    'type': chart.type
                                };
                                this.init();
                            break;
                            case 'stacked_column':
                                chosenChartItem = {
                                    'label': e.target.title,
                                    'category': e.item.category,
                                    'id': chart.id,
                                    'type': chart.type
                                };
                                this.init();
                            break;
                            case 'geo':
                                // Set the search value to e.mapObject.search_value
                                // instead of setting a chosenChartItem
                
                                // switch (e.type) {
                
                                //     case 'homeButtonClicked':
                
                                //         $timeout(() => {
                                //             $scope.setSearchValue('');
                                //             $scope.chosenChartItem = null;
                                //         });
                
                                //     break;
                
                                //     case 'clickMapObject':
                
                                //         if (!e.mapObject.search_column || !e.mapObject.search_value) return;
                
                                //         $timeout(() => {
                                //             $scope.setSearchColumn(e.mapObject.search_column);
                                //             $scope.setSearchValue(e.mapObject.search_value);
                                //             $scope.chosenChartItem = null;
                                //         });
                
                                //     break;
                
                                // }
                
                            break;
                            default:
                                chosenChartItem = null;
                            break;
                        }
                        
                    }
                },

                'generateRowActions': {
                    'value': () => {
                        totalRowActions = 0;
                        rowActions = rawRows.map((row) => {
                            if (!_.isFunction(options.row_actions)) {
                                return undefined;
                            }
                            let entry = {
                                'icon': `glyphicon glyphicon-cog`,
                                'size': 'small',
                                'links': filterEnabled(options.row_actions(row))
                            };
                            totalRowActions += entry.links.length;
                            return entry;
                        });
                    }
                },

                'preferences': {
                    'get': () => {
                        return _.cloneDeep(preferences);
                    }
                },

                'totalCount': {
                    'get': () => {
                        return totalCount;
                    }
                },

                'filters': {
                    'get': () => {
                        return filters;
                    }
                },

                'index': {
                    'get': () => {
                        return (currentPage - 1) * activePagination;
                    }
                },

                'enableMultiselect': {
                    'get': () => {
                        return options.enable_multiselect;
                    }
                },

                'toggledRows': {
                    'get': () => {
                        return toggledRows;
                    }
                },

                'toggledColumns': {
                    'get': () => {
                        return toggledColumns;
                    }
                },

                'setFilter': {
                    'value': (filter) => {
                        const stateParams = _.cloneDeep($stateParams);
                        if (filter) {
                            chosenFilter = filter.id;
                            stateParams.gridFilter = chosenFilter;
                        } else {
                            if (stateParams.gridFilter) delete stateParams.gridFilter;
                            chosenFilter = null;
                        }
                        $state.transitionTo($state.current.name, stateParams, {
                            'notify': false
                        });
                        return this.init();
                    }
                },

                'setPagination': {
                    'value': (value) => {
                        preferences.pagination = value;
                        return updatePreferences();
                    }
                },

                'toggleColumn': {
                    'value': (key) => {
                        let column = preferences.columns[key];
                        if (!column) throw new Error(`Unknown column: ${key}`);
                        column.toggled = !column.toggled;
                        return updatePreferences();
                    }
                },

                'chosenFilter': {
                    'get': () => {
                        return this.getFilterById(chosenFilter);
                    }
                },

                'toggleableColumns': {
                    'get': () => {
                        return _(columns)
                            .filter((column) => {
                                return column.toggleable;
                            })
                            .value();
                    }
                },

                'getFilterById': {
                    'value': (id) => {
                        let res;
                        for (let group in filters) {
                            res = _.find(filters[group], { 'id': id });
                            if (res) break;
                        }
                        return res;
                    }
                },
                
                'showCharts': {
                    'get': () => {
                        return charts.length > 0;
                    }
                },

                'processColumns': {
                    'value': () => {
                        toggledColumns = _(columns)
                            .filter((column) => {
                                if (column.toggleable) {
                                    return _.get(preferences, ['columns', column.object_key, 'toggled']);
                                } else {
                                    return column.show_by_default;
                                }
                            })
                            .compact()
                            .value();
                    }
                },

                'columns': {
                    'get': () => {
                        return columns;
                    }
                },

                'processRows': {
                    'value': (rows) => {
                        processedRows = rows.map((row) => {
                            row.gridValues = {};
                            toggledColumns.forEach((column) => {
                                let contentFn = _.get(options.columns, [column.object_key, 'contentFn']);
                                if (contentFn) {
                                    row.gridValues[column.object_key] = contentFn(row);
                                } else if (defaultValue) {
                                    row.gridValues[column.object_key] = row[column.object_key] || defaultValue;
                                } else {
                                    row.gridValues[column.object_key] = row[column.object_key];
                                }
                                let linkFn = _.get(options.columns, [column.object_key, 'linkFn']);
                                if (linkFn) {
                                    let link = linkFn(row);
                                    if (link) {
                                        row.gridValues[column.object_key] = `<a href="${link}">${row.gridValues[column.object_key]}</a>`;
                                    }
                                }
                            });
                            return row;
                        });
                        this.generateRowActions();
                    }
                },

                'onToggleRow': {
                    'value': (row) => {
                    }
                },

                'toggleAllRows': {
                    'value': () => {
                        toggledRows = {};
                        rawRows.forEach((row, k) => {
                            toggledRows[k] = true;
                        });
                    }
                },

                'untoggleAllRows': {
                    'value': () => {
                        toggledRows = {};
                    }
                },

                'getToggledRows': {
                    'value': () => {
                        return _.cloneDeep(rawRows.filter((row, k) => {
                            return toggledRows[k];
                        }));
                    }
                },

                'toggleAll': {
                    'get': () => {
                        return toggleAll;
                    },
                    'set': (value) => {
                        toggleAll = value;
                        return value ? this.toggleAllRows() : this.untoggleAllRows();
                    }
                },

                'rowActions': {
                    'get': () => {
                        return options.row_actions;
                    }
                },

                'rowActionOptions': {
                    'value': (row) => {
                        return rowActions[rawRows.indexOf(row)];
                    }
                },

                'searchText': {
                    'get': () => {
                        return searchText;
                    },
                    'set': (value) => {
                        searchText = value;
                    }
                },

                'searchColumn': {
                    'get': () => {
                        return searchColumn;
                    },
                    'set': (value) => {
                        searchColumn = value;
                    }
                },

                'search': {
                    'value': () => {
                        return this.request({});
                    }
                },

                'exportCSV': {
                    'value': () => {
                        return this.request({
                            'params': {
                                'format': 'csv'
                            }
                        });
                    }
                },

                'colSpan': {
                    'get': () => {
                        let span = toggledColumns ? toggledColumns.length : 0;
                        if (this.enableMultiselect) span++;
                        if (totalRowActions > 0) span++;
                        return span;
                    }
                },

                'totalRowActions': {
                    'get': () => {
                        return totalRowActions;
                    }
                },

                'enableFilters': {
                    'get': () => {
                        return this._enableFilters;
                    },
                    'set': (enable) => {
                        return this._enableFilters = enable;
                    }
                },

                'enablePagination': {
                    'get': () => {
                        return this._enablePagination;
                        // return options.url ? true : false;
                    },
                    'set': (enablePagination) => {
                        return this._enablePagination = enablePagination;
                    }
                },

                'enableColumnToggling': {
                    'get': () => {
                        return this._enableColumnToggling;
                    },
                    'set': (enable) => {
                        return this._enableColumnToggling = enable;
                    }
                },

                'enableSearching': {
                    'get': () => {
                        return this._enableSearching;
                    },
                    'set': (enable) => {
                        return this._enableSearching = enable;
                    }
                },
                
                'sortColumn': {
                    'get': () => {
                        return sortColumn;
                    }
                },
                
                'sortDirection': {
                   'get': () => {
                       return sortDirection;
                   } 
                },
                
                'sort': {
                    'value': (objectKey) => {
                        
                        let col = _.find(columns, {
                            'object_key': objectKey
                        });
                        
                        if (!col.sortable) {
                            return;
                        }
                        
                        if (sortColumn === objectKey) {
                            sortDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC';
                        } else {
                            sortColumn = objectKey;
                            sortDirection = 'ASC';
                        }
                        
                        this.init();
                        
                        
                    }
                }

            });

        }

    }

    return UIGrid;

});