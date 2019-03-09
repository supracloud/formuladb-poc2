/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Form, NodeType } from '@core/domain/uimetadata/form'

let testUUID = 1;
function getTestUUID() {
  return 'uuid' + ++testUUID;
}

export var HomePage_Form: Form = {
  _id: "Form_:Home",
  page: {
    logoUrl: '/assets/logo7.png',
    navPosition: "top",
  },
  grid: {
    nodeType: NodeType.form_grid, _id: getTestUUID(),
    childNodes: [
      {
        nodeType: "h_layout", _id: getTestUUID(),
        childNodes: [
          {
            nodeType: "form_input", _id: getTestUUID(),
            propertyName: "title",
            propertyType: "STRING",
          }
        ],
      },
      {
        nodeType: "h_layout", _id: getTestUUID(),
        childNodes: [
          {
            nodeType: "form_input", _id: getTestUUID(),
            propertyName: "tagline",
            propertyType: "STRING",
          }
        ],
      },
      {
        nodeType: "h_layout", _id: getTestUUID(),
        childNodes: [
          {
            nodeType: "form_tabs", _id: getTestUUID(),
            tableName: "product_features",
            childNodes: [
              {
                nodeType: "h_layout", _id: getTestUUID(),
                childNodes: [
                  {
                    nodeType: "form_input", _id: getTestUUID(),
                    propertyName: "name",
                    propertyType: "STRING",
                  }
                ],
              },
              {
                nodeType: "h_layout", _id: getTestUUID(),
                childNodes: [
                  {
                    nodeType: "form_input", _id: getTestUUID(),
                    propertyName: "description",
                    propertyType: "STRING",
                  }
                ],
              },
              {
                nodeType: "h_layout", _id: getTestUUID(),
                childNodes: [
                  {
                    nodeType: "form_text", _id: getTestUUID(),
                    propertyName: "_id",
                    propertyType: "STRING",
                    representation: "_id",
                  }
                ],
              }
            ],
          }
        ],
      },
      {
        nodeType: "h_layout", _id: getTestUUID(),
        childNodes: [
          {
            nodeType: "form_text", _id: getTestUUID(),
            propertyName: "_id",
            propertyType: "STRING",
            representation: "_id",
          }
        ],
      }
    ],
  }
};
