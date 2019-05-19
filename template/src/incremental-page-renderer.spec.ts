
const template = `
<div data-frmdb-value="tableName">
    <ul>
        <li data-frmdb-value="name"><label data-frmdb-label></label></li>
        <li data-frmdb-value="description"><label data-frmdb-label></label></li>
    </ul>
</div>
`;

let data = {
    tableName: [
        { name: "row1", description: "desc of row 1" },
        { name: "row2", description: "desc of row 2" },
    ]
};

describe('FrmdbTemplate', () => {
    beforeEach(() => {
    });

    fit('should update view when template OR data changes', () => {

    })
});
