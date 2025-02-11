const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database/database"); // Import the database connection
const contactRoutes = require("./routes/contactRoutes"); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use contact routes
app.use("/contacts", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
