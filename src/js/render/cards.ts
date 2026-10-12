const CARD_TYPE_LINK: string = 'link';

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

    Card,
    LinkCard,

    CardArea,
}
