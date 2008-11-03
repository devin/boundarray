/*
 * TODO documentation
 */
var BoundArray = function(data, id, cl) {
	var list = document.getElementById(id);
	var i, child;

	// Set settor interceptor for all existing entries in the data array.
	// Intercept settor and update both the array and the HTML list element.
	for (i=0; i<data.length; i++) {
		this.__defineSetter__(i, function(j) {
			return function(val) {
				var second = document.getElementById(id).childNodes[1];

				data[j] = val;
				second.innerHTML = val;

				return val;
			};
		}(i));
	}

	// Set gettor interceptor for all existing entries in the data array.
	// Intercept gettor to get data from the array.
	for (i=0; i<data.length; i++) {
		this.__defineGetter__(i, function(j) {
			return function () {
				return data[j];
			};
		}(i));
	}

	// Clear and build initial list.
	while (list.childNodes[0]) {
		list.removeChild(list.childNodes[0]);
	}
	for (i=0; i<data.length; i++) {
		child = document.createElement('li');
		if (cl) {
			child.setAttribute('class', cl);
		}
		child.innerHTML = data[i];
		list.appendChild(child);
	}

};