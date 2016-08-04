const expect = require("expect");
const esprima = require("esprima");
const comments = require("../built/comments");

const helpers = require("./helpers");

const ESPRIMA_OPTIONS = {
  attachComment: true,
  comments: true,
  loc: true,
};

function createTest (obj) {
  it(obj.title, function () {
    const node = helpers.nodeFromCode(obj.code);
    const set = obj.set || new Set();
    const expected = obj.expected;
    comments.applyNodeComments(node, set);
    expect([...set]).toEqual(expected);
  });
}


describe("comments", function () {

  describe("comments", function () {
    
    createTest({
      title: "enable: works for leading line comments",
      expected: "abc".split(""),
      code: `
        // perturb-enable: a,,b,c
        const x = 1;
      `,
    });

    createTest({
      title: "enable: works for trailing line comments",
      expected: "abc".split(""),
      code: `
        const x = 1;
        // perturb-enable: a,,b,c
      `,
    });

    createTest({
      title: "enable: works for leading and trailing comments",
      expected: "abcd".split(""),
      code: `
        // perturb-enable: a,,b,c
        const x = 1;
        // perturb-enable: d
      `,
    });

    createTest({
      title: "disable: works for leading and trailing comments",
      expected: ["b"],
      code: `
        // perturb-enable: a,b
        const x = 1;
        // perturb-disable: a
      `,
    });
  });

});