const router = require('express').Router();

router.get('/', (req, res) => {

  res.render('offline', {
    layout: 'main'
  })
})

router.post('/', (req, res) => {

  res.render('offline', {
    layout: 'main'
  })
})
module.exports = router;
