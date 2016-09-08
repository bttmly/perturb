const expect = require("expect");
const esprima = require("esprima");
const CommentManager = require("../built/comments");

const helpers = require("./helpers");

const ESPRIMA_OPTIONS = {
  attachComment: true,
  comments: true,
  loc: true,
};

function createTest (obj) {
  it(obj.title, function () {
    const manager = new CommentManager(obj.set || new Set());
    manager.applyNode(helpers.nodeFromCode(obj.code));
    expect(manager.toArray()).toEqual(obj.expected);
  });
}

describe("CommentManager", function () {

  createTest({
    title: "disable: works for leading line comments",
    expected: "abc".split(""),
    code: `
      // perturb-disable: a,,b,c
      const x = 1;
    `,
  });

  createTest({
    title: "disable: works for trailing line comments",
    expected: "abc".split(""),
    code: `
      const x = 1;
      // perturb-disable: a,,b,c
    `,
  });

  createTest({
    title: "disable: works for leading and trailing comments",
    expected: "abcd".split(""),
    code: `
      // perturb-disable: a,,b
      // perturb-disable:c
      const x = 1;
      // perturb-disable: d
    `,
  });

  createTest({
    title: "interleaved enable/disable works",
    expected: ["b"],
    code: `
      // perturb-disable: a,b,,c
      // perturb-enable: c,b
      // perturb-disable: b
      const x = 1;
      // perturb-enable: a
    `,
  });

});