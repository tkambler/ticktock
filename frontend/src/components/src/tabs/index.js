'use strict';

import app from 'app';
import _ from 'lodash';

require('./style.scss');

app.factory('tabStateWatcher', function($log, $state, $stateParams, $transitions) {
    
    return new class {
        
        constructor() {

            $transitions.onStart({}, (transition) => {
                transition.promise
                    .then(() => {
                        this.tabs.forEach((tabs) => {
                            tabs.onTransitionSuccess();
                        });
                    });
            });

        }
        
        get tabs() {
            return this._tabs ? this._tabs : this._tabs = [];
        }
        
        registerTabs(tabs) {
            this.tabs.push(tabs);
            return this;
        }
        
        unregisterTabs(tabs) {
            const idx = this.tabs.indexOf(tabs);
            if (idx >= 0) {
                this.tabs.splice(idx, 1);
            }
            return this;
        }
        
    };
    
});

app.component('tabs', {
    'bindings': {
        'heading': '<',
        'alwaysShowTabs': '<',
        'parent': '<',
        'actions': '<',
        'onReady': '<'
    },
    'transclude': true,
    'controller': function($log, $state, $stateParams, $timeout, $element, $transitions, tabStateWatcher) {

        return new class {

                $onInit() {
                    this.tabs = [];
                    this._generatedActions = this.actions || [];
                    tabStateWatcher.registerTabs(this);
                }
                
                $onDestroy() {
                    tabStateWatcher.unregisterTabs(this);
                    this._destroyed = true;
                }

                $postLink() {
                    // $log.debug('tabs.$postLink', { '$stateParams': $stateParams, '$stateParams.tab': $stateParams.tab });
                    _.defer(() => {
                        $element.find('[data-toggle="tooltip"]').tooltip();
                    });
                    if (this.onReady) {
                        this.onReady(this);
                    }
                }
                
                watchTabs() {

                }
                
                onTransitionSuccess() {
                    // $log.debug('onTransitionSuccess', {
                    //     'this': this,
                    //     '$stateParams.tab': $stateParams.tab,
                    //     'this.activeTab.id': _.get(this, 'activeTab.id')
                    // });
                    if ($stateParams.tab && this.activeTab && this.activeTab.id !== $stateParams.tab) {
                        this.selectTabById($stateParams.tab);
                    }
                }

                registerTab(tab) {
                    if (!tab.enabled) {
                        return;
                    }
                    // $log.debug('registerTab', tab);
                    this.tabs.push(tab);
                    _.defer(this.initDefaultTab.bind(this));
                }

                initDefaultTab() {
                    if (this._defaultTabInitialized) {
                        return;
                    }
                    this._defaultTabInitialized = true;
                    $timeout(() => {
                        if ($stateParams.tab) {
                            this.selectTab(_.find(this.tabs, { 'id': $stateParams.tab }) || this.tabs[0]);
                        } else {
                            this.selectTab(this.tabs[0]);
                        }
                        this.generateActions();
                        this.watchTabs();
                    });
                }

                unregisterTab(tab) {
                    this.tabs.splice(this.tabs.indexOf(tab), 1);
                }
                
                selectTabById(id) {
                    const tab = _.find(this.tabs, { 'id': id });
                    // $log.debug('selectTabById', {
                    //     'id': id,
                    //     'tab': tab,
                    //     'this': this,
                    //     'this.tabs': _.cloneDeep(this.tabs)
                    // });
                    this.selectTab(tab);
                }

                selectTab(tab) {
                    if (this.activeTab === tab) {
                        return;
                    }
                    const stateParams = _.cloneDeep($stateParams);
                    stateParams.tab = tab ? tab.id : undefined;
                    tab.loadTriggered = true;
                    this.activeTab = tab;
                    $state.transitionTo($state.current.name, stateParams, {
                        'notify': false,
                        'location': 'replace'
                    });
                    if (_.isFunction(tab.onShow)) {
                        tab.onShow();
                    }
                }

                generateActions() {
                    const actions = _.cloneDeep(this.actions) || [];
                    const newActions = [];
                    this.tabs.forEach((tab) => {
                        if (tab.actions.length) {
                            const tabLinks = {
                                'label': tab.heading,
                                'links': []
                            };
                            tab.actions.forEach((tabAction) => {
                                tabLinks.links.push(tabAction);
                            });
                            newActions.push(tabLinks);
                        }
                    });
                    if (newActions.length) {
                        if (actions.length) {
                            actions.push({ 'divider': true });
                        }
                        actions.splice(actions.length, 0, ...newActions);
                    }
                    this._generatedActions = actions;
                }

                setTabActions(tab) {
                    _.defer(() => {
                        $timeout(() => {
                            this.generateActions();
                        });
                    });
                }

                get showTabs() {
                    return this.alwaysShowTabs ? true : this.tabs.length > 1;
                }

                get generatedActions() {
                    return this._generatedActions || [];
                }

            };

    },
    'template': `

        <ul class="nav nav-tabs">
            <li class="tabs-heading"><a ng-bind="$ctrl.heading"></a></li>
            <li ng-repeat="tab in $ctrl.tabs" ng-show="$ctrl.showTabs" ng-class="{ 'active': $ctrl.activeTab === tab }"><a ng-click="$ctrl.selectTab(tab)" ng-bind="tab.heading"></a></li>

            <li ng-if="$ctrl.generatedActions.length > 0">
                <a class="dropdown-toggle" id="tab-actions" data-toggle="dropdown">Actions <span class="caret"></span></a>
                <ul class="dropdown-menu" aria-labelledby="tab-actions">
                    <li ng-repeat="link in $ctrl.generatedActions" ng-class="{ 'dropdown': link.links, 'dropdown-submenu': link.links, 'divider': link.divider }">
                        <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label" ng-class="link.klass" ng-attr-data-toggle="{{ link.tooltip ? 'tooltip' : undefined }}" data-placement="left" ng-attr-title="{{ link.tooltip ? link.tooltip : undefined }}"></a>
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
            </li>

        </ul>

        <ng-transclude></ng-transclude>

    `
});

app.component('tab', {
    'bindings': {
        'heading': '<',
        'id': '<',
        'lazyLoad': '<',
        'enabled': '<'
    },
    'require': {
        'tabs': '^^'
    },
    'transclude': true,
    'controller': function($log, filterEnabled) {

        return new class {

            constructor() {
                this.loadTriggered = false;
            }

            $onInit() {
                if (!this.heading) throw new Error(`'heading' is required`);
                this.enabled = _.isBoolean(this.enabled) ? this.enabled : true;
                this.heading = this.heading.trim();
                this.id = this.id || _.chain(this.heading).toLower().snakeCase().value();
                this.tabs.registerTab(this);
            }

            get parent() {
                return this.tabs.parent;
            }

            get _show() {
                return (this.tabs.activeTab === this);
            }

            get actions() {
                return this._actions || [];
            }

            set actions(actions) {
                this._actions = filterEnabled(actions);
                this.tabs.setTabActions(this);
            }
            
            get onShow() {
                return this._onShow;
            }
            
            set onShow(cb) {
                this._onShow = cb;
                if (this.loadTriggered) {
                    cb();
                }
                return this._onShow;
            }

        };

    },
    'template': `<div ng-if="($ctrl.enabled && !$ctrl.lazyLoad) || ($ctrl.enabled && $ctrl.lazyLoad && $ctrl.loadTriggered)"><ng-transclude ng-show="$ctrl._show"></ng-transclude></div>`
});