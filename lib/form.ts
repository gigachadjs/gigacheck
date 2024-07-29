import { addCleanupEventListener, checkValidity, eraseError, writeError } from "./input";

export function initializeForm(form: HTMLFormElement) {
  form.noValidate = true;

  form.onsubmit = (event: SubmitEvent) => {
    const inputs = Array.from(form.elements)
      .filter((element) => element.tagName === "INPUT")
      .map((element) => element as HTMLInputElement)
      .filter((element) => element.type !== "hidden")
      .filter((element) => !element.disabled)
      .filter((element) => !element.readOnly);

    inputs.forEach((input) => {
      const invalid = checkValidity(input);

      const message = input.validationMessage;

      if (message) {
        writeError(input, message, invalid);

        addCleanupEventListener(input);
      } else {
        eraseError(input);
      }
    });

    const valid = inputs.every((input) => input.validity.valid);

    if (!valid) {
      event.preventDefault();
      return false;
    }
  };
}
