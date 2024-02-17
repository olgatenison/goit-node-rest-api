import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contactsPath = path.join(__dirname, "../db/contacts.json");

export async function listContact() {
  const data = await fs.readFile(contactsPath);
  return JSON.parse(data);
}

export async function getContactById(contactId) {
  const contacts = await listContact();
  const result = contacts.find((el) => el.id === contactId);
  return result || null;
}

export async function addContact(data) {
  const contacts = await listContact();

  const newContact = {
    id: nanoid(),
    ...data,
  };
  contacts.push(newContact);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return newContact;
}

export async function removeContact(contactId) {
  const contacts = await listContact();

  const index = contacts.findIndex((el) => el.id === contactId);
  console.log("index", index);
  if (index === -1) {
    return { message: "Not found" };
  }

  const [result] = contacts.splice(index, 1);
  console.log("result", result);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return result;
}

export async function updContacts(contactId, data) {
  const contacts = await listContact();

  const index = contacts.findIndex((el) => el.id === contactId);
  if (index === -1) {
    return { message: "Not found" };
  }

  contacts[index] = Object.assign(contacts[index], data);

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return contacts[index];
}
