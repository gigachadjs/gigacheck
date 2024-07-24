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

export function registerValidator(name: string, validator: Validator, message?: string) {
  ValidationRegistry.validators.set(name, validator);
  ValidationRegistry.messages.set(name, message);
}

export { initializeForm } from "./form";
