import Joi from "joi";

export const validate = (schema) => (req, res, next) => {
  const toValidate = {
    params: req.params,
    query: req.query,
    body: req.body
  };
  const { error, value } = schema.prefs({ abortEarly: false }).validate(toValidate);
  if (error) {
    res.status(400);
    return next(new Error(error.details.map((d) => d.message).join("; ")));
  }
  req.validated = value;
  next();
};

export const commonFiltersSchema = Joi.object({
  query: Joi.object({
    branchId: Joi.number().integer().min(1).optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(200).optional(),
    csv: Joi.boolean().truthy("true").falsy("false").optional()
  })
});
