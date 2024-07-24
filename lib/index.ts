export type Validator = (value: string, arg?: string) => boolean;

export class ValidationRegistry {
  static validators: Map<string, Validator> = new Map();
  static messages: Map<string, string | undefined> = new Map();

  static get(name: string): [Validator | undefined, string | undefined] {
    return [this.validators.get(name), this.messages.get(name)];
  }

  static get potentialAttributes() {
    return this.validators.keys();
  }
}

type RenderErrorFn = (input: HTMLInputElement, message: string) => void;
type RemoveErrorFn = (input: HTMLInputElement) => void;

export class Validation {
  static renderError: RenderErrorFn | undefined;
  static removeError: RemoveErrorFn | undefined;
  static inputClass: string | undefined;
  static errorClass: string | undefined;

  static configure({
    renderError,
    removeError,
    inputClass,
    errorClass,
  }: {
    renderError?: RenderErrorFn;
    removeError?: RemoveErrorFn;
    inputClass?: string;
    errorClass?: string;
  }) {
    this.renderError = renderError;
    this.removeError = removeError;
    this.inputClass = inputClass;
    this.errorClass = errorClass;
  }
}

export function registerValidator(name: string, validator: Validator, message?: string) {
  ValidationRegistry.validators.set(name, validator);
  ValidationRegistry.messages.set(name, message);
}

export { initializeForm } from "./form";
