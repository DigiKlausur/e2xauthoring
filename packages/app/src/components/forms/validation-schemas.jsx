import * as yup from "yup";

export const baseSchema = yup.object({
  name: yup
    .string("Enter the name")
    .required()
    .min(3, "Name should have at least 3 characters")
    .matches(
      /^[A-Za-z\d]+[\w-]*$/,
      'Name can only consist of letters, digits, "-" and "_"!'
    ),
});
