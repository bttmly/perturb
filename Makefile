test: lint
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test --recursive

test-bail: lint
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test --bail --recursive

lint:
	./node_modules/.bin/eslint ./src/**/*.js

compile:
	rm -rf ./built
	./node_modules/.bin/tsc

example-events: compile
	rm -rf ./.perturb
	node ./script/run.js events

dogfood:
	rm -rf ./.perturb
	rm -rf ./built
	./node_modules/.bin/tsc
	node ./script/run.js dogfood $(RUNNER)

build:
	./node_modules/.bin/tsc --strictNullChecks

.PHONY: test example
