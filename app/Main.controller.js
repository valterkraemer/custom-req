var endpoint;

(function() {
  'use strict';

  angular
    .module('app', [])
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$http', '$filter'];

  function MainCtrl($http, $filter) {
    var vm = this;

    vm.token = localStorage.getItem('token');
    vm.loggedInUsers = JSON.parse(localStorage.getItem('loggedInUsers')) || [];
    if (vm.loggedInUsers.length) {
      vm.activeUser = vm.loggedInUsers[0];
    }

    vm.url = "http://localhost:9000/api/users/me";
    vm.method = 'GET';
    vm.data = '';


    vm.tokenChanged = tokenChanged;
    vm.send = send;
    vm.signIn = signIn;
    vm.removeUser = removeUser;
    vm.reindent = reindent;
    vm.responses = [];
    vm.activeResponse = 0;

    function tokenChanged() {
      localStorage.setItem('token', vm.token);
    }

    function send() {

      var data;

      if (vm.data) {
        data = JSON.parse(vm.data);
      }

      $http({
        method: vm.method,
        url: vm.url,
        data: data,
        headers: {
          'Authorization': 'Bearer ' + vm.activeUser.token
        }
      }).then(function(response) {
        console.log(response.data);

        response.timestamp = new Date();
        vm.responses.unshift(response);
        vm.activeResponse = 0;
      }, function(response) {
        console.error(response);

        response.timestamp = new Date();
        response.error = true;
        vm.responses.unshift(response);
        vm.activeResponse = 0;
      });
    }

    function signIn(email, password) {
      $http({
        method: 'POST',
        url: 'http://localhost:9000/auth/local',
        data: {
          email: email,
          password: password
        }
      }).then(function(response) {
        vm.loggedInUsers.unshift(response.data);
        localStorage.setItem('loggedInUsers', JSON.stringify(vm.loggedInUsers));
        vm.activeUser = response.data;
      }, function(response) {
        console.error(response);

        response.timestamp = new Date();
        response.error = true;
        vm.responses.unshift(response);
        vm.activeResponse = 0;
      });
    }

    function removeUser(item) {
      vm.loggedInUsers.splice(vm.loggedInUsers.indexOf(item), 1);
      localStorage.setItem('loggedInUsers', JSON.stringify(vm.loggedInUsers));
    }

    function reindent() {
      vm.data = JSON.stringify(JSON.parse(vm.data), null, 4);
    }

  }
})();
