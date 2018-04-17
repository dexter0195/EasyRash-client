Introduction
-------------

EasyRash is an online platform for organizing academic conferences.
It covers all the roles and phases involved in the process, including
Event and Paper submissions and Peer-Review.
The reviewers can use the site to annotate the papers
and give feedback to the chair for the final decision.

This is the EasyRash client repo.

This project was done by as a part of the Web Technologies course (2015-2016) held by Professor Fabio Vitali at University of Bologna.

License
-------
This software is released under the GPL v3.0 licence.

Members
----------
 - Carlo De Pieri carlo.depieri@studio.unibo.it
 - Alessio Koci alessio.koci@studio.unibo.it
 - Gianmaria Pedrini gianmaria.pedrini@studio.unibo.it (gianmariapedrini@gmail.com)
 - Alessio Trivisonno [me] alessio.trivisonno@studio.unibo.it (alessio.trivisonno@gmail.com)

Requirements
-------------
```
angular
gulp
gulp-concat
gulp-rename
gulp-uglify
gulp-order
gulp-watch
postcss-scopify
gulp-postcss
```

You can install them easily with npm:

```
npm install angular gulp gulp-concat gulp-rename gulp-uglify gulp-order gulp-watch postcss-scopify gulp-postcss
```

Usage
------

- Set baseUrl in js/app.js to your server url (defaults to localhost:10000)
- Compile with Gulp
```
make
```
- Serve index.html with Apache/Ngnix.

