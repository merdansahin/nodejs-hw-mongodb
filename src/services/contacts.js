import { Contact } from '../db/models/contact.js';

export async function getContacts({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
}) {
  const limit = Number(perPage) || 10;
  const skip = (Number(page) - 1) * limit;

  const query = { userId, ...filter };
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const totalItems = await Contact.countDocuments(filter);

  const data = await Contact.find(filter).sort(sort).skip(skip).limit(limit);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    data,
    page: Number(page),
    perPage: limit,
    totalItems,
    totalPages,
    hasPreviousPage: Number(page) > 1,
    hasNextPage: Number(page) < totalPages,
  };
}

export function getContactById(contactId) {
  return Contact.findById(contactId);
}
export const createContact = async (payload) => {
  return Contact.create(payload);
};

export const patchContact = async (id, payload) => {
  return Contact.findByIdAndUpdate(id, payload, { new: true });
};

export const deleteContact = async (id) => {
  return Contact.findByIdAndDelete(id);
};
