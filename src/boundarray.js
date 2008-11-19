
var BoundArray;

(function () {

	// Utility functions.
	// Managing list element ids.
	var elementId = function (id, index) {
		return 'boundarray-' + id + '-' + index;
	};
	var deleteId = function () {
		var deleteIdCount = 0;
		
		return function () {
			deleteIdCount++;
			return 'boundarray-' + deleteIdCount + '-todelete';
		};
	}();

	// Getter and setters for indexed data.
	var defineSetter = function (that, index) {
		that.__defineSetter__(index, function (val) {			
			that.data[index] = val;

			removeElement(that, index);
			insertElement(that, createNewElement(that, index), index);

			return val;
		});
	};
	var defineGetter = function (that, index) {
		that.__defineGetter__(index, function () {
			return that.data[index];
		});
	};

	// jQuery utility.
	var jQueryFound = function () {
		return typeof jQuery==='function';
	};

	// List element management.
	var createNewElement = function (that, index) {
		var child = document.createElement('li');
		child.innerHTML = that.data[index] ? that.data[index] : '';

		return child;
	};
	var insertElement = function (that, child, index) {
		var i, next;

		if (that.list) {
			// Manage list's ids.
			for (i=Math.min(that.data.length-1, that.list.childNodes.length-1);
						i>index-1; i--) {
				next = document.getElementById(elementId(that.id, i));
				if (next) {
					next.setAttribute('id', elementId(that.id, i+1));
				}
			}
			child.setAttribute('id', elementId(that.id, index));

			child.style.display = 'none';
			that.list.insertBefore(child, next);

			if (jQueryFound()) {
				$('#' + elementId(that.id, index)).slideDown('normal');
			} else {
				child.style.display = 'block';
			}
		}
	};
	var removeElement = function (that, index) {
		var child;
		var i, next;
		var remove, deleted_id;

		if (that.list) {
			child = document.getElementById(elementId(that.id, index));

			if (child) {
				deleted_id = deleteId();

				// Manage list's ids.
				child.setAttribute('id', deleted_id);
				for (i=index+1; i<that.list.childNodes.length; i++) {
					next = document.getElementById(elementId(that.id, i));
					if (next) {
						next.setAttribute('id', elementId(that.id, i-1));
					}
				}

				remove = function () {
					that.list.removeChild(child);
				};

				if (jQueryFound()) {
					$('#' + deleted_id).slideUp('normal', remove);
				} else {
					remove();
				}
			}
		}

		return child;
	};

	BoundArray = function (data, id) {
		var i;

		this.data = data;
		this.list = document.getElementById(id);
		this.id = id;

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
				insertElement(this, createNewElement(this, i), i);
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

				insertElement(this, createNewElement(this, i), i);
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
				prop==='data' || prop==='list' || prop==='id' ||
				prop==='propertyIsEnumerable') {
			return false;
		} else {
			return -1===methods.indexOf(prop);
		}
	};

	// Overwite methods that we want to specifically handle on the HTML list.
	// Mutator methods
	BoundArray.prototype.pop = function () {
		removeElement(this, this.data.length-1);

		return this.data.pop();
	};
	BoundArray.prototype.push = function () {
		var i;
		var old_length = this.data.length;
		var result = this.data.push.apply(this.data, arguments);

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
		removeElement(this, 0);
		return this.data.shift();
	};
	BoundArray.prototype.sort = function () {
		var i;
		var result = this.data.sort.apply(this.data, arguments);

		if (this.list) {
			for (i=0; i<this.data.length; i++) {
				removeElement(this, i);
				insertElement(this, createNewElement(this, i), i);
			}
		}
		
		return result;
	};
	BoundArray.prototype.splice = function () {
		var i, child;
		var old_length = this.data.length;
		var result = this.data.splice.apply(this.data, arguments);

		if (this.list) {
			for (i=0; i<arguments[1]; i++) {
				removeElement(this, arguments[0]);
			}

			for (i=0; i<arguments.length-2; i++) {
				insertElement(this, createNewElement(this, arguments[0]+i), arguments[0]+i);
			}
		}

		for (i=old_length; i<this.data.length; i++) {
			defineGetter(this, i);
			defineSetter(this, i);
		}

		return result;
	};
	BoundArray.prototype.unshift = function () {
		var i, child;
		var old_length = this.data.length;
		var result = this.data.unshift.apply(this.data, arguments);

		if (this.list) {
			for (i=0; i<arguments.length; i++) {
				insertElement(this, createNewElement(this, i), i);
			}
		}

		for (i=old_length; i<this.data.length; i++) {
			defineGetter(this, i);
			defineSetter(this, i);
		}

		return result;
	};

}());
