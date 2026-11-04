const CARD_TYPE_LINK: string = 'link';
const CARD_TYPE_SMALL: string = 'small';
const CARD_TYPE_LARGE: string = 'large';

abstract class Card {
    type: string;
    name: string;
    extraClasses: Array<string> | DOMTokenList

    constructor(type: string, name: string = 'unknown', extraClasses: Array<string> | DOMTokenList = []) {
        this.type = type;
        this.name = name;
        this.extraClasses = extraClasses;
    }

    getElement(): HTMLElement {
        let element = document.createElement('div');
        element.classList.add('card');
        element.classList.add('drop-shadow');
        element.classList.add(...this.extraClasses);

        element.dataset['type'] = this.type;
        element.dataset['name'] = this.name;

        element.replaceChildren(...this.getInnerElements());

        return element;
    }

    protected abstract getInnerElements(): Array<HTMLElement>;
}

class LinkCardOptions {
    name: string = CARD_TYPE_LINK;
    extraClasses: Array<string> | DOMTokenList = [];
}

// A card that has some short text that serves as a link.
class LinkCard extends Card {
    text: string;
    link: string;

    constructor(text: string, link: string, options: LinkCardOptions = new LinkCardOptions()) {
        options = Object.assign(new LinkCardOptions(), options);
        super(CARD_TYPE_LINK, options.name, options.extraClasses);

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

class SmallCardOptions {
    name: string = CARD_TYPE_SMALL;
    extraClasses: Array<string> | DOMTokenList = [];
}

// A card that has some text (usually short) with no headers or breaks.
class SmallCard extends Card {
    text: string;

    constructor(text: string, options: SmallCardOptions = new SmallCardOptions()) {
        options = Object.assign(new SmallCardOptions(), options);
        super(CARD_TYPE_SMALL, options.name, options.extraClasses);

        this.text = text;
    }

    protected getInnerElements(): Array<HTMLElement> {
        let textElement = document.createElement('span');
        textElement.textContent = this.text;

        return [textElement];
    }
}

class LargeCardOptions {
    name: string = CARD_TYPE_LARGE;
    extraClasses: Array<string> | DOMTokenList = [];
    headerTag: string = 'h3';
}

// A card that has a large amount of text and possibly a header.
class LargeCard extends Card {
    header: string | undefined;
    headerTag: string;

    paragraphs: Array<string>;

    constructor(header: string | undefined, paragraphs: string | Array<string>, options: LargeCardOptions = new LargeCardOptions()) {
        options = Object.assign(new LargeCardOptions(), options);
        super(CARD_TYPE_LARGE, options.name, options.extraClasses);

        if ((typeof(paragraphs)) === 'string') {
            paragraphs = [paragraphs];
        }

        this.header = header;
        this.headerTag = options.headerTag;
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

    LinkCardOptions,
    SmallCardOptions,
    LargeCardOptions,

    CardArea,
}
