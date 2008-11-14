h2. boundarray

h3. Description

Wrapping of the JavaScript Array object that allows for binding it's contents to an HTML list element.

Often, it's natural to bind the contents of a JavaScript array to a HTML list element (@OL@ or @UL@) for display. Once this is done, however, changes to the data in the array need to be propagated to the displayed HTML list.

boundarray binds a JavaScript array with a HTML list and, from then on, handles the glue code for keeping the HTML list in sync with the JavaScript array. It provides a wrapper that behaves, with a single exception, exactly like a JavaScript array, but also has the side effect of making any changes to the HTML list as well.

h3. Caveats

Due to limitations of the current version of JavaScript, it's impossible to implement @Array.prototype@ entirely in JavaScript itself. So boundarray provides a wrapper that behaves like a JavaScript array with one exception. A BoundArray cannot grow implicitly. (eg. for a bound array @numbers = ['one', 'two', 'three']@, you cannot call @numbers[3]='four'@ as you could in a normal JavaScript Array). To assign something to a method beyond a BoundArray's length, first extend the array through the length setter (eg. @numbers.length=4; numbers[3]='four';@ will work).

Because of extra properties needed by the wrapper, a enumeration of the array using for...in will not loop over the elements of the array. Use a standard for loop instead (eg. @for (i=0; i<numbers.length; i++) {...}@). for...in on arrays is bad practice for this reason anyway.

h3. Example

boundarray provides a constructor that binds a JavaScript array with a HTML list element with an option class added to every child @LI@ element.

With a HTML page containing the following:

<pre><code>
	<ol id="numbers"></ol>
</pre></code>

The following Javascript will bind to that list:

<pre><code>
	var n = ['one', 'two', 'three'];
	var bound = new BoundArray(n, 'numbers');
</pre></code>

From here on out, bound can be used as a normal JavaScript array and the changes made to it will be reflected in the HTML list.

<pre><code>
	bound.pop();
	bound.push('four');
	bound.shift('one');
	bound.push('five', 'six', 'seven');
</pre></code>

h3. More information

    http://github.com/devin/boundarray
    
h3. Author

    Devin Naquin, dnaquin@gmail.com
