
angular.module('app', ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
				resolve: {
                    contacts: function(Contacts) {
						//console.log("CONTACTS: " + Contacts.getContacts());
                        return Contacts.getContacts();
                    }
                }
            })
            .when("/new/contact", {
                controller: "NewContactController",
                templateUrl: "contact-form.html"
            })
            .when("/contact/:contactId", {
                controller: "EditContactController",
                templateUrl: "contact.html"
            })
			.when("/login", {
                controller: "loginController",
                templateUrl: "login.html"
            })
			.when("/logout", {
                controller: "logoutController",
            })
			.when("/register", {
                controller: "registerController",
				templateUrl: "register.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Contacts", function($http) {
        this.getContacts = function() {
            return $http.get("/contacts").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding contacts.");
                });
        }
        this.createContact = function(contact) {
            return $http.post("/contacts", contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating contact.");
                });
        }
        this.getContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this contact.");
                });
        }
        this.editContact = function(contact) {
            var url = "/contacts/" + contact._id;
            console.log(contact._id);
            return $http.put(url, contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this contact.");
                    console.log(response);
                });
        }
        this.deleteContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this contact.");
                    console.log(response);
                });
        }
    })
	.config(function ($httpProvider) {
	  $httpProvider.interceptors.push('AuthInterceptor');
	})
	.constant('AUTH_EVENTS', {
	  notAuthenticated: 'auth-not-authenticated'
	})
	.service('AuthService', function($q, $http) {
	  var LOCAL_TOKEN_KEY = 'devdacticIsAwesome';
	  var isAuthenticated = false;
	  var authToken;
	 
	  function loadUserCredentials() {
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		if (token) {
		  useCredentials(token);
		}
	  }
	 
	  function storeUserCredentials(token) {
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token);
		console.log(token);
	  }
	 
	  function useCredentials(token) {
		isAuthenticated = true;
		authToken = token;
	 
		// Set the token as header for your requests!
		$http.defaults.headers.common.Authorization = authToken;
	  }
	 
	  function destroyUserCredentials() {
		authToken = undefined;
		isAuthenticated = false;
		$http.defaults.headers.common.Authorization = undefined;
		window.localStorage.removeItem(LOCAL_TOKEN_KEY);
	  }
	 
	  var register = function(user) {
		return $q(function(resolve, reject) {
		  $http.post('/signup', user).then(function(result) {
			if (result.data.success) {
			  resolve(result.data.msg);
			  console.log("WIN");
			} else {
			  reject(result.data.msg);
			  console.log("FAIL");
			}
		  });
		});
	  };
	 
	  var login = function(user) {
		return $q(function(resolve, reject) {
		  $http.post('/authenticate', user).then(function(result) {
			if (result.data.success) {
			  storeUserCredentials(result.data.token);
			  resolve(result.data.msg);
			} else {
			  reject(result.data.msg);
			}
		  });
		});
	  };
	 
	  var logout = function() {
		destroyUserCredentials();
	  };
	 
	  loadUserCredentials();
	 
	  return {
		login: login,
		register: register,
		logout: logout,
		isAuthenticated: function() {return isAuthenticated;},
	  };
	})
	 
	.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
	  return {
		responseError: function (response) {
		  $rootScope.$broadcast({
			401: AUTH_EVENTS.notAuthenticated,
		  }[response.status], response);
		  return $q.reject(response);
		}
	  };
	})
    .controller("ListController", function(contacts, $scope) {
        $scope.contacts = contacts.data;
    })
    .controller("NewContactController", function($scope, $location, Contacts) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveContact = function(contact) {
            Contacts.createContact(contact).then(function(doc) {
                var contactUrl = "/contact/" + doc.data._id;
                $location.path(contactUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
	.controller("registerController", function($scope, $location, AuthService) {
		$scope.user = {
			name: '',
			password: ''
		};
        $scope.signup = function () {

			AuthService.register($scope.user)
			.then(function(msg) {
			  $location.path("/");
			}, function(errMsg) {
			  console.log(errMsg);
			});

		};
    })
	.controller("loginController", function($scope, $location, AuthService) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.login = function () {

		  // initial values
		  $scope.error = false;
		  $scope.disabled = true;

		  // call login from service
		  AuthService.login($scope.loginForm.username, $scope.loginForm.password)
			// handle success
			.then(function () {
			  $location.path('/');
			  $scope.disabled = false;
			  $scope.loginForm = {};
			})
			// handle error
			.catch(function () {
			  $scope.error = true;
			  $scope.errorMessage = "Invalid username and/or password";
			  $scope.disabled = false;
			  $scope.loginForm = {};
			});

		};
    })
	.controller("logoutController", function($scope, $location, AuthService) {
        $scope.logout = function () {

		  // call logout from service
		  AuthService.logout()
			.then(function () {
			  $location.path('/login');
			});

		};
    })
    .controller("EditContactController", function($scope, $routeParams, Contacts) {
        Contacts.getContact($routeParams.contactId).then(function(doc) {
            $scope.contact = doc.data;
        }, function(response) {
            alert(response);
        })

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.contactFormUrl = "contact-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.saveContact = function(contact) {
            Contacts.editContact(contact);
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.deleteContact = function(contactId) {
            Contacts.deleteContact(contactId);
        }
    })
	