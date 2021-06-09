# fbrp.js
When I was designing FBRP, I created a prototype in JavaScript before  
the real [C implementation](https://code.heb12.com/heb12/fbrp). Beware, the code is very messy and definitely  
not my best.  

Feel free to send any pull requests. I'm even open to a different code style.  

# Usage"
You'll find a good bit of comments in the code.
The return object is fairly straightforward to parse.
```
node test.js # (2 Kings 1, 3-5:2-4, 3-6, 1-2)

{ book: '2Kings',
  chapterX: 2,
  verseX: 3,
  chapter:
   [ { start: 1, end: 1 }, { start: 3, end: 5 }, {}, {}, {}, {}, {} ],
  verse:
   [ { start: 2, end: 4 },
     { start: 3, end: 6 },
     { start: 1, end: 2 },
     {},
     {},
     {},
     {} ] }
```
