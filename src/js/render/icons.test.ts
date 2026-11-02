import * as icons from './icons';
import * as iconsData from './icons-data';

test("getIconNames() base", function() {
    iconsData.init();

    expect(icons.getNames().length).toBeGreaterThan(0);
});
