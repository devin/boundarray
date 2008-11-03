/*
 * TODO documentation
 */
var BoundArray = function(data, id, cl) {
	var list = document.getElementById(id);
	var i, child;
	var that = this;

	var defineSetter = function(index) {
		that.__defineSetter__(index, function(val) {
			child = document.getElementById(id).childNodes[index];

			data[index] = val;
			child.innerHTML = val;

			return val;
		});
	};

	var defineGetter = function(index) {
		that.__defineGetter__(index, function() {
			return data[index];
		});
	};

	// Set interceptors for all existing entries in the data array.
	// - intercept setter and update both the array and the HTML list element.
	// - intercept getter to get data from the array.
	for (i=0; i<data.length; i++) {
		defineSetter(i);
		defineGetter(i);
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

	// Set up special properties to mimic array.prototype.
	// TODO constructor
	// TODO index
	// TODO input
	// array.prototype.length
	this.__defineGetter__('length', function() {
		return data.length;
	});
	// TODO length setter

};