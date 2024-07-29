import { Validation, ValidationRegistry } from ".";

export function checkValidity(input: HTMLInputElement) {
  input.setCustomValidity("");

  if (isHTML5Invalid(input)) return checkHTML5Validity(input);

  const attrs = Array.from(input.attributes);

  for (const attr of attrs) {
    const validator = ValidationRegistry.validators.get(attr.name);

    if (!validator) continue;

    const valid = attr.value ? validator(input.value, attr.value) : validator(input.value);

    if (valid) {
      input.setCustomValidity("");
    } else {
      const message = fetchMessage(input, attr.name);

      input.setCustomValidity(message);

      return attr.name;
    }
  }
}

function isHTML5Invalid(input: HTMLInputElement) {
  const validity = input.validity;

  return (
    validity.valueMissing ||
    validity.typeMismatch ||
    validity.patternMismatch ||
    validity.tooLong ||
    validity.tooShort ||
    validity.rangeOverflow ||
    validity.rangeUnderflow
  );
}

function checkHTML5Validity(input: HTMLInputElement) {
  const validity = input.validity;

  let type;

  if (validity.valueMissing) {
    type = "required";
  } else if (validity.typeMismatch) {
    type = "type";
  } else if (validity.patternMismatch) {
    type = "pattern";
  } else if (validity.tooLong) {
    type = "maxlength";
  } else if (validity.tooShort) {
    type = "minlength";
  } else if (validity.rangeOverflow) {
    type = "max";
  } else if (validity.rangeUnderflow) {
    type = "min";
  }

  if (!type) return;

  if (input.hasAttribute(`${type}-message`)) {
    input.setCustomValidity(input.getAttribute(`${type}-message`)!);
  } else if (ValidationRegistry.messages.get(type)) {
    const maybeMessage = ValidationRegistry.messages.get(type);
    let message = maybeMessage;

    if (typeof maybeMessage === "function") {
      message = maybeMessage(input.value, type);
    }

    input.setCustomValidity(message as string);
  }

  return type;
}

export function eraseError(input: HTMLInputElement) {
  input.removeAttribute("invalid");

  if (Validation.removeError) {
    Validation.removeError(input);
  } else {
    const id = `${input.id || idifyName(input.name)}-error`;
    const errorDiv = document.getElementById(id);

    if (Validation.inputClass) {
      input.classList.remove(Validation.inputClass);
    }

    errorDiv?.remove();
  }

  input.removeEventListener("input", cleanup, true);
}

export function writeError(input: HTMLInputElement, message: string, invalid: string | undefined) {
  input.setAttribute("invalid", invalid || "");

  if (Validation.renderError) {
    Validation.renderError(input, message);
  } else {
    const id = `${input.id || idifyName(input.name)}-error`;
    const errorDiv = document.getElementById(id);

    if (errorDiv) {
      errorDiv.innerText = message;

      return;
    }

    const span = document.createElement("span");
    span.innerText = message;
    span.id = id;

    if (Validation.errorClass) {
      span.classList.add(Validation.errorClass);
    }

    if (Validation.inputClass) {
      input.classList.add(Validation.inputClass);
    }

    input.insertAdjacentElement("afterend", span);
  }
}

export function addCleanupEventListener(input: HTMLInputElement) {
  input.addEventListener("input", cleanup, true);
}

function cleanup(event: Event) {
  if (!event.target) return;

  const input = event.target as HTMLInputElement;

  const invalidType = input.getAttribute("invalid");

  if (!invalidType) return;

  if (checkIndividualValidity(input, invalidType)) {
    eraseError(input);
  } else {
    writeError(input, input.validationMessage, invalidType);
  }
}

function checkIndividualValidity(input: HTMLInputElement, name: string) {
  input.setCustomValidity("");

  const validator = ValidationRegistry.validators.get(name);

  if (validator) {
    const attrValue = input.getAttribute(name);

    const valid = attrValue ? validator(input.value, attrValue) : validator(input.value);

    if (valid) {
      input.setCustomValidity("");
    } else {
      const message = fetchMessage(input, name);

      input.setCustomValidity(message);
    }

    return valid;
  } else {
    return checkIndividualHTML5Validity(input, name);
  }
}

const VALIDITY_METHOD_MAP = {
  required: "valueMissing",
  type: "typeMismatch",
  pattern: "patternMismatch",
  maxlength: "tooLong",
  minlength: "tooShort",
  max: "rangeOverflow",
  min: "rangeUnderflow",
};

function checkIndividualHTML5Validity(input: HTMLInputElement, name: string) {
  if (!Object.keys(VALIDITY_METHOD_MAP).includes(name)) return;

  const key = name as keyof typeof VALIDITY_METHOD_MAP;

  const validity = input.validity;

  const method = VALIDITY_METHOD_MAP[key];

  const valid = !validity[method as keyof typeof validity];

  if (valid) {
    if (input.hasAttribute(`${name}-message`)) {
      input.setCustomValidity(input.getAttribute(`${name}-message`)!);
    } else if (ValidationRegistry.messages.get(name)) {
      const maybeMessage = ValidationRegistry.messages.get(name);
      let message = maybeMessage;

      if (typeof maybeMessage === "function") {
        message = maybeMessage(input.value, name);
      }

      input.setCustomValidity(message as string);
    }
  }

  return valid;
}

function fetchMessage(input: HTMLInputElement, name: string) {
  const maybeMessage = ValidationRegistry.messages.get(name);
  let message = maybeMessage;

  if (typeof maybeMessage === "function") {
    message = maybeMessage(input.value, name);
  }

  return input.getAttribute(`${name}-message`) || (message as string | undefined) || "This field is invalid";
}

function idifyName(name: string) {
  return name.replace(/\[|\]/g, "-").replace(/-$/, "");
}
