import {
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export function FormikTextField({ formik, name, label, ...otherProps }) {
  return (
    <TextField
      id={name}
      name={name}
      label={label}
      value={formik.values[name]}
      onChange={formik.handleChange}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      {...otherProps}
    />
  );
}

export function FormikCheckbox({ formik, name, label }) {
  return (
    <FormControlLabel
      control={<Checkbox checked={formik.values[name]} />}
      label={label}
      name={name}
      onChange={formik.handleChange}
    />
  );
}

export function FormikSelect({ formik, name, label, values }) {
  return (
    <FormControl sx={{ minWidth: 250 }}>
      <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-select-label`}
        id={`${name}-select`}
        label={label}
        onChange={formik.handleChange}
        inputProps={{
          name: { name },
        }}
      >
        {values.map((value) => (
          <MenuItem value={value}>{value}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
