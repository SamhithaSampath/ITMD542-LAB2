const express = require('express');
const router = express.Router();
const contactsRepository = require('../repositories/contactsRepository');
const Contact = require('../models/contact');
const sanitizeHtml = require('sanitize-html');

// Validation function to check if required fields are present
function validateContactData(data) {
  const { firstName, lastName } = data;
  return !(!firstName || !lastName);
}

// Sanitize user input
function sanitizeContactData(data) {
  return {
    firstName: sanitizeHtml(data.firstName),
    lastName: sanitizeHtml(data.lastName),
    emailAddress: sanitizeHtml(data.emailAddress),
    notes: sanitizeHtml(data.notes),
  };
}

// Route to list all contacts
router.get('/', (req, res) => {
  try {
    const contacts = contactsRepository.getAllContacts();
    res.render('contacts/index', { contacts, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to render a form for creating a new contact
router.get('/new', (req, res) => {
  res.render('contacts/new');
});


// Route to handle creating a new contact
router.post('/', (req, res) => {
  try {
    const { firstName, lastName, emailAddress, notes } = req.body;

    // Validate the form data
    if (!validateContactData(req.body)) {
      // Display error message and render the form again
      return res.render('contacts/new', { errorMessage: 'Please fill in all required fields.' });
    }

    // Sanitize user input
    const sanitizedData = sanitizeContactData(req.body);

    const newContact = new Contact(sanitizedData.firstName, sanitizedData.lastName, sanitizedData.emailAddress, sanitizedData.notes);

    // Attempt to create the contact
    const createdContact = contactsRepository.createContact(newContact);

    if (!createdContact) {
      // Handle the case where the contact creation fails
      return res.status(500).send('Failed to create contact');
    }

    res.redirect('/contacts');
  } catch (error) {
    // Handle unexpected errors
    console.error('Error creating contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to view a single contact
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const contact = contactsRepository.getContactById(id);

    if (!contact) {
      // Handle the case where the contact is not found
      res.status(404).send('Contact not found');
      return;
    }

    res.render('contacts/show', { contact, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to render a form for editing an existing contact
router.get('/:id/edit', (req, res) => {
  try {
    const { id } = req.params;
    const contact = contactsRepository.getContactById(id);

    if (!contact) {
      // Handle the case where the contact is not found
      res.status(404).send('Contact not found');
      return;
    }

    res.render('contacts/edit', { contact, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving contact for editing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle updating an existing contact
router.post('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, emailAddress, notes } = req.body;

    // Validate the form data
    if (!validateContactData(req.body)) {
      // Display error message and render the form again
      return res.render('contacts/edit', { errorMessage: 'Please fill in all required fields.' });
    }

    // Sanitize user input
    const sanitizedData = sanitizeContactData(req.body);

    // Move this line below the validation check
    const updatedContact = new Contact(sanitizedData.firstName, sanitizedData.lastName, sanitizedData.emailAddress, sanitizedData.notes);
    updatedContact.id = id;

    // Attempt to update the contact
    const success = contactsRepository.updateContact(updatedContact);

    if (!success) {
      // Handle the case where the contact update fails
      return res.status(500).send('Failed to update contact');
    }

    res.redirect(`/contacts/${id}`);
  } catch (error) {
    // Handle unexpected errors
    console.error('Error updating contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle deleting a contact
router.post('/:id/delete', (req, res) => {
  try {
    const { id } = req.params;

    // Attempt to delete the contact
    const success = contactsRepository.deleteContact(id);

    if (!success) {
      // Handle the case where the contact deletion fails
      res.status(500).send('Failed to delete contact');
      return;
    }

    res.redirect('/contacts');
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle viewing a dynamically generated contact
router.get('/generated/:id', (req, res) => {
  try {
    // Get the dynamically generated ID from the URL
    const dynamicId = req.params.id;

    // Logic to fetch the dynamically generated contact
    const generatedContact = contactsRepository.getContactById(dynamicId);

    if (!generatedContact) {
      // Handle the case where the contact is not found
      res.status(404).send('Generated Contact not found');
      return;
    }

    res.render('contacts/show', { contact: generatedContact, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving generated contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;














