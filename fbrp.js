var fbrp = {
	DEFAULT: 0,
	DIGIT: 1,
	ALPHA: 2,
	SEPERATOR: 3,
	RANGE: 4,
	MULTIPLE: 5,

	getType: function(char) {
		if (char == " " || char == ":") {
			return fbrp.SEPERATOR;
		} else if (char == "-") {
			return fbrp.RANGE;
		} else if (char == ",") {
			return fbrp.MULTIPLE;
		} if (isNaN(char) == false) {
			return fbrp.DIGIT;
		} else {
			return fbrp.ALPHA;
		}
	},

	// Simple function to immitate C
	splitInt: function(result, string) {
		result[0] = '';
		result[1] = '';
		for (var c = 0; c < string.length; c++) {
			if (isNaN(string[c])) {
				result[1] += string[c];
			} else {
				result[0] += string[c];
			}
		}

		result[0] = eval(result[0]);
	},

	parse: function(reference) {
		var referenceObj = {
			book: "",
			chapterX: 0,
			verseX: 0,
			chapter: [{}, {}, {}, {}, {}, {}, {}],
			verse: [{}, {}, {}, {}, {}, {}, {}]
		}

		var parts = new Array(23);
		for (var i = 0; i < 23; i++) {
			parts[i] = {type: 0, text: ['', '', '', '', '', '', '', '', '', '']};
		}

		var x = 0;
		var y = 0;
		var lastType = 0;
		var partType = 0;
		for (var c = 0; c < reference.length; c++) {
			var type = fbrp.getType(reference[c]);
			var toAdd = type != fbrp.SEPERATOR && type != lastType && c != 0;

			if (toAdd) {
				parts[y].type = partType;

				y++;
				x = 0;
				partType = 0;
			}

			// Completely ignore seperators, but they are
			// not ignored when determining seperation
			if (type != fbrp.SEPERATOR) {
				if (type != fbrp.RANGE || type != fbrp.MULTIPLE) {
					partType = type;
				}

				parts[y].text[x] = reference[c];
				x++;
			}

			lastType = type;
		}

		// Set p to the length of parts
		y++;

		// 0 = book
		// 1 = chapter
		// 2 = verse
		var currentlyOn = 0;
		var jumping = 0;
		for (var p = 0; p < y; p++) {
			// When we get to a multiple or range part,
			// skip as it has detected that before.
			if (parts[p].type == fbrp.RANGE || parts[p].type == fbrp.MULTIPLE) {
				continue;
			}

			var partText = parts[p].text.join('');
			var parseInt = [];
			fbrp.splitInt(parseInt, partText);

			// Flexible Parsing Algorithm

			if (referenceObj.chapterX > 0 && parseInt[0] == undefined) {
				continue;
			}

			// If chapter added and not jumping, then set verse
			if (referenceObj.chapterX >= 1 && jumping == 0) {
				currentlyOn = 2;
			}

			// if book and str undefined and p != 0 then SET chapter
			if (currentlyOn == 0 && parseInt[1] == ''  && p != 0) {
				currentlyOn = 1;
			}

			// if book and str undefined and p == 0 then assume part of book
			if (currentlyOn == 0 && parseInt[1] == '' && p == 0) {
				referenceObj.book += partText;
				continue;
			}

			// if book and str valid then assume book
			if (currentlyOn == 0 && parseInt[1] != '') {
				referenceObj.book += partText;
				continue;
			}

			// check next type
			var nextType = 0;
			if (y != p - 1) {
				nextType = parts[p + 1].type;
			}

			// If jumping range
			if (jumping == 1) {
				fbrp.set(referenceObj, "end", currentlyOn, parseInt[0], 1);
				jumping = 0;

				// If comma is followed after range, the jumping is set
				// to 2 and continue. Else, then range is followed by range,
				// Switch to verse. This may be a slight duplicate of the condition
				// below, but I think it is fine here. jumping == 2 isn't tested anywhere,
				// but it is ignored through the parsers when jumping
				if (nextType == fbrp.MULTIPLE) {
					jumping = 2;
					continue;
				} else {
					currentlyOn = 2;
					continue;
				}

				// If we are at the end
				if (y == p - 1) {
					//continue;
				}
			} else if (jumping == 2) {
				// If we are jumping multiples. Then set it to zero
				// so it can be determined or not determined next
				jumping = 0;
			}

			// If next part is 4 (-) then send it to the next part + 1
			// of this loop to get straight to the next part. It will go into
			// the conditional above
			if (nextType == fbrp.RANGE) {
				fbrp.set(referenceObj, "start", currentlyOn, parseInt[0], 0);

				// Skip ahead, jump, and continue to next
				jumping = 1;
				continue;
			} else if (nextType == fbrp.MULTIPLE) {
				// Multiples don't depend on the next part, so it can
				// fit all in here.
				fbrp.set(referenceObj, "start", currentlyOn, parseInt[0], 0);
				fbrp.set(referenceObj, "end", currentlyOn, parseInt[0], 1);

				// Set jump on
				jumping = 2;
				continue;
			}

			// if chapter and int valid
			if (parseInt[0] != '' && jumping == 0) {
				// Add typical number (not in seperator or multiple)
				fbrp.set(referenceObj, "start", currentlyOn, parseInt[0], 0);
				fbrp.set(referenceObj, "end", currentlyOn, parseInt[0], 1);
			}
		}
		
		return referenceObj;
	},

	set: function(reference, part, currentlyOn, value, append) {
		if (currentlyOn == 1) {
			reference.chapter[reference.chapterX][part] = value;
			reference.chapterX += append;
		} else if (currentlyOn == 2) {
			reference.verse[reference.verseX][part] = value;
			reference.verseX += append;
		}
	}
}

module.exports = fbrp;
