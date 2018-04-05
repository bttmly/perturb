test: compile
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test/setup ./test --recursive

test-bail: compile
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test/setup ./test --recursive --bail

compile:
	rm -rf ./built
	./node_modules/.bin/tsc --strictNullChecks

example-events: compile
	rm -rf ./.perturb
	node ./script/run.js events

dogfood: compile
	rm -rf ./.perturb
	node ./bin/perturb -s built

build:
	./node_modules/.bin/tsc --strictNullChecks

install:
	npm install
	./node_modules/.bin/typings install

.PHONY: test example
