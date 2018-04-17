GULPPATH ?= node_modules/gulp/bin/gulp.js

all:
	node "$(GULPPATH)"
watch:
	node "$(GULPPATH)"
	node "$(GULPPATH)" watch
clean:
	rm js/easyrash.js
	rm css/rash.css
	rm css/bootstrap.min.css
	rm css/lncs.css
