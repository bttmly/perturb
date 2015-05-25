test:
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test/**/*.js

lint:
	./node_modules/.bin/jshint ./**/*.js

test-example:
	./node_modules/.bin/_mocha ./example/test/**/*-test.js

example:
	./bin/perturb -r ./example

example-i:
	./bin/perturb -r ./example -i

dogfood:
	NODE_ENV=testing ./bin/perturb -r ./ -c 'make test'

dogfood-i:
	NODE_ENV=testing ./bin/perturb -r ./ -i

.PHONY: test example
