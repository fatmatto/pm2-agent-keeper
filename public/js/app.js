var app = angular.module('ApioBrokerAdminUI', ['ngMaterial', 'ngMessages', 'ngRoute'])


app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/html/templates/jobs.html',
      controller: 'JobsListController'
    })

  .when('/hosts/:host/jobs/:jobId/logs', {
      templateUrl: '/html/templates/logs.html',
      controller: 'LogsController'
    })
    .when('/hosts', {
      templateUrl: '/html/templates/hosts.html',
      controller: 'HostsController'
    })
})


function msToReadableTime(ms) {
  var date = new Date(ms);
  var str = '';
  str += date.getUTCDate() - 1 + " days, ";
  str += date.getUTCHours() + " hours, ";
  str += date.getUTCMinutes() + " minutes, ";
  str += date.getUTCSeconds() + " seconds, ";
  str += date.getUTCMilliseconds() + " millis";
  return str

}

function ProcessInfoController($scope, $mdDialog, job, $rootScope) {
  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };

  $scope.job = $rootScope.jobToInspect

  // Re-process uptime
  $scope.job.pm2_env.pm_uptime = msToReadableTime($scope.job.pm2_env.pm_uptime)

  // Re-process memory usage
  $scope.job.monit.memory = (($scope.job.monit.memory / 1000) / 1000).toFixed(2)+" MB"



}

app.controller('LogsController', function($scope, $routeParams, $http) {

  $scope.host = $routeParams.host
  $scope.jobId = $routeParams.jobId

  $scope.getJobLogs = function() {

    $http({
        url: "http://" + $scope.host + '/' + $scope.jobId + '/logs',
        method: 'GET'
      })
      .then(function(response) {

        $scope.logs = response.data.data
      })
      .catch(function(error) {
        console.log(error)
      })
  }
  $scope.getJobLogs()



})



/** Hosts Controller */
app.controller('HostsController', function($scope, $http) {

  $scope.hosts = []
  $scope.newHost = {
    url: 'http://example.com:8080',
    name: 'myhost'
  }
  $scope.openMenu = function($mdMenu, ev) {
    $mdMenu.open(ev)
  }



  $scope.loadHosts = function() {
    $http.get('/api/hosts')
      .then(function(response) {
        $scope.hosts = response.data

      })
      .catch(function(error) {
        console.log(error)
      })
  }

  $scope.saveHost = function() {
    $http({
        method: 'POST',
        url: '/api/hosts',
        data: $scope.newHost
      })
      .then(function(response) {
        $scope.hosts = response.data

      })
      .catch(function(error) {
        console.log(error)
      })
  }

  $scope.deleteHost = function(host) {
    $http({
      method: 'DELETE',
      url: '/api/hosts/'+host.uuid
    })
      .then(function (response) {
        $scope.hosts = response.data

      })
      .catch(function (error) {
        console.log(error)
      })
  }

  $scope.loadHosts()


})

app.controller('JobsListController', function($scope, $http, $mdToast, $mdDialog, $mdMenu, $rootScope) {

  $scope.jobs = []

  $scope.openMenu = function($mdMenu, ev) {
    $mdMenu.open(ev)
  }
  $scope.getJobInfo = function(job) {

    $rootScope.jobToInspect = job
    $scope.job_information = job

    console.log("JOBTOINSPECT",job)

    $mdDialog.show({
        locals: {
          job: $scope.job_information
        },
        controller: ProcessInfoController,
        templateUrl: '/html/templates/process_dialog.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });



  }

  $scope.loadJobs = function() {
    $http.get('/api/jobs')
    .then(function(response){
      $scope.jobs = response.data
    })
  }
  $scope.loadJobs()




  $scope.stopJob = function(job) {
    $http({
        url: job.host.url + '/' + job.pm_id + '/stop',
        method: 'PUT',
        data: {}
      })
      .then(function(response) {
        return $scope.loadJobs()
      })
      .then(function(response) {
        console.log("Jobs reloaded")
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  $scope.startJob = function(job) {

    $http.put(job.host.url + '/' + job.pm_id + '/start')
      .then(function(response) {
        return $scope.loadJobs()
      })
      .then(function(response) {
        console.log("Jobs reloaded")
      })
      .catch(function(error) {
        console.log(error)
      })
  }


  $scope.restartJob = function (job) {

    $http.put(job.host.url + '/' + job.pm_id + '/restart')
      .then(function (response) {
        return $scope.loadJobs()
      })
      .then(function (response) {
        console.log("Jobs reloaded")
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  $scope.deleteJob = function(job) {
    $http.put(job.host.url + '/' + job.pm_id + '/delete')
      .then(function(response) {
        return $scope.loadJobs()
      })
      .then(function(response) {
        console.log("Jobs reloaded")
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  $scope.getJobLogs = function(host, jobId) {
    var url = window.encodeURIComponent(host.url.replace("http://", ""))

    return window.location.href = '#/hosts/' + url + '/jobs/' + jobId + '/logs'
  }


})

app.controller('MqttController', function($scope, $http, $mdToast, $mdDialog, $mdMenu, $routeParams) {
  $routeParams.jobId = $routeParams.jobId || ''

  $scope.MQTTRequest = {
    operationType: 'GET',
    topic: '/api/' + $routeParams.jobId,
    payload: '{}'
  }
  $scope.clearMQTTRequest = function() {
    $scope.MQTTRequest = {
      operationType: 'GET',
      topic: '/api',
      payload: '{}'
    }
  }
  $scope.prepareMQTTRequest = function(g) {
    $scope.MQTTRequest = {
      operationType: 'GET',
      topic: '/api/' + g.jobId,
      payload: '{}'
    }
  }

})

app.controller('HandlerJobsController', function($scope, $http, $mdToast, $mdDialog, $mdMenu) {
  $scope.jobs = []

  $scope.openMenu = function($mdMenu, ev) {
    $mdMenu.open(ev)
  }

  $scope.loadJobs = function() {
    $http.get('/api/jobs')
      .then(function(response) {
        $scope.jobs = []
        for (var k in response.data) {
          $scope.jobs.push(response.data[k])
        }
      })
      .catch(function(error) {
        console.log(error)
      })
  }



  $scope.loadJobs()
})