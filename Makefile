test: lint
	NODE_ENV=testing ./node_modules/.bin/_mocha ./test/**/*.js

lint:
	./node_modules/.bin/eslint ./lib/**/*.js

test-example:
	./node_modules/.bin/_mocha ./example/test/**/*-test.js

example:
	./bin/perturb -r ./examples/toy-lib

example-i:
	./bin/perturb -r ./examples/toy-lib -i

events:
	./bin/perturb -r ./examples/event-emitter

dogfood:
	NODE_ENV=testing ./bin/perturb -r ./ -c 'make test'

dogfood-i:
	NODE_ENV=testing ./bin/perturb -r ./ -i

.PHONY: test example
