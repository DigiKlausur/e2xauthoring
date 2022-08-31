const nameRegex = /^[A-Za-z\d]+[\w-]*$/;

export const isValidName = (name, names = []) => {
  return nameRegex.test(name) && !names.includes(name);
};
