test: compile
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test --recursive

test-bail: compile
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test --bail --recursive

compile:
	rm -rf ./built
	./node_modules/.bin/tsc --strictNullChecks

example-events: compile
	rm -rf ./.perturb
	node ./script/run.js events

dogfood: compile
	rm -rf ./.perturb
	node ./script/run.js dogfood $(RUNNER)

build:
	./node_modules/.bin/tsc --strictNullChecks

.PHONY: test example
