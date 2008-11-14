
/*
 * Creates a bound JavaScript array with a HTML list that from then on,
 * handles the glue code for keeping the HTML list in sync with the
 * JavaScript array.
 * Behaves, with the single exception of implicit growth, exactly like a
 * JavaScript array, but has the side effect of making any changes to the
 * HTML list as well.
 *
 * Copyright (c) 2008 Devin Naquin
 */
var BoundArray;

(function () {

	var defineSetter = function (that, index) {
		that.__defineSetter__(index, function (val) {
			var change;
			
			that.data[index] = val;

			changeElement(this, val, index);

			return val;
		});
	};

	var defineGetter = function (that, index) {
		that.__defineGetter__(index, function () {
			return that.data[index];
		});
	};

	var createNewElement = function (that, index) {
		child = document.createElement('li');
		if (that.cl) {
			child.setAttribute('class', that.cl);
		}
		child.innerHTML = that.data[index] ? that.data[index] : '';

		return child;
	};

	var jQueryFound = function () {
		return typeof jQuery==='function';
	};

	var insertElement = function (that, child, index) {
		if (that.list) {
			child.style.display = 'none';
			that.list.insertBefore(child, that.list.childNodes[index]);
			
			if (jQueryFound()) {
				$('#' + that.id + ' li:nth-child(' + (index + 1) + ')').slideDown('normal');
			} else {
				child.style.display = 'block';
			}
		}
	};

	var removeElement = function (that, index) {
		var child, remove;

		if (that.list) {
			child = that.list.childNodes[index];
			remove = function () {
				that.list.removeChild(child);
			};

			if (jQueryFound()) {
				$('#' + that.id + ' li:nth-child(' + (index + 1) + ')').slideUp('normal', remove);
			} else {
				remove();
			}
		}

		return child;
	};

	var changeElement = function (that, new_val, index) {
		var change;

		if (that.list) {
			change = function () {
				var child = that.list.childNodes[index];
				child.innerHTML = new_val ? new_val : '';
			};
			
			if (jQueryFound()) {
				$('#' + that.id + ' li:nth-child(' + (index + 1) + ')').slideUp('normal', change);
				$('#' + that.id + ' li:nth-child(' + (index + 1) + ')').slideDown('normal');
			} else {
				change();
			}
		}
	};

	BoundArray = function (data, id, cl) {
		var i, child;

		this.data = data;
		this.list = document.getElementById(id);
		this.id = id;
		this.cl = cl;

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
				this.list.appendChild(createNewElement(this, i));
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

				if (this.list) {
					this.list.appendChild(createNewElement(this, i));
				}
			}

			this.data.length = val;
			return val;
		});

	};

	// Add Array.prototype methods.
	// HACK
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
				prop==='data' || prop==='list' || prop==='id' || prop==='cl' ||
				prop==='propertyIsEnumerable') {
			return false;
		} else {
			return -1===methods.indexOf(prop);
		}
	};

	// Overwite methods that we want to specifically handle on the HTML list.
	// Mutator methods
	BoundArray.prototype.pop = function () {
		var index = this.data.length - 1;

		removeElement(this, index);

		return this.data.pop();
	};
	BoundArray.prototype.push = function () {
		var old_length = this.data.length;
		var result = this.data.push.apply(this.data, arguments);
		var i;

		for (i=old_length; i<this.data.length; i++) {
			defineGetter(this, i);
			defineSetter(this, i);

			insertElement(this, createNewElement(this, i), i);
		}

		return result;
	};
	BoundArray.prototype.reverse = function () {
		var i;

		if (this.list) {
			for (i=1; i<this.list.childNodes.length; i++) {
				insertElement(this, this.list.childNodes[i], 0);
			}
		}

		return this.data.reverse();
	};
	BoundArray.prototype.shift = function () {
		if (this.list) {
			this.list.removeChild(this.list.childNodes[0]);
		}
		return this.data.shift();
	};
	BoundArray.prototype.sort = function () {
		var result = this.data.sort.apply(this.data, arguments);
		var i, child;

		// TODO better order for animation? replace?
		if (this.list) {
			while (this.list.childNodes[0]) {
				this.list.removeChild(this.list.childNodes[0]);
			}
			for (i=0; i<this.data.length; i++) {
				this.list.appendChild(createNewElement(this, i));
			}
		}
		
		return result;
	};
	BoundArray.prototype.splice = function () {
		var old_length = this.data.length;
		var result = this.data.splice.apply(this.data, arguments);
		var i, child;

		if (this.list) {
			for (i=0; i<arguments[1]; i++) {
				this.list.removeChild(this.list.childNodes[arguments[0]]);
			}

			for (i=0; i<arguments.length-2; i++) {
				child = createNewElement(this, arguments[0]+i);

				this.list.insertBefore(child, this.list.childNodes[arguments[0]+i]);
			}
		}

		for (i=old_length; i<this.data.length; i++) {
			defineGetter(this, i);
			defineSetter(this, i);
		}

		return result;
	};
	BoundArray.prototype.unshift = function () {
		var old_length = this.data.length;
		var result = this.data.unshift.apply(this.data, arguments);
		var i, child;

		if (this.list) {
			for (i=0; i<arguments.length; i++) {
				child = createNewElement(this, i);

				this.list.insertBefore(child, this.list.childNodes[i]);
			}
		}

		for (i=old_length; i<this.data.length; i++) {
			defineGetter(this, i);
			defineSetter(this, i);
		}

		return result;
	};

}());
