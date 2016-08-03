const fs = require("fs");
const path = require("path");
fs.readdirSync(path.join(__dirname, "test"))
  .filter(f => f.slice(-3) === ".js")
  .forEach(f => {
    console.log("requiring", f, "...");
    require(`./test/${f}`)
  });