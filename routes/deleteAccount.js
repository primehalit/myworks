// routes>deleteAccount.js
const express = require('express');
const router = express.Router();

router.get('/delete-account', (req, res) => {
  res.render('deleteAccount'); // EJS şablonunu render et
});

module.exports = router;
