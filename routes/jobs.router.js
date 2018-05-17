var express = require('express')
var router = express.Router()
const request = require('superagent')
const async = require('async')
router.get('/', function (req, res, next) {
  let hosts = req.app.get('db').get('hosts') || []

  let callbacks = hosts.map(host => {
    return function (callback) {
      request
        .get(host.url)
        .timeout({
          response: 1000, // Wait 5 seconds for the server to start sending,
          deadline: 1000 // but allow 1 minute for the file to finish loading.
        })
        .end(callback)
    }
  })

  async.parallel(callbacks, (err, results) => {
    if (err) {
      console.log(err)
    }
    var output = []
    results = results.forEach((response, index) => {
      response = response || {body: []}

      response.body.forEach(job => {
        job.host = hosts[index]

        var minute = 1000 * 60
        var hour = minute * 60
        var day = hour * 24

        var delta = Date.now() - job.pm2_env.pm_uptime

        if (delta >= day) {
          job.readable_uptime = Math.trunc(delta / day) + ' days'
        } else if (delta >= hour) {
          job.readable_uptime = Math.trunc(delta / hour) + ' hours'
        } else if (delta >= minute) {
          job.readable_uptime = Math.trunc(delta / minute) + ' minutes'
        } else {
          job.readable_uptime = Math.trunc(delta / 1000) + ' seconds'
        }
        output.push(job)
      })
    })
    return res.send(output)
  })
})

module.exports = router
