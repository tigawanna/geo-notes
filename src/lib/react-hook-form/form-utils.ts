// Utility function to extract error messages from React Hook Form errors
export function extractErrorMessages(errors: any, prefix = ""): string[] {
  const errorMessages: string[] = [];

  const extractErrors = (obj: any, currentPrefix = "") => {
    Object.keys(obj).forEach((key) => {
      if (obj[key]?.message) {
        const fieldName = currentPrefix ? `${currentPrefix}${key}` : key;
        errorMessages.push(`${fieldName}: ${obj[key].message}`);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        extractErrors(obj[key], `${currentPrefix}${key}.`);
      }
    });
  };

  extractErrors(errors, prefix);
  return errorMessages;
}

// Utility function to check if form has errors and was submitted
export function hasFormErrors(formState: any): boolean {
  return Object.keys(formState.errors).length > 0 && formState.isSubmitted;
}
