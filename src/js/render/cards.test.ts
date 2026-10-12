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
