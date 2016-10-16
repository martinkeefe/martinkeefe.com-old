// Based on https://github.com/caseywebdev/herit

(function (root, factory) {
	if (typeof define === 'function' && define.amd) define([], factory);
	else if (typeof exports !== 'undefined') module.exports = factory();
	else root.herit = factory();
})(this, function () {
	'use strict';

	// Define the mixin
	var herit = function () {

		// Juggle arguments.
		var i;
		var Parent = function () {};
		for (i = 0; typeof arguments[i] === 'function'; ++i) {
			Parent = i ? herit(arguments[i], {constructor: Parent}) : arguments[i];
		}
		var protoProps = arguments[i] || {};
		var propProps = arguments[i+1]; // MJK

		// `Child` is the passed in `constructor` proto property
		// or a default function that uses `Parent`'s constructor.
		var Child =
			protoProps.hasOwnProperty('constructor') ?
			protoProps.constructor :
			function () { return Parent.apply(this, arguments); };

		Child.prototype = Object.create(Parent.prototype, propProps);

		// Pass __super__ and the on the prototype properties.
		Object.assign(Child.prototype, protoProps);

		// Pass on the static properties.
		Object.assign(Child, Parent, arguments[i + 2] || {});

		Child.extend = function() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(Child);
			return herit.apply(this, args);
		};

		// Return the finished constructor.
		return Child;
	};

	return herit;
});
