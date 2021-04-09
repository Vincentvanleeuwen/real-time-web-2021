const router = require('express').Router();

router.get('/', (req, res) => {

  res.redirect('/')

});

router.post('/', (req, res) => {

  res.redirect('/');

});
module.exports = router;
