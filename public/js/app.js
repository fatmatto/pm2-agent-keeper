var app = angular.module('ApioBrokerAdminUI', ['ngMaterial', 'ngMessages', 'ngRoute'])

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/html/templates/jobs.html',
      controller: 'MainController'
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

app.controller('LogsController', function($scope,$routeParams,$http) {
    
    $scope.host = $routeParams.host
    $scope.jobId = $routeParams.jobId
    
    $scope.getJobLogs = function() {

      $http({
          url: "http://"+$scope.host + '/' + $scope.jobId + '/logs',
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

  $scope.loadHosts()


})

app.controller('MainController', function($scope, $http, $mdToast, $mdDialog, $mdMenu) {
  
  $scope.jobs = []
  $scope.hosts = []

  $scope.openMenu = function($mdMenu, ev) {
    $mdMenu.open(ev)
  }

  $scope.loadHosts = function() {
    return $http.get('/api/hosts')
      .then(function(response) {
        $scope.hosts = response.data
        $scope.hosts.forEach($scope.loadJobsInHost)

      })
      .catch(function(error) {
        console.log(error)
      })
  }

  $scope.loadHosts()


  $scope.loadJobsInHost = function(host) {
    
    $http.get(host.url + '/')
      .then(function(response) {
        host.jobs = response.data
      })
      .catch(function(error) {
        console.log(error)
      })
  }



  $scope.stopJob = function(host, jobId) {
    $http({
        url: host.url + '/' + jobId + '/stop',
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

  $scope.startJob = function(host, jobId) {

    $http.put(host.url + '/' + jobId + '/start')
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

  $scope.deleteJob = function(host, jobId) {
    $http.put(host.url + '/' + jobId + '/delete')
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
    var url = window.encodeURIComponent(host.url.replace("http://",""))

    return window.location.href = '#/hosts/'+url+'/jobs/'+jobId+'/logs'
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