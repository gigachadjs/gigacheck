import { ValidationRegistry } from ".";

export function checkValidity(input: HTMLInputElement) {
  const attrs = Array.from(input.attributes);

  attrs.forEach((attr) => {
    const validator = ValidationRegistry.validators.get(attr.name);

    if (!validator) return;

    const valid = attr.value ? validator(input.value, attr.value) : validator(input.value);

    if (valid) {
      input.setCustomValidity("");
    } else {
      const message =
        input.getAttribute(`${attr.name}-message`) ||
        ValidationRegistry.messages.get(attr.name) ||
        "This field is invalid";

      input.setCustomValidity(message);
    }
  });

  if (!input.validity.valid) return checkHTML5Validity(input);
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

    return;
  }

  if (ValidationRegistry.messages.get(type)) {
    input.setCustomValidity(ValidationRegistry.messages.get(type)!);

    return;
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

  checkValidity(input);

  if (input.validity.valid) {
    eraseError(input);
  } else {
    writeError(input, input.validationMessage || "This field is invalid.");
  }
}

function idifyName(name: string) {
  return name.replace(/\[|\]/g, "-").replace(/-$/, "");
}
