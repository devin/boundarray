
/*
 * TODO documentation
 */
var BoundArray;

(function () {

	var defineSetter = function (that, index) {
		that.__defineSetter__(index, function (val) {
			if (that.list) {
				child = that.list.childNodes[index];
				child.innerHTML = val ? val : '';
			}

			that.data[index] = val;

			return val;
		});
	};

	var defineGetter = function (that, index) {
		that.__defineGetter__(index, function () {
			return that.data[index];
		});
	};

	var appendElement = function (that, index) {
		if (that.list) {
			child = document.createElement('li');
			if (that.class) {
				child.setAttribute('class', that.class);
			}
			child.innerHTML = that.data[index] ? that.data[index] : '';
			that.list.appendChild(child);
		}
	};

	BoundArray = function(data, id, cl) {
		var i, child;

		this.data = data;
		this.list = document.getElementById(id);
		this.id = id;
		this.class = cl;

		// Set interceptors for all existing entries in the data array.
		// - intercept setter and update both the array and the HTML list element.
		// - intercept getter to get data from the array.
		for (i=0; i<this.data.length; i++) {
			defineSetter(this, i);
			defineGetter(this, i);
		}

		// Clear and build initial list.
		if (this.list) {
			while (this.list.childNodes[0]) {
				this.list.removeChild(this.list.childNodes[0]);
			}
			for (i=0; i<this.data.length; i++) {
				appendElement(this, i);
			}
		}

		// Special properties to mimic array.prototype.
		// array.prototype.index and input
		if (this.data.input) {
			this.index = this.data.index;
			this.input = this.data.input;
		}
		// array.prototype.length
		this.__defineGetter__('length', function () {
			return this.data.length;
		});
		this.__defineSetter__('length', function (val) {
			// Set interceptors and grow list.
			for (i=this.data.length; i<val; i++) {
				defineSetter(this, i);
				defineGetter(this, i);

				appendElement(this, i);
			}

			this.data.length = val;
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
				return this.data[method].apply(this.data, arguments);
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
		if (this.list) {
			var last = this.list.childNodes[this.list.childNodes.length-1];
			this.list.removeChild(last);
		}
		return this.data.pop();
	};
	BoundArray.prototype.push = function() {
		var old_length = this.data.length;
		var result = this.data.push.apply(this.data, arguments);
		var i, child;

		for (i=old_length; i<old_length+arguments.length; i++) {
			defineGetter(this, i);
			defineSetter(this, i);

			if (this.list) {
				appendElement(this, i);
			}
		}

		return result;
	};
	BoundArray.prototype.reverse = function() {
		var first;
		var i, child;

		if (this.list) {
			first = this.list.childNodes[0];
			for (i=1; i<this.list.childNodes.length; i++) {
				child = this.list.childNodes[i];
				this.list.insertBefore(child, first);
			}
		}

		return this.data.reverse();
	};
	BoundArray.prototype.shift = function() {
		if (this.list) {
			this.list.removeChild(this.list.childNodes[0]);
		}
		return this.data.shift();
	};

}());
