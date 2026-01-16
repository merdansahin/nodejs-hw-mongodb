import * as yup from 'yup';

const nameRule = yup.string().min(3).max(20);
const phoneRule = yup.string().min(3).max(20);
const emailRule = yup.string().email().min(3).max(20).nullable();
const favRule = yup.boolean();
const typeRule = yup.string().oneOf(['work', 'home', 'personal']);

export const createContactSchema = yup.object({
  name: nameRule.required(),
  phoneNumber: phoneRule.required(),
  email: emailRule.notRequired(),
  isFavourite: favRule.notRequired(),
  contactType: typeRule.required().default('personal'),
});

export const patchContactSchema = yup
  .object({
    name: nameRule.notRequired(),
    phoneNumber: phoneRule.notRequired(),
    email: emailRule.notRequired(),
    isFavourite: favRule.notRequired(),
    contactType: typeRule.notRequired(),
  })
  .test('at-least-one-field', 'Body must have at least one field', (value) => {
    return value && Object.keys(value).length > 0;
  });
