var express = require('express');
var router = express.Router();
const { exec } = require('child_process');

/* GET users listing. */
router.get('/', function(req, res, next) {
  let hosts = req.app.get('db').get("hosts") || []

  res.send(hosts)

});

router.post('/', function(req, res, next) {
  let db = req.app.get('db')

  let hosts = db.get("hosts") || []


  hosts.push(req.body)

  db.set("hosts",hosts)

  res.send(hosts);

});



module.exports = router;
