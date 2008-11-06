/*
 * TODO documentation
 */
var BoundArray = function (data, id, cl) {
	var list = document.getElementById(id);
	var i, child;
	var that = this;

	var defineSetter = function (index) {
		that.__defineSetter__(index, function (val) {
			if (list) {
				child = document.getElementById(id).childNodes[index];
				child.innerHTML = val ? val : '';
			}

			data[index] = val;

			return val;
		});
	};

	var defineGetter = function (index) {
		that.__defineGetter__(index, function () {
			return data[index];
		});
	};

	var appendElement = function (index) {
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
	this.__defineGetter__('length', function () {
		return data.length;
	});
	this.__defineSetter__('length', function (val) {
		// Set interceptors and grow list.
		for (i=data.length; i<val; i++) {
			defineSetter(i);
			defineGetter(i);
			
			appendElement(i);
		}

		data.length = val;
		return val;
	});

	// Add Array.prototype methods.
	// TODO
	// There doesn't seem to be a good way to loop over all built-in methods on
	// Array.prototype, so for now this will have to be hardcoded.
	var methods = [
		// Javascript Core Reference
		// Mutator methods
		'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift',
		// Accessor methods
		'concat', 'join', 'slice', 'toSource', 'toString', 'indexOf', 'lastIndexOf',
		// Iteration methods
		'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
		];

	// Intercept these calls and redirect to data array. Do nothing with the list.
	// Overwrite these for methods we specifically want to handle on the HTML list.
	for (i=0; i<methods.length; i++) {
		(function (method) {
			that[method] = function () {
				return data[method].apply(data, arguments);
			};
		}(methods[i]));
	}

	// Make all of these methods not enumerable.
	this.propertyIsEnumerable = function (prop) {
		if (prop==='index' || prop==='input' || prop==='length' ||
				prop==='propertyIsEnumerable') {
			return false;
		} else {
			return -1===methods.indexOf(prop);
		}
	};

	// Overwite methods that we want to specifically handle on the HTML list.
	this.pop = function () {
		if (list) {
			var last = list.childNodes[list.childNodes.length-1];
			list.removeChild(last);
		}
		return data.pop();
	};
	this.push = function() {
		var old_length = data.length;
		var result = data.push.apply(data, arguments);
		var i, child;

		for (i=old_length; i<old_length+arguments.length; i++) {
			defineGetter(i);
			defineSetter(i);

			if (list) {
				appendElement(i);
			}
		}

		return result;
	};
	this.reverse = function() {
		var first;
		var i, child;

		if (list) {
			first =  list.childNodes[0];
			for (i=1; i<list.childNodes.length; i++) {
				child = list.childNodes[i];
				list.insertBefore(child, first);
			}
		}
		
		return data.reverse();
	};
	this.shift = function() {
		if (list) {
			list.removeChild(list.childNodes[0]);
		}
		return data.shift();
	};

};
