// A custom function for validating input values.
type InputValidationFunction = (fieldInstance: FieldInstance) => boolean;

// A custom function for extracting a value from a field.
type InputExtractionFunc = (fieldInstance: FieldInstance) => any;

// A custom function for cleaning a value extracted from a field.
type InputCleaningFunc = (value: any) => any;

// A general representation of a user input field, but not the content within the field (see FieldInstance for that).
// The FieldType is responsible for generating and validating the HTML of a field.
abstract class FieldType {
    // The total number of FieldInstances created.
    // Used to create unique IDs for each field instance.
    private static counter: number = 0;

    // An optional name that will be attatched to the field instance container and input (if it exists).
    // This is traditionally the name/key that is sent on form submit.
    name: string | undefined;

    // An optional label for the input.
    label: string | undefined;

    // Put the label before the inner input elements.
    labelBefore: boolean;

    // An optional default value for the field.
    defaultValue: any | undefined;

    // If this field must be non-empty during validation.
    required: boolean;

    // Placeholder text to display (if possible).
    placeholder: string;

    // An optional function to call instead of standard validation on a field's value.
    inputValidationFunc: InputValidationFunction | undefined;

    // An optional function to call instead of standard value extraction (getting a value from HTML elements).
    inputExtractionFunc: InputExtractionFunc | undefined;

    // An optional function to clean a value extracted from a field.
    inputCleaningFunc: InputCleaningFunc | undefined;

    constructor({
            name = undefined,
            label = undefined,
            labelBefore = true,
            defaultValue = undefined,
            required = false,
            placeholder = '',
            inputValidationFunc = undefined,
            inputExtractionFunc = undefined,
            inputCleaningFunc = undefined,
            }: {
                name: string | undefined,
                label: string | undefined,
                labelBefore: boolean,
                defaultValue: any | undefined,
                required: boolean,
                placeholder: string,
                inputValidationFunc: InputValidationFunction | undefined,
                inputExtractionFunc: InputExtractionFunc | undefined,
                inputCleaningFunc: InputCleaningFunc | undefined,
            }) {
        // An optional name that will be attatched to the field instance container and input (if it exists).
        // This is traditionally the name/key that is sent on form submit.
        this.name = name;

        // An optional label for the input.
        this.label = label;

        // Put the label before the inner input elements.
        this.labelBefore = labelBefore;

        // An optional default value for the field.
        this.defaultValue = defaultValue;

        // If this field must be non-empty during validation.
        this.required = required;

        // Placeholder text to display (if possible).
        this.placeholder = placeholder;

        // An optional function to call instead of standard validation on a field's value.
        this.inputValidationFunc = inputValidationFunc;

        // An optional function to call instead of standard value extraction (getting a value from HTML elements).
        this.inputExtractionFunc = inputExtractionFunc;

        // An optional function to clean a value extracted from a field.
        this.inputCleaningFunc = inputCleaningFunc;
    }

    nextID(): string {
        return `edq-field-${FieldType.counter++}`;
    }

    // Get an instance of this archetype.
    abstract getInstance(): FieldInstance
}

// An instance of a FieldType in a document.
abstract class FieldInstance {
    // A unique (within this system) ID for this instance.
    id: string;

    // The field type that generated this instance.
    fieldType: FieldType;

    // The element reference for the container that houses any input elements and labels.
    element: HTMLElement;

    constructor(
            id: string,
            fieldType: FieldType,
            innerElements: Array<HTMLElement>,
            ) {
        // A unique (within this system) ID for this instance.
        this.id = id;

        // The field type that generated this instance.
        this.fieldType = fieldType

        let children = [...innerElements];
        if (this.fieldType.label != null) {
            let labelElement = document.createElement('label');
            labelElement.htmlFor = this.id;
            labelElement.innerText = this.fieldType.label;

            if (this.fieldType.labelBefore) {
                children.unshift(labelElement);
            } else {
                children.push(labelElement);
            }
        }

        // The element reference for the container that houses any input elements and labels.
        this.element = document.createElement('div');
        this.element.classList.add('edq-field');

        if (this.fieldType.name != null) {
            this.element.setAttribute('name', this.fieldType.name);
        }

        this.element.replaceChildren(...children);
    }

    // Validate the current input for this field and fill in any error fields.
    validateInput(): boolean {
        // TEST - Check FieldType validation.
        return true;
    }

    getValue(): any {
        let value: any = undefined;
        if (this.fieldType.inputExtractionFunc != null) {
            value = this.fieldType.inputExtractionFunc(this);
        } else {
            value = this._getValue();
        }

        if (this.fieldType.inputCleaningFunc != null) {
            value = this.fieldType.inputCleaningFunc(value);
        }

        return value;
    }

    protected abstract _getValue(): any
}

class TextField extends FieldType {
    getInstance(): FieldInstance {
        const id = this.nextID();

        let element = document.createElement('input');
        element.type = 'text';
        element.id = id;

        if (this.name != null) {
            element.setAttribute('name', this.name);
        }

        if (this.placeholder != null) {
            element.placeholder = this.placeholder;
        }

        if (this.defaultValue != null) {
            element.value = this.defaultValue;
        }

        return new TextFieldInstance(id, this, [element]);
    }
}

class TextFieldInstance extends FieldInstance {
    _getValue(): any {
        return (this.element.querySelector<HTMLInputElement>('input') as HTMLInputElement).value;
    }
}

export {
    TextField,
}
