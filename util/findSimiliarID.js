// =============================================================================
// https://stackoverflow.com/a/55808244
// =============================================================================

var similiarID = (strs) => {
    // Function to convert a string into a numeric representation
    // to aid with string similarity comparison
    function atoi(str, maxLen) {
        var i = 0;
        for (var j = 0; j < maxLen; j++) {
            if (str[j] != null) {
                i += str.toLowerCase().charCodeAt(j) * Math.pow(64, maxLen - j) - 'a'.charCodeAt(0) * Math.pow(64, maxLen - j)
            } else {
                // Normalize the string with a pad char
                // up to the maxLen (update the value, but don't actually
                // update the string...)
                i += '-'.charCodeAt(0) * Math.pow(64, maxLen - j) - 'a'.charCodeAt(0) * Math.pow(64, maxLen - j)
            }
        }
        valMap.push({
            str,
            i
        })
        return i;
    }

    Number.prototype.inRange = function (min, max) { return (this >= min && this <= max) }

    var valMap = []; // Array of string-value pairs

    var maxLen = strs.map((s) => s.length).sort().pop() // maxLen of all strings in the array
    strs.forEach((s) => atoi(s, maxLen)) // Map strings to values

    var similars = [];
    var subArr = []
    var margin = 0.05;
    valMap.sort((a, b) => a.i > b.i ? 1 : -1) // Sort the map...
    valMap.forEach((entry, idx) => {
        if (idx > 0) {
            var closeness = Math.abs(entry.i / valMap[idx - 1].i);
            if (closeness.inRange(1 - margin, 1 + margin)) {
                if (subArr.length == 0) subArr.push(valMap[idx - 1].str)
                subArr.push(entry.str)
                if (idx == valMap.length - 1) {
                    similars.push(subArr)
                }
            } else {
                if (subArr.length > 0) similars.push(subArr)
                subArr = []
            }
        }
    })
    return similars;
}

module.exports = similiarID;