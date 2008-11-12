
var bubblesort = function (array, delay) {
	// Done only using recursive iteration, because I want to delay between steps.
	(function bs() {
		var i = 0;
		var swapped = false;

		(function step () {
			if (array[i] > array[i+1]) {
				tmp = array[i];

				array[i] = array[i+1];
				array[i+1] = tmp;

				swapped = true;
			}
			
			i++;
			if (i<array.length) {
				setTimeout(step, delay);
			} else if (swapped) {
				setTimeout(bs, delay);
			} // else fall out.
		})();
	})();
};

var try_bubblesort = function () {
	var array = ['jessica', 'ashley', 'brittany', 'amanda', 'stephanie',
			'jennifer', 'samantha', 'sarah', 'megan', 'lauren', 'elizabeth',
			'emily', 'amber', 'nicole', 'rachel', 'kayla', 'heather', 'melissa',
			'rebecca', 'michelle', 'danielle', 'courtney', 'tiffany', 'chelsea',
			'christina', 'katherine', 'kelsey', 'maria', 'laura', 'jasmine'];

	var names = new BoundArray(array, 'names');

	bubblesort(names,20);
};

window.onload = try_bubblesort;
