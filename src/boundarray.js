/*
 * TODO documentation
 */
var BoundArray = function (data, id, style) {
	var i;

	// TODO check input.

	for (i=0; i<data.length; i++) {
		// Intercept setter and update both the array and the HTML list element.
		this.__defineSetter__(i, function (j) {
			return function(val) {
				data[j] = val;

				// TODO modify bounded list

				return val;
			};
		}(i));

		// Intercept getter to get data from the array.
		this.__defineGetter__(i, function(j) {
			return function () {
				return data[j];
			};
		}(i));
	}
};