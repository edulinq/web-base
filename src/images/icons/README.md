# EduLinq Icons

SVG icons in this directory are automatically compiled into the web project.
Because they will be compiled into a larger project, creators should take care that they are formatted correctly
and do not include extra/unnecessary information (which may be included automatically by editors).

Icons should look like the following:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width='100' height='100' viewBox='0 0 100 100' xmlns="http://www.w3.org/2000/svg">
    ...
</svg>
```
Where `...` is the actual content of the SVG.

Note that the width and height are set to 100 units.

All icons should be monochrome with no coloring information specified.
Setting `fill` and `stroke` in CSS should be all that is necessary to color the icons.

## Third-Party Icons

The following icons are not owned by EduLinq,
and are used according to fair use and to represent their owning entities:

 - [Discord](./discord.svg)
 - [GitHub](./github.svg)

All icons not mentioned here are owned by EduLinq and subject to the license in the root of this repository.
