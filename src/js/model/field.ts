// A custom function for validating input values.
// Return the error message, or undefined if there is no error.
// When `onlyMessage` is true, do not set error messages in the DOM, only return them.
type InputValidationFunction = (field: Field, onlyMessage: boolean) => string | undefined;

// A custom function for extracting a value from a field.
type InputExtractionFunc = (field: Field) => any;

// A custom function for cleaning a value extracted from a field.
type InputCleaningFunc = (value: any) => any;

// A callback for when a field set submit button is clicked.
type FieldSetSubmitCallback = (values: Record<string, any>, fieldSet: FieldSet) => void;

// A general representation of a user input field.
// Once constructed, an object will already be associated with an HTML element (accessible via element),
// and will therefore have a value available.
// It is up to the caller to place the element in their target parent element.
abstract class Field {
    // The total number of Fields created.
    // Used to create unique IDs for each field instance.
    private static counter: number = 0;

    // A unique (within this system) ID for this instance.
    id: string;

    // An optional name that will be attached to the field instance container and input (if it exists).
    // This is traditionally the name/key that is sent on form submit.
    name: string | undefined;

    // An optional label for the input.
    label: string | undefined;

    // Put the label before the inner input elements.
    labelBefore: boolean;

    // Put the error before the inner input elements.
    errorBefore: boolean;

    // Validate this field when it loses focus.
    validateOnFocusOut: boolean;

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

    // The element reference for the container that houses any input elements and labels.
    element: HTMLElement;

    constructor({
            name = undefined,
            label = undefined,
            labelBefore = true,
            errorBefore = false,
            validateOnFocusOut = true,
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
                errorBefore: boolean,
                validateOnFocusOut: boolean,
                defaultValue: any | undefined,
                required: boolean,
                placeholder: string,
                inputValidationFunc: InputValidationFunction | undefined,
                inputExtractionFunc: InputExtractionFunc | undefined,
                inputCleaningFunc: InputCleaningFunc | undefined,
            }) {
        // A unique (within this system) ID for this instance.
        this.id = `edq-field-${Field.counter++}`;

        this.name = name;

        this.label = label;

        this.labelBefore = labelBefore;

        this.errorBefore = errorBefore;

        this.validateOnFocusOut = validateOnFocusOut;

        this.defaultValue = defaultValue;

        this.required = required;

        this.placeholder = placeholder;

        this.inputValidationFunc = inputValidationFunc;

        this.inputExtractionFunc = inputExtractionFunc;

        this.inputCleaningFunc = inputCleaningFunc;

        this.element = this.createContainerElement();
    }

    // Create the HTML element for the container of this field.
    protected createContainerElement(): HTMLElement {
        let children = this.createInnerElements();

        if (this.label != null) {
            let labelElement = document.createElement('label');
            labelElement.htmlFor = this.id;
            labelElement.innerText = this.label;

            if (this.required) {
                labelElement.innerHTML += ' <span class="required-color">*</span>'
            }

            if (this.labelBefore) {
                children.unshift(labelElement);
            } else {
                children.push(labelElement);
            }
        }

        let errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.classList.add('hidden');

        if (this.errorBefore) {
            children.unshift(errorElement);
        } else {
            children.push(errorElement);
        }

        let element = document.createElement('div');
        element.classList.add('edq-field');

        if (this.name != null) {
            element.setAttribute('name', this.name);
        }

        if (this.validateOnFocusOut) {
            let field = this;
            element.addEventListener('focusout', function(event) {
                field.validateInput();
            });
        }

        element.replaceChildren(...children);

        return element;
    }

    getValue(): any {
        let value: any = undefined;
        if (this.inputExtractionFunc != null) {
            value = this.inputExtractionFunc(this);
        } else {
            value = this.getInnerValue();
        }

        if (this.inputCleaningFunc != null) {
            value = this.inputCleaningFunc(value);
        }

        return value;
    }

    // Validate the current input for this field and return any validation error message.
    validateInput(ignoreExternalFunc: boolean = false, onlyMessage: boolean = false): string | undefined {
        let message: string | undefined = undefined;
        if (!ignoreExternalFunc && (this.inputValidationFunc != null)) {
            message = this.inputValidationFunc(this, onlyMessage);
        } else {
            message = this.validateInnerInput(onlyMessage);
        }

        if (onlyMessage) {
            return message;
        }

        let errorElement = this.element.querySelector<HTMLElement>('.error-message') as HTMLElement;

        // If there is no validation error (message), clear any existing errors.
        // Otherwise, replace any existing errors and ensure the error area is shown.
        if (message == null) {
            errorElement.innerText = '';
            errorElement.classList.add('hidden');
        } else {
            errorElement.innerText = message
            errorElement.classList.remove('hidden');
        }

        return message;
    }

    // Create inner HTML elements (not the container or label).
    protected abstract createInnerElements(): Array<HTMLElement>;

    // Fetch the value from the inner HTML elements.
    protected abstract getInnerValue(): any;

    // Validate that the current value for this input is valid.
    // Return the error message, or undefined if there is no error.
    // When `onlyMessage` is true, do not set error messages in the DOM, only return them.
    protected abstract validateInnerInput(onlyMessage: boolean): string | undefined;
}

// A collection of fields.
// Each field MUST have a unique `name` member,
// which will be used as the key for the field when fetching values.
// The fields will be presented in the order they are received.
class FieldSet {
    // The field instances contained in this object.
    fields: Array<Field>;

    // The HTML element for this collection.
    element: HTMLElement;

    constructor(
            fields: Array<Field>, {
            includeSubmitButton = true,
            submitButtonText = 'Submit',
            submitButtonDisableWhenInvalid = true,
            submitCallback = undefined,
            }: {
                includeSubmitButton: boolean,
                submitButtonText: string,
                submitButtonDisableWhenInvalid: boolean,
                submitCallback: FieldSetSubmitCallback | undefined,
            }) {
        this.fields = fields;

        this.element = document.createElement('fieldset');
        this.element.classList.add('edq-fieldset');

        let seenNames = new Set();
        let children = [];

        if (includeSubmitButton) {
            let button = document.createElement('button');
            button.classList.add('submit');
            button.innerText = submitButtonText;

            // Register the submission button callback.
            if (submitCallback != null) {
                let self = this;
                button.addEventListener('click', function(event) {
                    let values = self.getValues();
                    submitCallback(values, self);
                });
            }

            // Handle disabling/enabling the button based on if the fields are valid.
            if (submitButtonDisableWhenInvalid) {
                button.disabled = (this.validateInputs(true).length != 0);

                let self = this;
                this.element.addEventListener('change', function(event) {
                    let messages = self.validateInputs(true);
                    if (messages.length == 0) {
                        button.disabled = false;
                    } else {
                        button.disabled = true;
                    }
                });
            }

            children.push(button);
        }

        for (const field of fields) {
            if (field.name == null) {
                console.error(field);
                throw new Error("Fields being passed to a FieldSet must have a name.");
            }

            if (seenNames.has(field.name)) {
                console.error(field);
                throw new Error(`Fields being passed to a FieldSet must have a unique name, name '${field.name}' already seen.`);
            }

            seenNames.add(field.name);
            children.push(field.element);
        }

        this.element.replaceChildren(...children);
    }

    // Validate all inputs and get a list of any errors.
    // If the list is empty, then there are no errors.
    validateInputs(onlyMessage: boolean = false): Array<string> {
        let messages = [];
        for (const field of this.fields) {
            let message = field.validateInput(false, onlyMessage);
            if (message != null) {
                messages.push(message);
            }
        }

        return messages;
    }

    // Get a mapping of each field's name to their value.
    getValues(): Record<string, any> {
        let result: Record<string, any> = {};
        for (const field of this.fields) {
            // Note that names have already been validated.
            result[(field.name as string)] = field.getValue();
        }

        return result;
    }
}

class TextField extends Field {
    protected createInnerElements(): Array<HTMLElement> {
        let element = document.createElement('input');
        element.type = 'text';
        element.id = this.id;

        if (this.name != null) {
            element.setAttribute('name', this.name);
        }

        if (this.required) {
            element.required = true;
        }

        if (this.placeholder != null) {
            element.placeholder = this.placeholder;
        }

        if (this.defaultValue != null) {
            element.value = this.defaultValue;
        }

        // Mark the element as touched if it loses focus.
        element.addEventListener('blur', function(event) {
            element.classList.add('touched');
        });

        return [element];
    }

    private getElement(): HTMLInputElement {
        return (this.element.querySelector<HTMLInputElement>('input') as HTMLInputElement);
    }

    protected getInnerValue(): any {
        return this.getElement().value;
    }

    protected validateInnerInput(onlyMessage: boolean): string | undefined {
        let inputElement = this.getElement();

        if (!inputElement.validity.valid) {
            return inputElement.validationMessage;
        }

        if (!inputElement.checkValidity()) {
            return inputElement.validationMessage;
        }

        return undefined;
    }
}

export {
    FieldSet,

    TextField,
}
