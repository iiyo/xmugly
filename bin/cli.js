#!/usr/bin/env node

/* global require, process */

var fs = require("fs");
var compile = require("../src/xmugly").compile;
var args = process.argv;
var path = args[2];

if (args.length < 3) {
    console.log("Usage: xmugly [path_to_xmugly_file]");
}
else {
    console.log(compile("" + fs.readFileSync(path)));
}
