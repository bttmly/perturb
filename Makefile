test: compile
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test/setup ./test --recursive

test-bail: compile
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test/setup ./test --recursive --bail

compile:
	rm -rf ./lib
	./node_modules/.bin/tsc --strictNullChecks --declaration

example-events: compile
	rm -rf ./.perturb
	node ./script/run.js events

example-toy: compile
	rm -rf ./.perturb
	node ./script/run.js toy

dogfood: compile
	rm -rf ./.perturb
	node ./lib/cli -s lib

dogfood-fork: compile
	rm -rf ./.perturb
	node ./lib/cli -s lib -u fork

ci: compile
	node ./lib/cli -s lib -k 70

.PHONY: test example
