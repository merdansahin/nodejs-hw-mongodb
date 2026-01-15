import { Contact } from '../db/models/contact.js';

export function getAllContacts() {
  return Contact.find();
}

export function getContactById(contactId) {
  return Contact.findById(contactId);
}
