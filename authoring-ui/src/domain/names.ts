// Mirrors BaseManager.is_valid_name in e2xauthoring/managers/base.py. Names
// become directory and notebook names, so the backend rejects anything else.
const namePattern = /^[A-Za-z\d]+[\w-]*$/;

const minLength = 3;

/** Returns the validation message for a name, or null if it is valid. */
export function validateName(name: string): string | null {
  if (name.length === 0) return "Enter a name.";
  if (name.length < minLength)
    return `The name needs at least ${minLength} characters.`;
  if (!namePattern.test(name))
    return "Use only letters, digits, “-” and “_”, and start with a letter or digit.";
  return null;
}
