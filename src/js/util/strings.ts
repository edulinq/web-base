const WORD_BREAK_RE = /[\-_]+/

function stringCompare(a: string, b: string): number {
    return a.localeCompare(b);
}

function caseInsensitiveStringCompare(a: string, b: string) : number {
    return a.localeCompare(b, undefined, {sensitivity: 'base'});
}

// Perform basic cleaning operations on a string destined for display.
// WORD_BREAK_RE will be used to determine word breaks and converted to space.
function cleanText(text: any): string {
    if (text == null) {
        return '';
    }

    text = text.toString();

    // Replace word breaks.
    text = text.replace(WORD_BREAK_RE, ' ');

    // Replace any contiguous whitespace with a single space.
    text = text.replace(/\s+/, ' ');

    // Trim.
    text = text.trim();

    return text;
}

// Title case a string (with optional cleaning).
// Words are tokenized based on whitespace (not regex word boundaries),
// and rejoined with a single space.
function titleCase(text: string, clean: boolean = true): string {
    if (text.length == 0) {
        return '';
    }

    if (clean) {
        text = cleanText(text);
    }

    return text.toLowerCase().split(/\s+/).map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

export {
    caseInsensitiveStringCompare,
    cleanText,
    stringCompare,
    titleCase,
}
