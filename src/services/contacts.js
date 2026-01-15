import { Contact } from '../db/models/contact.js';

export function getAllContacts() {
  return Contact.find();
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
