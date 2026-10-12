const CARD_TYPE_LINK: string = 'link';
const CARD_TYPE_SMALL: string = 'small';
const CARD_TYPE_LARGE: string = 'large';

abstract class Card {
    type: string;
    name: string;

    constructor(type: string, name: string = 'unknown') {
        this.type = type;
        this.name = name;
    }

    getElement(): HTMLElement {
        let element = document.createElement('div');
        element.classList.add('card');
        element.classList.add('drop-shadow');

        element.dataset['type'] = this.type;
        element.dataset['name'] = this.name;

        element.replaceChildren(...this.getInnerElements());

        return element;
    }

    protected abstract getInnerElements(): Array<HTMLElement>;
}

// A card that has some short text that serves as a link.
class LinkCard extends Card {
    text: string;
    link: string;

    constructor(text: string, link: string, name: string = CARD_TYPE_LINK) {
        super(CARD_TYPE_LINK, name);

        this.text = text;
        this.link = link;
    }

    protected getInnerElements(): Array<HTMLElement> {
        let textElement = document.createElement('span');
        textElement.textContent = this.text;

        let linkElement = document.createElement('a');
        linkElement.href = this.link;
        linkElement.replaceChildren(textElement);

        return [linkElement];
    }
}

// A card that has some text (usually short) with no headers or breaks.
class SmallCard extends Card {
    text: string;

    constructor(text: string, name: string = CARD_TYPE_SMALL) {
        super(CARD_TYPE_SMALL, name);

        this.text = text;
    }

    protected getInnerElements(): Array<HTMLElement> {
        let textElement = document.createElement('span');
        textElement.textContent = this.text;

        return [textElement];
    }
}

// A card that has a large amount of text and possibly a header.
class LargeCard extends Card {
    header: string | undefined;
    headerTag: string;

    paragraphs: Array<string>;

    constructor(header: string | undefined, paragraphs: string | Array<string>, name: string = CARD_TYPE_LARGE, headerTag: string = 'h3') {
        super(CARD_TYPE_LARGE, name);

        if ((typeof(paragraphs)) === 'string') {
            paragraphs = [paragraphs];
        }

        this.header = header;
        this.headerTag = headerTag;
        this.paragraphs = paragraphs;
    }

    protected getInnerElements(): Array<HTMLElement> {
        let elements = [];

        if (this.header != null) {
            let headerElement = document.createElement(this.headerTag);
            headerElement.textContent = this.header;
            elements.push(headerElement);
        }

        for (const paragraph of this.paragraphs) {
            let textElement = document.createElement('p');
            textElement.textContent = paragraph;
            elements.push(textElement);
        }

        return elements;
    }
}

class CardArea {
    cards: Array<Card>;

    constructor(cards: Array<Card>) {
        this.cards = cards;
    }

    getElement(): HTMLElement {
        let cardElements = [];
        for (const card of this.cards) {
            cardElements.push(card.getElement());
        }

        let element = document.createElement('div');
        element.classList.add('card-area');

        element.replaceChildren(...cardElements);

        return element;
    }
}

export {
    CARD_TYPE_LINK,
    CARD_TYPE_SMALL,
    CARD_TYPE_LARGE,

    Card,
    LinkCard,
    SmallCard,
    LargeCard,

    CardArea,
}
