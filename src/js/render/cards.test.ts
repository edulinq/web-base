import * as cards from './cards';

describe("LinkCard base", function() {
    // [[card, expected], ...]
    const testCases: Array<[cards.LinkCard, string]> = [
        [
            new cards.LinkCard('text', 'link', 'name'),
            '<div class="card drop-shadow" data-type="link" data-name="name"><a href="link"><span>text</span></a></div>',
        ],
        [
            new cards.LinkCard('text', 'link'),
            '<div class="card drop-shadow" data-type="link" data-name="link"><a href="link"><span>text</span></a></div>',
        ],
    ];

    test.each(testCases)("%s", function(card, expected) {
        expect(card.getElement().outerHTML).toBe(expected);
    });
});

describe("SmallCard base", function() {
    // [[card, expected], ...]
    const testCases: Array<[cards.SmallCard, string]> = [
        [
            new cards.SmallCard('text', 'name'),
            '<div class="card drop-shadow" data-type="small" data-name="name"><span>text</span></div>',
        ],
        [
            new cards.SmallCard('text'),
            '<div class="card drop-shadow" data-type="small" data-name="small"><span>text</span></div>',
        ],
    ];

    test.each(testCases)("%s", function(card, expected) {
        expect(card.getElement().outerHTML).toBe(expected);
    });
});

describe("LargeCard base", function() {
    // [[card, expected], ...]
    const testCases: Array<[cards.LargeCard, string]> = [
        // Empty
        [
            new cards.LargeCard(undefined, ''),
            '<div class="card drop-shadow" data-type="large" data-name="large"><p></p></div>',
        ],

        // String Paragraph
        [
            new cards.LargeCard('header', 'text', 'name'),
            '<div class="card drop-shadow" data-type="large" data-name="name"><h3>header</h3><p>text</p></div>',
        ],

        // Array Paragraphs
        [
            new cards.LargeCard('header', ['text1', 'text2'], 'name'),
            '<div class="card drop-shadow" data-type="large" data-name="name"><h3>header</h3><p>text1</p><p>text2</p></div>',
        ],

        // Header Tag
        [
            new cards.LargeCard('header', 'text', 'name', 'h2'),
            '<div class="card drop-shadow" data-type="large" data-name="name"><h2>header</h2><p>text</p></div>',
        ],

        // No Header
        [
            new cards.LargeCard(undefined, 'text'),
            '<div class="card drop-shadow" data-type="large" data-name="large"><p>text</p></div>',
        ],
    ];

    test.each(testCases)("%s", function(card, expected) {
        expect(card.getElement().outerHTML).toBe(expected);
    });
});

describe("CardArea base", function() {
    // [[card, expected], ...]
    const testCases: Array<[cards.CardArea, string]> = [
        [
            new cards.CardArea([]),
            '<div class="card-area"></div>',
        ],
        [
            new cards.CardArea([new cards.LinkCard('text', 'link')]),
            '<div class="card-area"><div class="card drop-shadow" data-type="link" data-name="link"><a href="link"><span>text</span></a></div></div>',
        ],
    ];

    test.each(testCases)("%s", function(card, expected) {
        expect(card.getElement().outerHTML).toBe(expected);
    });
});
