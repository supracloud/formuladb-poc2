import * as appState from '../app.state';
import * as navState from '../navigation/navigation.state';

import { ChangeObj } from "../domain/change_obj";

import { MockMetadata } from './mocks/mock-metadata';
import { BackendReadService, getDefaultTable, getDefaultForm } from "../backend-read.service";

export const SETUP = {
    initialEntities: new MockMetadata().entities
};

let SYSTEMNAME = 'Cloudev'; //NEED IDEAS HERE!!! metawiz is not catchy enough, cloudev sounds better by there is a cloudevtech.com, let's open a poll
/**
@startuml
actor User
box "Client"
    participant TableC
    participant FormC
end box
box "Server"
    participant Express
end box

note over Express
    GET /mwz_api/path?filters
    PUT /mwz_api/path JSON
    GET /mwz_api/path?__metadata
    PUT /mwz_api/path?__metadata JSON
    GET /mwz_api/path?__uiMetadata
    PUT /mwz_api/path?__uiMetadata JSON
end note

@enduml
 */
export const FLOW = {
    comment1: `The 5 min overview of ${SYSTEMNAME}
        System running off existing metadata and data.
        Nothing really special, just standard looking ERP software`,
    When_user_first_accesses_the_app: {},
    Then_navigation_should_show_all_current_tables: {
        initialEntitiesChangesAction: new navState.EntitiesChangesAction(SETUP.initialEntities.map(e => new ChangeObj(e)))
    },
    And_default_table_page_with_service_forms_should_be_displayed: {
        serviceFormTable: getDefaultTable(MockMetadata.TestApplication__ServiceForm)
    },
    When_user_navigates_to_a_service_form: {},
    Then_the_form_page_should_be_displayed: {},
    When_user_updates_the_requested_quantity_of_a_product_list_item: {},
    Then_user_will_see_the_reserved_quantity_and_stock_computed_by_the_engine: {},
    TODO_user_creates_new_service_form: {},

    comment2: `What is special about ${SYSTEMNAME}: this standard looking ERP software is implemented using a simple language accesible to busines people`,
    TODO_use_editor_to_change_order_of_columns_in_table: {},
    TOOD_use_editor_to_change_form_layout: {},

    comment3: `So far only simple changes in the ui layout, let's see how easy it is to add new functionality to the system.
        We argue it is as simple as editing a Spreadsheet/Excel, anybody who has used Excel with a few formulas can use ${SYSTEMNAME}.`,
    TODO_create_Revision_Entity: {},
    TOOD_create_Revision_Form: {},
    TODO_create_and_edit_revisions: {},
};
