
/*
 * TODO documentation
 */
var BoundArray;

(function () {
	var private_data, private_list, private_id, private_class;

	var defineSetter = function (that, index) {
		that.__defineSetter__(index, function (val) {
			if (private_list) {
				child = private_list.childNodes[index];
				child.innerHTML = val ? val : '';
			}

			private_data[index] = val;

			return val;
		});
	};

	var defineGetter = function (that, index) {
		that.__defineGetter__(index, function () {
			return private_data[index];
		});
	};

	var appendElement = function (that, index) {
		if (private_list) {
			child = document.createElement('li');
			if (private_class) {
				child.setAttribute('class', private_class);
			}
			child.innerHTML = private_data[index] ? private_data[index] : '';
			private_list.appendChild(child);
		}
	};

	BoundArray = function(data, id, cl) {
		var i, child;

		private_data = data;
		private_list = document.getElementById(id);
		private_id = id;
		private_class = cl;

		// Set interceptors for all existing entries in the data array.
		// - intercept setter and update both the array and the HTML list element.
		// - intercept getter to get data from the array.
		for (i=0; i<private_data.length; i++) {
			defineSetter(this, i);
			defineGetter(this, i);
		}

		// Clear and build initial list.
		if (private_list) {
			while (private_list.childNodes[0]) {
				private_list.removeChild(private_list.childNodes[0]);
			}
			for (i=0; i<private_data.length; i++) {
				appendElement(this, i);
			}
		}

		// Special properties to mimic array.prototype.
		// array.prototype.index and input
		if (private_data.input) {
			this.index = private_data.index;
			this.input = private_data.input;
		}
		// array.prototype.length
		this.__defineGetter__('length', function () {
			return private_data.length;
		});
		this.__defineSetter__('length', function (val) {
			// Set interceptors and grow list.
			for (i=private_data.length; i<val; i++) {
				defineSetter(this, i);
				defineGetter(this, i);

				appendElement(this, i);
			}

			private_data.length = val;
			return val;
		});

	};

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
			BoundArray.prototype[method] = function () {
				return private_data[method].apply(private_data, arguments);
			};
		}(methods[i]));
	}

	// Make all of these methods not enumerable.
	BoundArray.prototype.propertyIsEnumerable = function (prop) {
		if (prop==='index' || prop==='input' || prop==='length' ||
				prop==='propertyIsEnumerable') {
			return false;
		} else {
			return -1===methods.indexOf(prop);
		}
	};

	// Overwite methods that we want to specifically handle on the HTML list.
	BoundArray.prototype.pop = function () {
		if (private_list) {
			var last = private_list.childNodes[private_list.childNodes.length-1];
			private_list.removeChild(last);
		}
		return private_data.pop();
	};
	BoundArray.prototype.push = function() {
		var old_length = private_data.length;
		var result = private_data.push.apply(private_data, arguments);
		var i, child;

		for (i=old_length; i<old_length+arguments.length; i++) {
			defineGetter(this, i);
			defineSetter(this, i);

			if (private_list) {
				appendElement(this, i);
			}
		}

		return result;
	};
	BoundArray.prototype.reverse = function() {
		var first;
		var i, child;

		if (private_list) {
			first = private_list.childNodes[0];
			for (i=1; i<private_list.childNodes.length; i++) {
				child = private_list.childNodes[i];
				private_list.insertBefore(child, first);
			}
		}

		return private_data.reverse();
	};
	BoundArray.prototype.shift = function() {
		if (private_list) {
			private_list.removeChild(private_list.childNodes[0]);
		}
		return private_data.shift();
	};

}());
