test: lint
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test/**/*.js

lint:
	./node_modules/.bin/eslint ./src/**/*.js

events:
	./bin/perturb -r ./examples/event-emitter

example:
	./node_modules/.bin/tsc
	node ./run.js example

dogfood:
	./node_modules/.bin/tsc
	node ./run.js dogfood

build:
	./node_modules/.bin/tsc

.PHONY: test example
