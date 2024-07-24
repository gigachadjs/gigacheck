import { ValidationRegistry } from ".";

class MissingValidatorError extends Error {
  constructor(name: string) {
    super(`Validator ${name} is not registered. Call registerValidator if this is a mistake.`);
  }
}

export function checkInputValidity(input: HTMLInputElement) {
  for (const name of ValidationRegistry.potentialAttributes) {
    if (!input.hasAttribute(name)) continue;

    const [validator, message] = ValidationRegistry.get(name);

    if (!validator) throw new MissingValidatorError(name);

    const arg = input.getAttribute(name);

    const isValid = arg === null ? validator(input.value) : validator(input.value, arg);

    if (isValid) {
      input.setCustomValidity("");
    } else {
      input.setCustomValidity(input.getAttribute(`${name}-message`) || message || "This field is invalid.");
    }
  }
}

export function eraseError(input: HTMLInputElement) {
  input.removeAttribute("invalid");

  const id = `${input.id || idifyName(input.name)}-id`;
  const errorDiv = document.getElementById(id);

  errorDiv?.remove();

  input.removeEventListener("input", cleanup, true);
}

export function writeError(input: HTMLInputElement, message: string) {
  input.setAttribute("invalid", "");

  const id = `${input.id || idifyName(input.name)}-id`;
  const errorDiv = document.getElementById(id);

  if (errorDiv) {
    errorDiv.innerText = message;

    return;
  }

  const span = document.createElement("span");
  span.innerText = message;
  span.id = id;

  input.insertAdjacentElement("afterend", span);
}

export function addCleanupEventListener(input: HTMLInputElement) {
  input.addEventListener("input", cleanup, true);
}

function cleanup(event: Event) {
  if (!event.target) return;

  const input = event.target as HTMLInputElement;

  checkInputValidity(input);

  if (input.validity.valid) {
    eraseError(input);
  } else {
    writeError(input, input.validationMessage || "This field is invalid.");
  }
}

function idifyName(name: string) {
  return name.replace(/\[|\]/g, "-").replace(/-$/, "");
}
