const getRange = (start, end) => {
    var rng = [];
    var val = start;
    while (val < end) {
        rng.push(val);
        val++;
    }
    return rng;
}


const getMonthNumber = dateStr => {
    var yearMonth = dateStr.slice(0, 7).split("-");
    var monthNumber = (parseInt(yearMonth[0]) - 1970) * 12 + parseInt(yearMonth[1]);
    return monthNumber;
}


const monthNumberAsString = monthNumber => {
    var year = Math.floor((monthNumber - 1) / 12);
    var month = monthNumber - 12 * year;
    return `${year + 1970}-${String(month).padStart(2, '0')}`;
}


const getDatesBetween = (startDate, endDate, includeEnd) => {
    var date = new Date(startDate);
    endDate = new Date(endDate);

    var dates = [];
    while (date < endDate) {
        dates.push(date.toISOString().slice(0, 10));
        date.setDate(date.getDate() + 1);
    }
    if (includeEnd) {
        dates.push(endDate.toISOString().slice(0, 10));
    }
    return dates;
}


const getMaxString = arr => {
    return arr.sort((a, b) => (a < b) ? 1 : -1)[0];
}


const getMinString = arr => {
    return arr.sort((a, b) => (a >= b) ? 1 : -1)[0];
}


export {
    getRange,
    getMonthNumber,
    monthNumberAsString,
    getDatesBetween,
    getMaxString,
    getMinString
};
