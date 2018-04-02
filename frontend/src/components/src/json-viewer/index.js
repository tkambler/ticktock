'use strict';

import app from 'app';

app.component('jsonViewer', {
    'bindings': {
        'resolve': '<',
        'close': '&',
        'dismiss': '&',
    },
    'controller': function() {

        return new class {
            
            dismiss() {
                
                return this.close();
                
            }

        };

    },
    'template': `

<form name="$ctrl.form" role="form" ng-submit="$ctrl.submit()">

    <fieldset ng-disabled="$ctrl.readOnly">

        <div class="modal-header">
            <button type="button" class="close" ng-click="$ctrl.dismiss()">
                <span aria-hidden="true">x</span>
                <span class="sr-only">Close</span>
            </button>
            <h4 class="modal-title">Message</h4>
        </div>

        <div class="modal-body">

            <div class="row">

                <div class="col-xs-12">
                    <json-tree ng-if="$ctrl.resolve.data" object="$ctrl.resolve.data" start-expanded="true"></json-tree>
                </div>

            </div>

        </div>

        <div class="modal-footer">
            <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">Close</button>
        </div>

    </fieldset>

</form>

    `
});