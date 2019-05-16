const expect = require("expect");
const CommentManager = require("../lib/comments").default;

const { nodeFromCode } = require("./helpers");

function createTest({ title, expected, code, set }) {
  it(title, () => {
    const manager = new CommentManager(set);
    const node = nodeFromCode(code);
    manager.applyLeading(node);
    manager.applyTrailing(node);
    expect(manager.toArray()).toEqual(expected);
  });
}

describe("CommentManager", () => {
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

  createTest({
    title: "other comments are ok",
    expected: ["b", "c"],
    code: `
      // perturb-disable: a,b,,c
      // a red herring: a,b,,c
      const x = 1;
      // perturb-enable: a
    `,
  });

  createTest({
    title: "with no disabled mutations listed",
    expected: [],
    code: `
    // perturb-disable
    const x = 1;
    `,
  });
});
