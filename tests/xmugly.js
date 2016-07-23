/* global require, it, describe */

var assert = require("assert");
var xmugly = require("../src/xmugly");
var compile = xmugly.compile;
var fs = require("fs");

var sourceFile = "" + fs.readFileSync("test.xmugly");
var expectedFile = "" + fs.readFileSync("expected.xml");

describe("xmugly", function () {
    
    describe(".compile(text, defaultMacros)", function () {
        
        it("translates the xmugly test file to XML", function () {
            assert.equal(compile(sourceFile), expectedFile);
        });
    });
    
});
