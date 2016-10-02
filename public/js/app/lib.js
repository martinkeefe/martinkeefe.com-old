define(function(require, exports, module) {

	// http://javascript.crockford.com/remedial.html - supplant(object)
    exports.strerp = function(str, obj) {
        return str.replace(
            /\{\{([^{}]*)\}\}/g,
            function (a, b) {
                var r = obj[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };

});
