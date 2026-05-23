const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = value instanceof Date ? value.toISOString() : String(value);
    if (/[",\n\r]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

export const toCsv = (rows, columns) => {
    const header = columns.map(column => escapeCsvValue(column.header)).join(',');
    const body = rows.map(row =>
        columns.map(column => escapeCsvValue(column.value(row))).join(',')
    );

    return [header, ...body].join('\n');
};

export const sendCsv = (res, filename, csv) => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
};
