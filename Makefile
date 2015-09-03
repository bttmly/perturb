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
	NODE_ENV=testing ./bin/perturb --rootDir ./ --testCmd 'make test'

dogfood-child:
	NODE_ENV=testing ./bin/perturb --rootDir ./ --testCmd 'make test' --runner mochaChild

dogfood-parallel:
	NODE_ENV=testing ./bin/perturb --rootDir ./ --testCmd 'make test' --runner mochaChild --parallel

dogfood-i:
	NODE_ENV=testing ./bin/perturb -r ./ -i

.PHONY: test example
