import { ExcelStyle } from "ag-grid-community";

type RecursivePartial<T> = {
    [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P];
};

export const ExcelStyles: RecursivePartial<ExcelStyle>[] = [
    {
        id: "yellowBackground",
        interior: {
            color: "#fffb16",
            pattern: "Solid",
        }
    },
    {
        id: "defaultBorders",
        borders: {
            borderBottom: {
                color: "#000000", lineStyle: 'Continuous', weight: 1
            },
            borderLeft: {
                color: "#000000", lineStyle: 'Continuous', weight: 1,
            },
            borderRight: {
                color: "#000000", lineStyle: 'Continuous', weight: 1
            },
            borderTop: {
                color: "#000000", lineStyle: 'Continuous', weight: 1
            }
        },
    }
];
