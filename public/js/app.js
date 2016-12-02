
angular.module('app', ['ngRoute', 'ngMap'])
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
			.when("/register", {
                controller: "registerController",
				templateUrl: "register.html"
            })
			.when("/account", {
                controller: "accountController",
				templateUrl: "user.html"
            })
			.when("/map", {
                controller: "mapController",
				templateUrl: "map.html"
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
                    //alert("Error finding contacts.");
                });
        }
        this.createContact = function(contact) {
            return $http.post("/contacts", contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    //alert("Error creating contact.");
                });
        }
        this.getContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    //alert("Error finding this contact.");
                });
        }
        this.editContact = function(contact) {
            var url = "/contacts/" + contact._id;
            console.log(contact._id);
            return $http.put(url, contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    //alert("Error editing this contact.");
                    console.log(response);
                });
        }
        this.deleteContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    //alert("Error deleting this contact.");
                    console.log(response);
                });
        }
    })
	.config(function ($httpProvider) {
	  $httpProvider.interceptors.push('AuthInterceptor');
	})
	.constant('AUTH_EVENTS', {
	  notAuthenticated: 'auth-not-authenticated',
	})
	.service('AuthService', function($q, $http) {
	  var LOCAL_TOKEN_KEY = 'devdacticIsAwesome';
	  var isAuthenticated = false;
	  var authToken;
	  var name = '';
	  function loadUserCredentials() {
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		name = window.localStorage.getItem(name);
		if (token) {
		  useCredentials(token);
		}
	  }
	 
	  function storeUserCredentials(token,n) {
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		window.localStorage.setItem(name, n);
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
		window.localStorage.removeItem(name);
	  }
	 
	  var register = function(user) {
		return $q(function(resolve, reject) {
		  $http.post('/signup', user).then(function(result) {
			if (result.data.success) {
			  resolve(result.data.msg);
			  alert("Logged In.");
			} else {
			  reject(result.data.msg);
			  alert("Error with Login");
			}
		  });
		});
	  };
	 
	  var login = function(user) {
		return $q(function(resolve, reject) {
		  $http.post('/authenticate', user).then(function(result) {
			if (result.data.success) {
			  storeUserCredentials(result.data.token, user.name);
			  resolve(result.data.msg);
			  console.log("WIN " + user.name);
			} else {
			  reject(result.data.msg);
			  console.log("FAIL: " + result.data.msg);
			}
		  });
		});
	  };
	  var save = function(user){
		  console.log("trying ot save");
		return $q(function(resolve, reject) {
		  $http.post('/changeinfo', user).then(function(result) {
			if (result.data.success) {
			  resolve(result.data.msg);
			  alert("Logged In.");
			} else {
			  reject(result.data.msg);
			  alert("Error with Login");
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
		save: save,
		isAuthenticated: isAuthenticated,
		name, name
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
    .controller("ListController", function(contacts, $scope, AuthService) {
        $scope.contacts = contacts.data;
    })
	.controller("mapController", function($scope, AuthService, NgMap) {
		$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyA7J9VyS6H8Y5GYAWn7_WyyugqhHuPeoYU";
        NgMap.getMap().then(function(map) {
		console.log(map.getCenter());
		console.log('markers', map.markers);
		console.log('shapes', map.shapes);
	    });
    })
	.controller("accountController", function($scope, AuthService, $http, $window,$q, $location) {
        $scope.name;
		$scope.newpassword = 0;
		var request = $http.get('/memberinfo').then(function(result) {
		  $scope.memberinfo = result.data.msg;
		  //console.log(result.data.user.name);
		});
		$scope.user = {
				name: AuthService.name,
				password: ''
			}
		//console.log($scope.user);
		$scope.edit = false;
		$scope.change = function(){
			$scope.edit = true;
		}
		$scope.back = function(){
			$scope.edit = false;
		}
		$scope.save = function(){
			
			console.log("USER STUFF " + $scope.user.password);
			//if($scope.newpassword = $scope.userObj.password){
				AuthService.save($scope.user)
				.then(function(msg) {
				  $window.alert("New Password Saved");
				  $location.path("/account");
				}, function(errMsg) {
				  $window.alert(errMsg);
				});
				$window.alert("New Password Saved");
				  $location.path("/");
			//}
			//else $window.alert("Old password does not match");
		}
    })
	.controller("navController", function($scope, $window, AuthService) {
		$scope.$root.loggedIn = AuthService.isAuthenticated;
		//console.log($scope.$root.loggedIn);
		$scope.logOut = function(){
			AuthService.logout();
			console.log(AuthService.isAuthenticated);
			$window.location.reload();
		}
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
		}
		$scope.back = function() {
            $location.path("#/");
        }
        $scope.signup = function () {
			AuthService.register($scope.user)
			.then(function(msg) {
			  $location.path("/");
			}, function(errMsg) {
			  console.log(errMsg);
			});

		};
    })
	.controller("loginController", function($scope, $location, $window, AuthService) {
        $scope.back = function() {
            $location.path("#/");
        }
		$scope.user = {
			name: '',
			password: ''
		  };
        $scope.login = function() {
			AuthService.login($scope.user).then(function(msg) {
			  $location.path("#/");
			  console.log("LOGGED IN");
			  $window.alert("Logged In");
			  $scope.$root.loggedIn = true;
			}, function(errMsg) {
			  //$location.path("#/");
			  console.log("NOT LOGGED IN");
			  $window.alert("Error Logging In");
			});
			//$window.location.reload();
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
	