/*
 * TODO documentation
 */
var BoundArray = function(data, id, cl) {
	var list = document.getElementById(id);
	var i, child;
	var that = this;

	var defineSetter = function(index) {
		that.__defineSetter__(index, function(val) {
			if (list) {
				child = document.getElementById(id).childNodes[index];
				child.innerHTML = val ? val : '';
			}

			data[index] = val;

			return val;
		});
	};

	var defineGetter = function(index) {
		that.__defineGetter__(index, function() {
			return data[index];
		});
	};

	var appendElement = function(index) {
		if (list) {
			child = document.createElement('li');
			if (cl) {
				child.setAttribute('class', cl);
			}
			child.innerHTML = data[i] ? data[i] : '';
			list.appendChild(child);
		}
	};

	// Set interceptors for all existing entries in the data array.
	// - intercept setter and update both the array and the HTML list element.
	// - intercept getter to get data from the array.
	for (i=0; i<data.length; i++) {
		defineSetter(i);
		defineGetter(i);
	}

	// Clear and build initial list.
	if (list) {
		while (list.childNodes[0]) {
			list.removeChild(list.childNodes[0]);
		}
		for (i=0; i<data.length; i++) {
			appendElement(i);
		}
	}

	// Special properties to mimic array.prototype.
	// array.prototype.index and input
	if (data.input) {
		this.index = data.index;
		this.input = data.input;
	}
	// array.prototype.length
	this.__defineGetter__('length', function() {
		return data.length;
	});
	this.__defineSetter__('length', function(val) {
		// Set interceptors and grow list.
		for (i=data.length; i<val; i++) {
			defineSetter(i);
			defineGetter(i);
			
			appendElement(i);
		}

		data.length = val;
		return val;
	});

};
