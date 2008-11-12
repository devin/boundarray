
var selectionsort = function (array, delay) {
	// Done only using recursive iteration, because I want to delay between steps.
	var i = 0;
	(function step() {
		var min_at = i;
		var j, tmp;

		for (j=i+1; j<array.length; j++) {
			if (array[j] < array[min_at]) {
				min_at = j;
			}
		}

		tmp = array[i];
		array[i] = array[min_at];
		array[min_at] = tmp;

		i++;
		if (i<array.length-1) {
			setTimeout(step, delay);
		}
	})();
};

var try_selectionsort = function () {
	var array = ['jessica', 'ashley', 'brittany', 'amanda', 'stephanie',
			'jennifer', 'samantha', 'sarah', 'megan', 'lauren', 'elizabeth',
			'emily', 'amber', 'nicole', 'rachel', 'kayla', 'heather', 'melissa',
			'rebecca', 'michelle', 'danielle', 'courtney', 'tiffany', 'chelsea',
			'christina', 'katherine', 'kelsey', 'maria', 'laura', 'jasmine'];

	var names = new BoundArray(array, 'names');

	selectionsort(names,50);
};

window.onload = try_selectionsort;
