import * as appState from '../app.state';
import * as navState from '../navigation/navigation.state';

import { ChangeObj } from "../domain/change_obj";

import { MockMetadata } from './mocks/mock-metadata';

export const SETUP = {
    initialEntities: new MockMetadata().entities
};

export const FLOW = {

    When_user_first_accesses_the_app: {},
    Then_navigation_should_show_all_current_tables: {
        initialEntitiesChangesAction: new navState.EntitiesChangesAction(SETUP.initialEntities.map(e => new ChangeObj(e)))
    },
    And_default_table_page_with_service_forms_should_be_displayed: {},
    When_user_navigates_to_a_service_form: {},
    Then_the_form_page_should_be_displayed: {},
    When_user_updates_the_requested_quantity_of_a_product_list_item: {},
    Then_user_will_see_the_reserved_quantity_and_stock_computed_by_the_engine: {}
};