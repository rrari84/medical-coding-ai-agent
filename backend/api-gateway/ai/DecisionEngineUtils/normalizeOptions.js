    //This utility function standardizes the format os multiple-choice options so that your medical coding engine can work
    //with a consistent structure -- regardless of how the options are originally formatted

    function normalizeOptions(options) {
        if (Array.isArray(options)) {
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            const normalized = {};
            options.forEach((value, index) => {
                if (index < letters.length) {
                    normalized[letters[index]] = value;
                }
            });
            return normalized;
        }
        return options;
}

module.exports = normalizeOptions;
