import * as strings from './strings'

type CompareFunc = (a: string, b: string) => number;

// Call enableSorting() on all tables with the 'sortable-table' class.
function enableSortingAll() {
    document.querySelectorAll<HTMLTableElement>('table.sortable-table').forEach(function(table: HTMLTableElement) {
        enableSorting(table);
    });
}

// Enable sorting on the passed in table element.
// Sortable tables should have the 'sortable-table' class, thead, and tbody.
// To set default sorting, use the class 'sortable-table-initial-col-asc' or 'sortable-table-initial-col-desc' on the target th.
function enableSorting(table: HTMLTableElement, sortFunc: CompareFunc = defaultTableTextCompare) {
    table.querySelectorAll<HTMLTableCellElement>('th').forEach(function(header: HTMLTableCellElement) {
        header.addEventListener('click', function(event) {
            sortTable(header, table, undefined, sortFunc);
        });
    });

    // Check for initial sortings.

    let header = table.querySelector<HTMLTableCellElement>('th.sortable-table-initial-col-asc');
    if (header) {
        sortTable(header, table, true, sortFunc);
    }

    header = table.querySelector<HTMLTableCellElement>('th.sortable-table-initial-col-desc');
    if (header) {
        sortTable(header, table, false, sortFunc);
    }
}

function sortTable(
        header: HTMLTableCellElement,
        table: HTMLTableElement,
        forceSortAscending: boolean | undefined = undefined,
        sortFunc: CompareFunc = defaultTableTextCompare,
        ) {
    let rows = [...table.tBodies[0].rows];
    let sortIndex = [...header.parentElement!.children].indexOf(header);
    let sortAscending = !(header.dataset.ascending === 'true');

    if (forceSortAscending !== undefined) {
        sortAscending = forceSortAscending;
    }

    // Reset sort direction headers.
    for (const otherHeader of header.parentElement!.children) {
        delete (otherHeader as HTMLElement).dataset.ascending;
    }
    header.dataset.ascending = sortAscending.toString();

    rows.sort(function(a, b) {
        let compareValue = sortFunc(a.cells[sortIndex].textContent, b.cells[sortIndex].textContent);
        return (sortAscending ? compareValue : -compareValue);
    });

    table.tBodies[0].replaceChildren(...rows);
}

// Compre the text content of two cells (a and b) within a table.
// Leading and trailing whitespace will be trimmed.
// This implementation will try to parse the values as floats, and compare numbers.
// If both do not parse as floats, they will be compared as strings.
function defaultTableTextCompare(a: string, b: string): number {
    a = a.trim();
    b = b.trim();

    const numberAValue = parseFloat(a);
    const numberBValue = parseFloat(b);

    let compareValue = 0;
    if (!Number.isNaN(numberAValue) && !Number.isNaN(numberBValue)) {
        return numberAValue - numberBValue;
    }

    return strings.stringCompare(a, b);
}

export {
    enableSorting,
    enableSortingAll,

    defaultTableTextCompare,
}
