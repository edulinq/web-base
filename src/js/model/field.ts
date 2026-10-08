import * as timestamp from './timestamp'

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

class FieldOptions {
    // An optional name that will be attached to the field instance container and input (if it exists).
    // This is traditionally the name/key that is sent on form submit.
    name: string | undefined = undefined;
    // An optional label for the input.
    label: string | undefined = undefined;

    // Put the label before the inner input elements.
    labelBefore: boolean = true;

    // Put the error before the inner input elements.
    errorBefore: boolean = false;

    // Validate this field when it loses focus.
    validateOnFocusOut: boolean = true;

    // An optional default value for the field.
    defaultValue: any | undefined = undefined

    // If this field must be non-empty during validation.
    required: boolean = false;

    // Placeholder text to display (if possible).
    placeholder: string = '';

    // An optional function to call instead of standard validation on a field's value.
    inputValidationFunc: InputValidationFunction | undefined = undefined;

    // An optional function to call instead of standard value extraction (getting a value from HTML elements).
    inputExtractionFunc: InputExtractionFunc | undefined = undefined;

    // An optional function to clean a value extracted from a field.
    inputCleaningFunc: InputCleaningFunc | undefined = undefined;
}

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

    // The options for this field.
    options: FieldOptions;

    // The element reference for the container that houses any input elements and labels.
    element: HTMLElement;

    constructor(options: FieldOptions = new FieldOptions()) {
        // A unique (within this system) ID for this instance.
        this.id = `edq-field-${Field.counter++}`;

        this.options = Object.assign(new FieldOptions(), options);

        this.element = this.createContainerElement();
    }

    // Create the HTML element for the container of this field.
    protected createContainerElement(): HTMLElement {
        let children = this.createInnerElements();

        if (this.options.label != null) {
            let labelElement = document.createElement('label');
            labelElement.htmlFor = this.id;
            labelElement.innerText = this.options.label;

            if (this.options.required) {
                labelElement.innerHTML += ' <span class="required-color">*</span>'
            }

            if (this.options.labelBefore) {
                children.unshift(labelElement);
            } else {
                children.push(labelElement);
            }
        }

        let errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.classList.add('hidden');

        if (this.options.errorBefore) {
            children.unshift(errorElement);
        } else {
            children.push(errorElement);
        }

        let element = document.createElement('div');
        element.classList.add('edq-field');

        if (this.options.name != null) {
            element.setAttribute('name', this.options.name);
        }

        if (this.options.validateOnFocusOut) {
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
        if (this.options.inputExtractionFunc != null) {
            value = this.options.inputExtractionFunc(this);
        } else {
            value = this.getInnerValue();
        }

        if (this.options.inputCleaningFunc != null) {
            value = this.options.inputCleaningFunc(value);
        }

        return value;
    }

    // Validate the current input for this field and return any validation error message.
    validateInput(ignoreExternalFunc: boolean = false, onlyMessage: boolean = false): string | undefined {
        let message: string | undefined = undefined;
        if (!ignoreExternalFunc && (this.options.inputValidationFunc != null)) {
            message = this.options.inputValidationFunc(this, onlyMessage);
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
            if (field.options.name == null) {
                console.error(field);
                throw new Error("Fields being passed to a FieldSet must have a name.");
            }

            if (seenNames.has(field.options.name)) {
                console.error(field);
                throw new Error(`Fields being passed to a FieldSet must have a unique name, name '${field.options.name}' already seen.`);
            }

            seenNames.add(field.options.name);
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
            result[(field.options.name as string)] = field.getValue();
        }

        return result;
    }
}

// A base class for all "simple" inputs fields backed by an `input` tag.
abstract class SimpleInputField extends Field {
    protected createInnerElements(): Array<HTMLElement> {
        let element = document.createElement('input') as HTMLInputElement;
        element.id = this.id;

        if (this.options.name != null) {
            element.setAttribute('name', this.options.name);
        }

        if (this.options.required) {
            element.required = true;
        }

        if (this.options.placeholder != null) {
            element.placeholder = this.options.placeholder;
        }

        if (this.options.defaultValue != null) {
            element.value = this.options.defaultValue;
        }

        // Mark the element as touched if it loses focus.
        element.addEventListener('blur', function(event) {
            element.classList.add('touched');
        });

        this.finalizeInput(element);

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

    // Finalize the input element before it is returned.
    // Children must set the input's type, can can set any other.
    protected abstract finalizeInput(element: HTMLInputElement): void;
}

class TextField extends SimpleInputField {
    protected finalizeInput(element: HTMLInputElement) {
        element.type = 'text';
    }
}

class NumericFieldOptions extends FieldOptions {
    min: number | undefined = undefined;
    max: number | undefined = undefined;
    step: number | undefined = undefined;
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number
class NumericField extends SimpleInputField {
    constructor(options: NumericFieldOptions = new NumericFieldOptions()) {
        super(options);
    }

    protected finalizeInput(element: HTMLInputElement) {
        let options = (this.options as NumericFieldOptions);

        element.type = 'number';

        if (options.min != null) {
            element.min = options.min.toString();
        }

        if (options.max != null) {
            element.max = options.max.toString();
        }

        if (options.step != null) {
            element.step = options.step.toString();
        }
    }

    protected getInnerValue(): any {
        let rawValue = super.getInnerValue();

        let value = parseFloat(rawValue);
        if (Number.isNaN(value)) {
            return undefined;
        }

        if (Number.isInteger(value)) {
            return parseInt(value.toString());
        }

        return value;
    }
}

class DateFieldOptions extends FieldOptions {
    min: timestamp.Timestamp | undefined = undefined;
    max: timestamp.Timestamp | undefined = undefined;

    // Offset the timezone of the given value (which is always UTC in these specific cases) to the user's local timezone.
    localTimezone: boolean = true;
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
class DateField extends SimpleInputField {
    constructor(options: DateFieldOptions = new DateFieldOptions()) {
        options = Object.assign(new DateFieldOptions(), options);
        super(options);
    }

    protected finalizeInput(element: HTMLInputElement) {
        let options = (this.options as DateFieldOptions);

        element.type = 'date';

        if (options.min != null) {
            element.min = timestamp.datestampToString(options.min);
        }

        if (options.max != null) {
            element.max = timestamp.datestampToString(options.max);
        }
    }

    protected getInnerValue(): any {
        let options = (this.options as DateFieldOptions);
        return timestamp.parse(super.getInnerValue(), options.localTimezone);
    }
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local
// Note that validation on min/max does not have good browser support.
class LocalDatetimeField extends SimpleInputField {
    constructor(options: DateFieldOptions = new DateFieldOptions()) {
        options = Object.assign(new DateFieldOptions(), options);
        super(options);
    }

    protected finalizeInput(element: HTMLInputElement) {
        let options = (this.options as DateFieldOptions);

        element.type = 'datetime-local';

        if (options.min != null) {
            element.min = timestamp.datestampToString(options.min);
        }

        if (options.max != null) {
            element.max = timestamp.datestampToString(options.max);
        }
    }

    protected getInnerValue(): any {
        return timestamp.parse(super.getInnerValue());
    }
}

class TimeFieldOptions extends FieldOptions {
    min: string | undefined = undefined;
    max: string | undefined = undefined;
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time
// A time of day.
// The browser controls the input type, but 24-hour ('hh:mm:ss') is always returned.
class TimeField extends SimpleInputField {
    constructor(options: TimeFieldOptions = new TimeFieldOptions()) {
        options = Object.assign(new TimeFieldOptions(), options);
        super(options);
    }

    protected finalizeInput(element: HTMLInputElement) {
        let options = (this.options as TimeFieldOptions);

        element.type = 'time';

        if (options.min != null) {
            element.min = options.min;
        }

        if (options.max != null) {
            element.max = options.max;
        }
    }

    protected getInnerValue(): any {
        let value = super.getInnerValue();

        if (value == null) {
            return undefined;
        }

        if (value.length == 0) {
            return undefined;
        }

        // Add in seconds if it is not there.
        if (value.length == 5) {
            value += ':00';
        }

        return value;
    }
}

export {
    InputValidationFunction,
    InputExtractionFunc,
    InputCleaningFunc,
    FieldSetSubmitCallback,

    FieldOptions,
    Field,
    FieldSet,

    SimpleInputField,

    TextField,

    NumericFieldOptions,
    NumericField,

    DateFieldOptions,
    DateField,
    LocalDatetimeField,

    TimeFieldOptions,
    TimeField,
}
