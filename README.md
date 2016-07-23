# XML Less Ugly (xmugly)

Xmugly is a simpler syntax for writing XML or HTML files. It also supports "attribute" macros
that allow you to create shortcuts for common attributes and their values. The xmugly syntax
is especially useful for writing XML documents with lots of elements with only attributes and
no children.

## The Syntax

Consider the following xmugly snippet:

```
. scene id start :
    . show asset Cindy, duration 200
    . wait
    . move asset Cindy, x 50%, y 50%
--
```

It will be translated to the following XML snippet:

```XML
<scene id="start">
    <show asset="Cindy" duration="200" />
    <wait />
    <move asset="Cindy" x="50%" y="50%" />
</scene>
```

Of course you can also use XML directly in cases where it might be a better fit (e.g.
heavily nested stuff that needs to be on one line):

```
. book :
    <title>Horns</title>
    . author firstName Joe, lastName Hill
--
```

Of course attribute values can be more than just a word:

    . div class foo bar baz, id myDiv :
       ...
    --
    <div class="foo bar baz" id="myDiv">
        ...
    </div>

If your attribute value needs to contain a comma, you can put the value in quotation marks:

    . tag add "foo, bar", remove baz
    <tag add="foo, bar" remove="baz" />

Last but not least you can use "attribute macros" to make the syntax even terser:

```
~ # id _
~ @ asset _
~ : duration _
. scene #start :
    . show @Cindy, :200
    . wait
    . move @Cindy, x 50%, y 50%
--
```

These macros are defined by writing a ~ followed by a special character, the attribute name and
then its value. If the attribute name or value contains only an underscore, the underscore
will be replaced by whatever is followed after the special character in the xmugly file.

Here are some examples for macros and how they translate to XML attributes:

    ~ # id _
    . a #foo
    <a id="foo" />

    ~ ? _ _
    . a ?foo
    <a foo="foo" />

    ~ + _ true
    . stage +create
    <stage create="true" />

    ~ ^ target _blank
    . a href example.com, ^ :
        My Website
    --
    <a href="example.com" target="_blank">
        My Website
    </a>

## Installation

Node:

    npm install -g xmugly

Browser:

    <script src="path/to/xmugy/build/xmugly.js"></script>

## Usage as a command line tool

    xmugly my_file.xmugly > my_file.xml
