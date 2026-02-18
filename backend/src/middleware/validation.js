import { body, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      status: "error",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  };
};

// Validation rules
export const authValidation = {
  register: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage("Password must contain at least one letter and one number"),
    body("phone")
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/)
      .withMessage("Please enter a valid phone number"),
    body("role")
      .isIn(["patient", "doctor", "pharmacy"])
      .withMessage("Invalid role"),
  ],
  login: [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

export const appointmentValidation = {
  book: [
    body("doctorId").isMongoId().withMessage("Invalid doctor ID"),
    body("date").isISO8601().withMessage("Invalid date format").toDate(),
    body("startTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Invalid time format"),
    body("mode")
      .isIn(["clinic", "home", "online"])
      .withMessage("Invalid consultation mode"),
    body("problem.description")
      .notEmpty()
      .withMessage("Problem description is required")
      .isLength({ max: 1000 })
      .withMessage("Description too long"),
  ],
};
