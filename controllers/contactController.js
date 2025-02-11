const sqlite3 = require("sqlite3").verbose();
const { validationResult } = require("express-validator");
const db = new sqlite3.Database("./database/contacts.db");

// Get all contacts
exports.getAllContacts = (req, res) => {
    db.all("SELECT * FROM contacts", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Get a single contact by ID
exports.getContactById = (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM contacts WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Contact not found" });
    res.json(row);
  });
};

// Create a new contact (with validation)
exports.createContact = (req, res) => {
    const { name, email, phone, address } = req.body;

    // Check for missing fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!phone) missingFields.push("phone");

    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing fields: ${missingFields.join(", ")}` });
    }

    // Check if email or phone already exists
    db.get(
        "SELECT email, phone FROM contacts WHERE email = ? OR phone = ?",
        [email, phone],
        (err, existingContact) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (existingContact) {
                if (existingContact.email === email) {
                    return res.status(400).json({ error: "Email already exists" });
                }
                if (existingContact.phone === phone) {
                    return res.status(400).json({ error: "Phone number already exists" });
                }
            } else {
                // Insert new contact
                db.run(
                    "INSERT INTO contacts (name, email, phone, address) VALUES (?, ?, ?, ?)",
                    [name, email, phone, address || ""],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: "Database insertion error" });
                        }
                        res.status(201).json({
                            id: this.lastID,
                            name,
                            email,
                            phone,
                            address: address || "",
                        });
                    }
                );
            }
        }
    );
};



// Update an existing contact
exports.updateContact = (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    // Check for missing fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!phone) missingFields.push("phone");

    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing fields: ${missingFields.join(", ")}` });
    }

    // Check if the contact exists
    db.get("SELECT * FROM contacts WHERE id = ?", [id], (err, contact) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }

        // Check if the new email or phone already exists in another contact
        db.get(
            "SELECT * FROM contacts WHERE (email = ? OR phone = ?) AND id != ?",
            [email, phone, id],
            (err, existingContact) => {
                if (err) {
                    return res.status(500).json({ error: "Database error" });
                }
                if (existingContact) {
                    if (existingContact.email === email) {
                        return res.status(400).json({ error: "Email already exists" });
                    }
                    if (existingContact.phone === phone) {
                        return res.status(400).json({ error: "Phone number already exists" });
                    }
                } else {
                    // Proceed with the update
                    db.run(
                        "UPDATE contacts SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
                        [name, email, phone, address || "", id],
                        function (err) {
                            if (err) {
                                return res.status(500).json({ error: "Database update error" });
                            }
                            res.json({ id, name, email, phone, address: address || "" });
                        }
                    );
                }
            }
        );
    });
};


// Delete a contact
exports.deleteContact = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM contacts WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Contact not found" });
    res.json({ message: "Contact deleted successfully" });
  });
};






