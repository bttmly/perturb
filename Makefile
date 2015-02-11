test:
	NODE_ENV='testing' ./node_modules/.bin/_mocha ./test/**/*.js

test-example:
	NODE_ENV='testing' ./node_modules/.bin/_mocha ./example/test/**/*-test.js

example:
 NODE_ENV='testing' ./bin/perturb -r ./example

example-i:
	NODE_ENV='testing' ./bin/perturb -r ./example -i

dogfood:
	NODE_ENV='testing' ./bin/perturb -r ./

dogfood-i:
	NODE_ENV='testing' ./bin/perturb -r ./ -i

.PHONY: test example