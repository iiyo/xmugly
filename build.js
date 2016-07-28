/* global require */

var fs = require("fs");
var browserify = require("browserify");

var outputFile = fs.createWriteStream("build/xmugly.js");
var bundle = browserify("src/xmugly.js").bundle();
var info = JSON.parse("" + fs.readFileSync("package.json"));

outputFile.write(
    "/*\n" +
    "    xmugly (v" + info.version + ")\n" +
    "    Build time: " + (new Date().toUTCString()) + 
    "\n*/\n"
);

bundle.pipe(outputFile);
