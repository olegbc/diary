var myApp = angular.module('myApp', ['ngRoute', 'ngResource', 'myAppServices']);

myApp
    .controller('insideNoteController', ['$scope', '$http', 'TodoFactory', '$routeParams',
    function($scope, $http, TodoFactory, $routeParams) {

        $scope.updateTodo = function(id) {
            //console.log($scope.edit);
            //return;
            $http.put('/api/todos/' + id, { name: $scope.edit}).success(function() {
                //alert('Todo updated');
            });
        };

        $scope.deleteTodo = function(id) {
            //console.log(id);
            //return;
            $http.delete('/api/todos/' + id)
                .success(function(data) {
                    $scope.todos = data;
                    console.log(data);
                    document.location.href = 'http://localhost:8080/notes#/';
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        $http.get('/api/todos')
            .success(function(data) {
                $scope.todos = data;
                $scope.todo = data[$routeParams.id];
                $scope.edit = data[$routeParams.id].text;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });


    }])

    .controller('mainController', ['$scope', '$http', function($scope, $http) {
        $scope.formData = {};

        $scope.insideNote = function(index){
            location.href = 'http://localhost:8080/notes#/'+index;
        };


        $http.get('/api/todos')
            .success(function(data) {
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })

        $scope.createTodo = function() {
            $http.post('/api/todos', $scope.formData)
                .success(function(data) {
                    $scope.formData = {}; // clear the form so our user is ready to enter another
                    $scope.todos = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
    }])
    .config(['$routeProvider', function ($routeProvider) {
        //console.log($httpProvider.defaults.headers);
    $routeProvider
        .when('/', {
            templateUrl: '/main.html',
            controller: 'mainController'
        })
        .when('/:id', {
            templateUrl: '/insideNote.html',
            controller: 'insideNoteController'
        })
    }]);

var myAppServices = angular.module('myAppServices', ['ngResource']);

myAppServices.factory('TodoFactory', ['$resource',
    function($resource) {
        return $resource('/api/todos/:todoId', {}, {
            update: {method:'PUT', params: {todoId: '@_id'}}
        });
    }
]);
