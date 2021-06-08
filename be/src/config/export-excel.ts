import { Entity } from "@domain/metadata/entity";
import { DataObj } from "@domain/metadata/data_obj";

import * as Excel from 'exceljs';
import { i18nTranslateText } from "@be/i18n-be";
import { $DictionaryObjT, $Dictionary } from "@domain/metadata/default-metadata";
import { _idValueStr } from "@domain/key_value_obj";

export async function createExcelReport(
    entity: Entity,
    records: DataObj[],
    dictionaryCache: Map<string, $DictionaryObjT>,
    lang: string
): Promise<Excel.Workbook> {

    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet(entity._id.replace(/_/g, ' '));

    worksheet.columns = Object.values(entity.props).map(c => ({ 
        header: dictionaryCache.get($Dictionary._id + '~~' + c.name)?.[lang] 
            || `${lang}:${c.name.replace(/_/g, ' ')}`, 
        key: c.name 
    }));
    var headerRow = worksheet.getRow(1);
    headerRow.eachCell(function (cell, colNumber) {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '004F81BD' }
        }
        cell.font = {
            color: { argb: '00FFFFFF' },
        }
    });

    const ROW_COUNT = 100;
    let idx = 2;
    for (let row of records) {
        row._id = _idValueStr(row._id);
        console.log(new Date(), "received row: ", JSON.stringify(row));
        worksheet.addRow(row, 'n');

        let xlsRow = worksheet.getRow(idx);
        let fillColor = idx % 2 ? '00DCE6F1' : '00B8CCE4';
        xlsRow.eachCell(function (cell, colNumber) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: fillColor }
            };
        });
        idx++;
    }

    return workbook;
}
