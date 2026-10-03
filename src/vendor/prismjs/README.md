[PrismJS](https://prismjs.com) is used for syntax highlighting.

Some modifications are required to get everything running correctly.

The JS file use CommonJS modules, and should be renamed to `prism.cjs`.

To handle light and dark modes, we download two different themes:
`okaidia` for dark mode
and `prism` (the default) for light mode.
These files should be renamed `prism-dark.css` and `prism-light.css` respectively.
Additionally, the contents of each file need to be modified to scope the CSS for each brightness mode.
Add `@scope (.darkmode)` and `@scope (.lightmode)` within each file to scope for the given mode.
