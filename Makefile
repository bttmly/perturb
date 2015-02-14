test:
	./node_modules/.bin/_mocha ./test/**/*.js

test-example:
	./node_modules/.bin/_mocha ./example/test/**/*-test.js

example:
	./bin/perturb -r ./example

example-i:
	./bin/perturb -r ./example -i

dogfood:
	./bin/perturb -r ./

dogfood-i:
	./bin/perturb -r ./ -i

.PHONY: test example