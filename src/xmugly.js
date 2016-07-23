//
// A module containing functions for compiling a simple command language to the old
// WSE command elements.
//

/* global module */

//
// Compiles the new WSE command language to XML elements.
//
function  compile (text) {
    
    text = compileElements(text);
    
    return text;
}

//
// Compiles
//     . some_element attr1 val1, attr2 val2
// to:
//     <some_element attr1="val1", attr2="val2" />
// and
//     . some_element attr1 val1 :
//     ...
//     --
// to
//     <some_element attr1="val1">
//     ...
//     </some_element>
//
function compileElements (text, defaultMacros) {
    
//
// A stack of element names, so that know which "--" closes which element.
//
    var stack = [];
    var lines = toLines(text);
    var macros = processMacros(lines);
    
    if (Array.isArray(defaultMacros)) {
        defaultMacros.forEach(function (macro) {
            macros.push(macro);
        });
    }
    
    lines = removeMacroDefinitions(lines);
    
    lines = lines.map(function (line, i) {
        
        var name, attributes, parts, trimmed, head, whitespace, strings, result, hasContent;
        
        trimmed = line.trim();
        strings = [];
        whitespace = line.replace(/^([\s]*).*$/, "$1");
        
        if (trimmed === "--") {
            
            if (!stack.length) {
                throw new SyntaxError(
                    "Closing '--' without matching opening tag on line " + (i + 1)
                );
            }
            
            return whitespace + '</' + stack.pop() + '>';
        }
        
        if (trimmed[0] !== ".") {
            return line;
        }
        
        trimmed = trimmed.replace(/"([^"]+)"/g, function (match, p1) {
            
            strings.push(p1);
            
            return "{{" + strings.length + "}}";
        });
        
        if (trimmed[trimmed.length - 1] === ":") {
            hasContent = true;
            trimmed = trimmed.replace(/:$/, "");
        }
        
        parts = trimmed.split(",");
        head = parts[0].split(" ");
        
        head.shift();
        
        name = head[0];
        
        if (hasContent) {
            stack.push(name);
        }
        
        head.shift();
        
        parts[0] = head.join(" ");
        
        attributes = [];
        
        parts.forEach(function (current) {
            
            var split, name, value, enlarged;
            
            split = normalizeWhitespace(current).split(" ");
            
            name = split[0].trim();
            
            if (!name) {
                return;
            }
            
            enlarged = applyMacros(name, macros);
            
            if (enlarged) {
                value = enlarged.value;
                name = enlarged.name;
            }
            else {
                
                split.shift();
                
                value = split.join(" ");
            }
            
            attributes.push(name + '="' + value + '"');
        });
        
        result = whitespace + '<' + name + (attributes.length ? ' ' : '') +
            attributes.join(" ") + (hasContent ? '>' : ' />');
        
        strings.forEach(function (value, i) {
            result = result.replace("{{" + (i + 1) + "}}", value);
        });
        
        return result;
        
    });
    
    return toText(lines);
}

function toLines (text) {
    return text.split("\n");
}

function toText (lines) {
    return lines.join("\n");
}

//
// Creates a replacement rule from an attribute macro line.
// Attribute macros look like this:
//
// ~ @ asset _
//
// The ~ at the start of a line signalizes that this is an attribute macro.
// The first non-whitespace part (@ in this case) is the character or text part
// which will be used as the macro identifier.
// The second part (asset in this case) is the attribute name.
// The third and last part (_ here) is the attribute value.
// The "_" character will be replaced by whatever follows the macro identifier.
// 
// The example above will result in this transformation:
//
// . move @frodo => <move asset="frodo" />
//
// Some more examples:
//
// Macro: ~ : duration _
// Transformation: . wait :200 => <wait duration="200" />
//
// Macro: ~ + _ true
// Macro: ~ - _ false
// Transformation: . stage -resize, +center => <stage resize="false" center="true" />
//
function processAttributeMacro (line) {
    
    var parts = normalizeWhitespace(line).split(" ");
    
    parts.shift();
    
    return {
        identifier: parts[0],
        attribute: parts[1],
        value: parts[2]
    };
}

function processMacros (lines) {
    
    var macros = [];
    
    lines.forEach(function (line) {
        
        if (line.trim()[0] !== "~") {
            return;
        }
        
        macros.push(processAttributeMacro(line));
    });
    
    return macros;
}

function applyMacros (raw, macros) {
    
    var name, value;
    
    macros.some(function (macro) {
        
        var macroValue;
        
        if (raw[0] !== macro.identifier) {
            return false;
        }
        
        macroValue = raw.replace(macro.identifier, "");
        name = (macro.attribute === "_" ? macroValue : macro.attribute);
        value = (macro.value === "_" ? macroValue : macro.value);
        
        return true;
    });
    
    if (!name) {
        return null;
    }
    
    return {
        name: name,
        value: value
    };
}

function removeMacroDefinitions (lines) {
    return lines.filter(function (line) {
        return line.trim()[0] !== "~";
    });
}

//
// Replaces all whitespace with a single space character.
//
function normalizeWhitespace (text) {
    return text.trim().replace(/[\s]+/g, " ");
}

module.exports = {
    compile: compile
};
