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
    placeholder: string | undefined = undefined;

    // An optional function to call instead of standard validation on a field's value.
    inputValidationFunc: InputValidationFunction | undefined = undefined;

    // An optional function to call instead of standard value extraction (getting a value from HTML elements).
    inputExtractionFunc: InputExtractionFunc | undefined = undefined;

    // An optional function to clean a value extracted from a field.
    inputCleaningFunc: InputCleaningFunc | undefined = undefined;

    // Additional classes to attach to the main field element.
    extraClasses: Array<string> | DOMTokenList = [];

    // A dataset to attach to the main field element.
    dataset: Record<string, string> = {};
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
                labelElement.innerHTML += ' <span class="required">*</span>'
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
        element.classList.add(`edq-field-${this.constructor.name.toLowerCase().replace(/field$/, '')}`);

        element.classList.add(...this.options.extraClasses);
        Object.assign(element.dataset, this.options.dataset);

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

class FieldSetOptions {
    // Include a submit button with this field set.
    includeSubmitButton: boolean = true;

    // The text for the submit button.
    submitButtonText: string = 'Submit';

    // If true, put the submit button (if it appears) before the input elements.
    // Otherwise, put it last.
    submitButtonFirst: boolean = true;

    // If true, disable the submit button when any of the contained fields fail validation.
    submitButtonDisableWhenInvalid: boolean = true;

    // A callback for when the submit button is pressed.
    submitCallback: FieldSetSubmitCallback | undefined = undefined;
}

// A collection of fields.
// Each field MUST have a unique `name` member,
// which will be used as the key for the field when fetching values.
// The fields will be presented in the order they are received.
class FieldSet {
    // The field instances contained in this object.
    fields: Array<Field>;

    options: FieldSetOptions

    // The HTML element for this collection.
    element: HTMLElement;

    constructor(fields: Array<Field>, options: FieldSetOptions = new FieldSetOptions()) {
        this.fields = fields;
        this.options = Object.assign(new FieldSetOptions(), options);

        this.element = document.createElement('fieldset');
        this.element.classList.add('edq-fieldset');

        let seenNames = new Set();
        let children = [];

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

        if (this.options.includeSubmitButton) {
            let button = document.createElement('button');
            button.classList.add('submit');
            button.innerText = this.options.submitButtonText;

            // Register the submission button callback.
            if (this.options.submitCallback != null) {
                let self = this;
                button.addEventListener('click', function(event) {
                    if (self.options.submitCallback == null) {
                        return;
                    }

                    let values = self.getValues();
                    self.options.submitCallback(values, self);
                });
            }

            // Handle disabling/enabling the button based on if the fields are valid.
            if (this.options.submitButtonDisableWhenInvalid) {
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

            if (this.options.submitButtonFirst) {
                children.unshift(button);
            } else {
                children.push(button);
            }
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
    // Get the tag used for input on this element.
    // This will usually be 'input', but gives an opportunity for children to override.
    // Despite the ability to change tag types, this class will still assume that a `HTMLInputElement` is produced.
    // It is up to any overriding children to make the proper adjustments.
    protected getInputTag(): string {
        return 'input';
    }

    protected createInnerElements(): Array<HTMLElement> {
        let element = document.createElement(this.getInputTag()) as HTMLInputElement;
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

    protected getElement(): HTMLInputElement {
        return (this.element.querySelector<HTMLInputElement>(this.getInputTag()) as HTMLInputElement);
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

class TextFieldOptions extends FieldOptions {
    minLength: number | undefined = undefined;
    maxLength: number | undefined = undefined;
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/text
class TextField extends SimpleInputField {
    constructor(options: TextFieldOptions = new TextFieldOptions()) {
        options = Object.assign(new TextFieldOptions(), options);
        super(options);
    }

    protected finalizeInput(element: HTMLInputElement) {
        element.type = 'text';

        let options = (this.options as TextFieldOptions);

        if (options.minLength != null) {
            element.minLength = options.minLength;
        }

        if (options.maxLength != null) {
            element.maxLength = options.maxLength;
        }
    }
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email
class EmailField extends TextField {
    protected finalizeInput(element: HTMLInputElement) {
        super.finalizeInput(element);
        element.type = 'email';
    }

    // Emails cannot be empty strings.
    protected getInnerValue(): any {
        let value = super.getInnerValue();

        if (value == null) {
            return undefined;
        }

        if (value.length == 0) {
            return undefined;
        }

        return value;
    }
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel
// Browser validation and input are limited on non-mobile browsers, but this is important for accessibility.
class PhoneNumberField extends TextField {
    protected finalizeInput(element: HTMLInputElement) {
        super.finalizeInput(element);
        element.type = 'tel';
    }

    // Phone numbers cannot be empty strings.
    protected getInnerValue(): any {
        let value = super.getInnerValue();

        if (value == null) {
            return undefined;
        }

        if (value.length == 0) {
            return undefined;
        }

        return value;
    }
}

class SecretFieldOptions extends TextFieldOptions {
    // See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password#allowing_autocomplete
    autocomplete: 'on' | 'off' | 'current-password' | 'new-password' | undefined = 'off';
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password
class SecretField extends TextField {
    constructor(options: SecretFieldOptions = new SecretFieldOptions()) {
        options = Object.assign(new SecretFieldOptions(), options);
        super(options);
    }

    protected finalizeInput(element: HTMLInputElement) {
        super.finalizeInput(element);
        element.type = 'password';

        let options = (this.options as SecretFieldOptions);

        if (options.autocomplete != null) {
            element.autocomplete = options.autocomplete;
        }
    }

    protected createInnerElements(): Array<HTMLElement> {
        let element = super.createInnerElements()[0] as HTMLInputElement;

        // Wrap the elements to put a show checkbox.

        let checkbox = document.createElement('input') as HTMLInputElement;
        checkbox.type = 'checkbox';
        checkbox.addEventListener('input', function(event) {
            if (checkbox.checked) {
                element.type = 'text';
            } else {
                element.type = 'password';
            }
        });

        let label = document.createElement('label');
        label.innerText = 'Show';

        let container = document.createElement('div');
        container.replaceChildren(element, label, checkbox);

        return [container];
    }
}

class TextAreaFieldOptions extends TextFieldOptions {
    rows: number | undefined = undefined;
    cols: number | undefined = undefined;
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
class TextAreaField extends TextField {
    constructor(options: TextAreaFieldOptions = new TextAreaFieldOptions()) {
        options = Object.assign(new TextAreaFieldOptions(), options);
        super(options);
    }

    protected getInputTag(): string {
        return 'textarea';
    }

    protected finalizeInput(rawElement: HTMLInputElement) {
        let element: HTMLTextAreaElement = ((rawElement as unknown) as HTMLTextAreaElement);
        let options = (this.options as TextAreaFieldOptions);

        if (options.rows != null) {
            element.rows = options.rows;
        }

        if (options.cols != null) {
            element.cols = options.cols;
        }
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

// A numeric field that can only have integers.
class IntegerField extends NumericField {
    protected finalizeInput(element: HTMLInputElement) {
        super.finalizeInput(element);
        element.pattern = '\d*';
    }
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range
class SliderField extends NumericField {
    protected createInnerElements(): Array<HTMLElement> {
        let element = super.createInnerElements()[0] as HTMLInputElement;

        // Wrap the elements to put a value label on the slider.

        let label = document.createElement('span');
        label.innerText = element.value;

        element.addEventListener('input', function(event) {
            label.innerText = element.value;
        });

        let container = document.createElement('div');
        container.replaceChildren(element, label);

        return [container];
    }

    protected finalizeInput(element: HTMLInputElement) {
        super.finalizeInput(element);
        element.type = 'range';
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

class ChoiceFieldOptions extends FieldOptions {
    // Mapping of label to value.
    choices: Record<string, any> = {};

    choiceLabelBefore: boolean = false;
}

// A set of "choices" (e.g., dropdown, radio buttons, or checkboxes).
// Note that this class is more strict than normal HTML variants, because each choice has to have a unique label.
abstract class ChoiceField extends Field {
    constructor(options: ChoiceFieldOptions = new ChoiceFieldOptions()) {
        options = Object.assign(new ChoiceFieldOptions(), options);
        super(options);

        let foundDefault = false;
        for (const [labelText, value] of Object.entries(options.choices)) {
            if ((this.options.defaultValue != null) && (this.options.defaultValue === value)) {
                foundDefault = true;
                break;
            }
        }

        if ((this.options.defaultValue != null) && !foundDefault) {
            console.error(this);
            throw new Error(`Choice field has a default value that was not seen in the choices: '${this.options.defaultValue}'.`);
        }
    }
}

// A ChoiceField that uses input tags as the basis of the choices (radio buttons and checkboxes).
abstract class InputChoiceField extends Field {
    constructor(options: ChoiceFieldOptions = new ChoiceFieldOptions()) {
        options = Object.assign(new ChoiceFieldOptions(), options);
        super(options);
    }

    protected createInnerElements(): Array<HTMLElement> {
        let options = (this.options as ChoiceFieldOptions);

        let element = document.createElement('div');
        element.id = this.id;

        for (const [labelText, value] of Object.entries(options.choices)) {
            let label = document.createElement('label');
            label.innerText = labelText;

            let choice = document.createElement('input') as HTMLInputElement;
            choice.type = this.getInputType();
            choice.value = value;
            choice.dataset.label = labelText;

            if (this.options.name != null) {
                choice.setAttribute('name', this.options.name);
            }

            if ((this.options.defaultValue != null) && (this.options.defaultValue === value)) {
                choice.checked = true;
            }

            let pair = document.createElement('div');

            if (options.choiceLabelBefore) {
                pair.appendChild(label);
                pair.appendChild(choice);
            } else {
                pair.appendChild(choice);
                pair.appendChild(label);
            }

            element.appendChild(pair);
        }

        // Mark the element as touched if it loses focus.
        element.addEventListener('focusout', function(event) {
            element.classList.add('touched');
        });

        return [element];
    }

    // Get all the checked choices.
    protected getChecked(): Record<string, any> {
        let options = (this.options as ChoiceFieldOptions);

        let checked: Record<string, any> = {};
        for (const choice of this.element.querySelectorAll<HTMLInputElement>(`input[type="${this.getInputType()}"]`)) {
            if (choice.checked) {
                // Fetch the value from the passed in options to preserve types.
                let label = (choice.dataset.label as string);
                checked[label] = options.choices[label];
            }
        }

        return checked;
    }

    protected validateInnerInput(onlyMessage: boolean): string | undefined {
        let hasSelection = false;
        for (const choice of this.element.querySelectorAll<HTMLInputElement>(`input[type="${this.getInputType()}"]`)) {
            if (choice.checked) {
                hasSelection = true;
            }
        }

        if (this.options.required && !hasSelection) {
            return 'Please make a selection.';
        }

        return undefined;
    }

    // Get the type for the input tag for this field.
    protected abstract getInputType(): string;
}

// A set of radio buttons.
class RadioField extends InputChoiceField {
    constructor(options: ChoiceFieldOptions = new ChoiceFieldOptions()) {
        options = Object.assign(new ChoiceFieldOptions(), options);
        super(options);
    }

    protected getInputType(): string {
        return 'radio';
    }

    protected getInnerValue(): any {
        for (const [key, value] of Object.entries(this.getChecked())) {
            return value;
        }

        return undefined;
    }
}

// A set of checkboxes.
class CheckboxField extends InputChoiceField {
    constructor(options: ChoiceFieldOptions = new ChoiceFieldOptions()) {
        options = Object.assign(new ChoiceFieldOptions(), options);
        super(options);
    }

    protected getInputType(): string {
        return 'checkbox';
    }

    protected getInnerValue(): any {
        return this.getChecked();
    }
}

class DropdownFieldOptions extends ChoiceFieldOptions {
    undefinedValue: string = '__edq_dropdown_undefined__';

    // Inlucde an option at the beginning that indicates no choice has been made.
    includeNoChoice: boolean = true;
    noChoiceLabel: string = '--- Select Choice ---';
}

// A dropdown menu.
// The value of `DropdownFieldOptions.undefinedValue` can be used to indicate a value that should be interpreted as no selection.
// When this value is encountered, an undefined will be returned from getValue().
// Because of the limitations of dropdown menus, a literal undefined cannot be used.
class DropdownField extends ChoiceField {
    constructor(options: DropdownFieldOptions = new DropdownFieldOptions()) {
        options = Object.assign(new DropdownFieldOptions(), options);
        super(options);
    }

    protected createInnerElements(): Array<HTMLElement> {
        let options = (this.options as DropdownFieldOptions);

        let selectElement = document.createElement('select');
        selectElement.id = this.id;

        if (this.options.name != null) {
            selectElement.setAttribute('name', this.options.name);
        }

        let allChoices = Object.entries(options.choices);
        if (options.includeNoChoice) {
            allChoices.unshift([options.noChoiceLabel, options.undefinedValue]);
        }

        for (const [labelText, value] of allChoices) {
            let choice = document.createElement('option') as HTMLOptionElement;
            choice.value = value;
            choice.textContent = labelText;

            if ((this.options.defaultValue != null) && (this.options.defaultValue === value)) {
                choice.selected = true;
            }

            selectElement.appendChild(choice);
        }

        // Mark the element as touched if it loses focus.
        selectElement.addEventListener('focusout', function(event) {
            selectElement.classList.add('touched');
        });

        return [selectElement];
    }

    protected validateInnerInput(onlyMessage: boolean): string | undefined {
        // Note the hard check for undefined, as null is allowed.
        if (this.options.required && (this.getInnerValue() === undefined)) {
            return 'Please make a selection.';
        }

        return undefined;
    }

    protected getInnerValue(): any {
        let options = (this.options as DropdownFieldOptions);

        let rawValue = this.element.querySelector<HTMLSelectElement>('select')?.value;
        if (rawValue === options.undefinedValue) {
            return undefined;
        }

        return rawValue;
    }
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
class FileFieldOptions extends FieldOptions {
    // The allowed file types/mimes for this field.
    // See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#accept
    allowedTypes: Array<string> | string | undefined = undefined;

    multiple: boolean = false;
}

// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time
class FileField extends SimpleInputField {
    constructor(options: FileFieldOptions = new FileFieldOptions()) {
        options = Object.assign(new FileFieldOptions(), options);
        super(options);
    }

    protected finalizeInput(element: HTMLInputElement) {
        let options = (this.options as FileFieldOptions);

        element.type = 'file';

        if (options.allowedTypes != null) {
            let values = options.allowedTypes;
            if ((typeof(values)) === 'string') {
                values = [values];
            }

            element.accept = values.join(',');
        }

        if (options.multiple != null) {
            element.multiple = options.multiple;
        }
    }

    protected getInnerValue(): any {
        return this.getElement().files;
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
    EmailField,
    PhoneNumberField,
    SecretField,
    TextAreaField,

    NumericFieldOptions,
    NumericField,
    IntegerField,
    SliderField,

    DateFieldOptions,
    DateField,
    LocalDatetimeField,

    TimeFieldOptions,
    TimeField,

    ChoiceFieldOptions,
    ChoiceField,
    InputChoiceField,
    RadioField,
    CheckboxField,
    DropdownField,

    FileFieldOptions,
    FileField,
}
