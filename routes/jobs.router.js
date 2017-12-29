var express = require('express');
var router = express.Router();
const { exec } = require('child_process');

/* GET users listing. */
router.get('/', function(req, res, next) {

  let jobs = []

  
  exec('pm2 jlist', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    let processList = JSON.parse(stdout);

    jobs = jobs.concat(processList)
    console.log(JSON.stringify(processList,null,2))
    res.send(jobs);
  });

});

router.get('/:jobId/logs', function(req, res, next) {

  let jobs = []

  
  exec('pm2 jlist', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    let processList = JSON.parse(stdout);

    jobs = jobs.concat(processList)
    console.log(JSON.stringify(processList,null,2))
    res.send(jobs);
  });

});





router.put('/:jobId/stop', function(req, res, next) {
  exec('pm2 stop '+req.params.jobId, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(400).send({error : "An error has occurred"});
    }
    res.send({status : true});
  });  
});

router.put('/:jobId/start', function(req, res, next) {
  exec('pm2 start '+req.params.jobId, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(400).send({error : "An error has occurred"});
    }
    res.send({status : true});
  });  
});

router.put('/:jobId/delete', function(req, res, next) {
  exec('pm2 delete '+req.params.jobId, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(400).send({error : "An error has occurred"});
    }
    res.send({status : true});
  });  
});

module.exports = router;
