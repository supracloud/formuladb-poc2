/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Form, NodeType } from '@core/domain/uimetadata/form'
import { Pn } from '@core/domain/metadata/entity';
import { Home } from './website-metadata';

let testUUID = 1;
function getTestUUID() {
  return 'uuid' + ++testUUID;
}

export var HomePage_Form: Form = {
  _id: "Form_:ALL^^" + Home._id,
  page: {
    logoUrl: '/assets/logo7.png',
    navPosition: "top",
  },
  grid: {
    nodeType: NodeType.form_grid, _id: getTestUUID(),
    childNodes: [
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_input, _id: getTestUUID(),
            propertyName: "title",
            propertyType: Pn.STRING,
          }
        ],
      },
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_input, _id: getTestUUID(),
            propertyName: "tagline",
            propertyType: Pn.STRING,
          }
        ],
      },
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_table, _id: getTestUUID(),
            tableName: "product_features",
            childNodes: [
              {
                nodeType: NodeType.h_layout, _id: getTestUUID(),
                childNodes: [
                  {
                    nodeType: NodeType.form_text, _id: getTestUUID(),
                    propertyName: "name",
                    representation: "h2",
                  }
                ],
              },
              {
                nodeType: NodeType.h_layout, _id: getTestUUID(),
                childNodes: [
                  {
                    nodeType: NodeType.form_text, _id: getTestUUID(),
                    propertyName: "description",
                    representation: "paragraph",
                  }
                ],
              },
              {
                nodeType: NodeType.h_layout, _id: getTestUUID(),
                childNodes: [
                  {
                    nodeType: NodeType.form_text, _id: getTestUUID(),
                    propertyName: "_id",
                    representation: "_id",
                  }
                ],
              }
            ],
          }
        ],
      },
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_text, _id: getTestUUID(),
            propertyName: "_id",
            representation: "_id",
          }
        ],
      }
    ],
  }
};
