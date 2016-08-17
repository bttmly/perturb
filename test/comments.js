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
    expect([...manager]).toEqual(obj.expected);
  });
}

describe("CommentManager", function () {

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
      // perturb-enable: a,,b
      // perturb-enable:c
      const x = 1;
      // perturb-enable: d
    `,
  });

  createTest({
    title: "interleaved enable/disable works",
    expected: ["b"],
    code: `
      // perturb-enable: a,b,,c
      // perturb-disable: c,b
      // perturb-enable: b
      const x = 1;
      // perturb-disable: a
    `,
  });

});