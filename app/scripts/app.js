/************************ LICENCE ***************************
*     This file is part of <ViKM Vital-IT Knowledge Management web application>
*     Copyright (C) <2016> SIB Swiss Institute of Bioinformatics
*
*     This program is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as
*     published by the Free Software Foundation, either version 3 of the
*     License, or (at your option) any later version.
*
*     This program is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>
*
*****************************************************************/

/*global angular */
(function(){
	'use strict';

	/**
	* @ngdoc overview
	* @name vikmApp
	* @description
	* # vikmApp
	*
	* Main module of the application.
	*/
	angular
	.module('vikmApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch',
		'libs',
		'toastr',
		'restangular',
		'config',
		'LocalStorageModule',
		'smart-table',
		'ui.tinymce',
		'angularFileUpload',
		'ui.bootstrap',
		'angular.filter',
		'angular-clipboard',
		'ui.select',
		'ngFileUpload',
		'ngFileSaver'
		// 'Vikm_Visualization'
	])

	.constant('siteTitle',{name: 'ViTrIol'})

	.config(configRoute)
	.config(exceptionConfig)
	.config(restangularProvider)
	.config(LocalStorageProvider)
	.config(locationProvider)
	.config(toastrProvider)
	.run(run)
	.run(restangularInterceptor);

	/**
	* @ngdoc overview
	* @name configRoute
	* @description
	* # the routing of the application.
	* # controllerAs enables to access scope variable as vm.variable instead of $scope.variable
	* # PAGEKEY: using to activate the nav tabs in the navbar. See routeChangeSuccess
	*
	* Routing of the application
	*/
	configRoute.$inject = ['$routeProvider'];
	function configRoute($routeProvider) {
		$routeProvider
		.when('/submission', {
			templateUrl: 'views/submission.html',
			controller: 'SubmissionCtrl',
			controllerAs: 'vm',
			pageKey: 'UPLOAD'

		})
		.when('/results', {
			templateUrl: 'views/results.html',
			controller: 'ResultsCtrl',
			controllerAs: 'vm',
			pageKey: 'RESULTS'

		})
		.when('/results/:result_id', {
			templateUrl: 'views/results.html',
			controller: 'ResultsCtrl',
			controllerAs: 'vm',
			pageKey: 'RESULTS'

		})
		.when('/documentation', {
			templateUrl: 'views/documentation.html',
			pageKey: 'DOC'

		})
		.otherwise({
			redirectTo: '/submission'
		});
	}



	/**
	* @ngdoc overview
	* @name exceptionConfig
	* @description
	* # handling of the javascript Exceptions, usually thrown by angular
	* # actually, only sends to console.
	*
	* Exception handler
	*/

	exceptionConfig.$inject = ['$provide'];

	function exceptionConfig($provide) {
		$provide.decorator('$exceptionHandler', extendExceptionHandler);
	}
	extendExceptionHandler.$inject = ['$delegate','$injector','$log'];
	function extendExceptionHandler($delegate,$injector,$log) {
		return function(exception, cause) {
			$delegate(exception, cause);
			var errorData = {
				exception: exception,
				cause: cause
			};
			/**
			* Could add the error to a service's collection,
			* add errors to $rootScope, log errors to remote web server,
			* or log locally. Or throw hard. It is entirely up to you.
			* throw exception;
			*/
			$log.error(exception.message);
		};
	}

	/**
	* @ngdoc overview
	* @name LocalStorageProvider
	* @description
	* # setPrefix of localStorage variable
	* # setStorageType (session | local)
	* # setNotify (??)
	* LocalStorage
	*/
	LocalStorageProvider.$inject = ['localStorageServiceProvider'];
	function LocalStorageProvider(localStorageServiceProvider){
		localStorageServiceProvider
		.setPrefix('vikmApp')
		.setStorageType('sessionStorage')
		.setNotify(true, true)

	}

	/**
	* @ngdoc overview
	* @name RestangularProvider
	* @description
	* # setBaseUrl: URL of the backend. index.php of SLIM in this project
	* # setDefaultHttpFields({cache: true}): whether to cache the http queries
	* Restangular
	*/

	restangularProvider.$inject = ['RestangularProvider','ENV'];
	function restangularProvider(RestangularProvider,ENV){
		RestangularProvider.setBaseUrl(ENV.serverURL);
		// RestangularProvider.setDefaultHttpFields({cache: true});
	}

	locationProvider.$inject = ['$locationProvider'];
	function locationProvider($locationProvider){
		$locationProvider.hashPrefix('');
	}

	toastrProvider.$inject = ['toastrConfig'];
	function toastrProvider(toastrConfig){
	  angular.extend(toastrConfig, {
	    autoDismiss: false,
			allowHtml: true,
	    containerId: 'toast-container',
	    maxOpened: 5,
			closeButton: true,
	    closeHtml: '<button>&times;</button>',    
	    newestOnTop: true,
	    positionClass: 'toast-top-right',
	    preventDuplicates: false,
	    preventOpenDuplicates: true,
	    target: 'body'
	  });
	}


	/**
	* @ngdoc overview
	* @name run
	* @description
	* # gets currentUser from localStorage. If, currentUser, set default Authorization header for all http requests
	* # routeChangeStart: check access permissions using the Authorization service
	* # routeChangeSuccess: set / unset active class to nav elements (in navbar) based on PAGEKEY parameter.
	*
	* Exception handler
	*/


	run.$inject = ['$rootScope'];
	function run($rootScope) {
			$rootScope.$on("$routeChangeSuccess",
			function (angularEvent,	currentRoute) {
				var pageKey = currentRoute.pageKey;
				$(".pagekey").toggleClass("active", false);
				$(".pagekey_" + pageKey).toggleClass("active", true);
			});

		}

		// get error from Restangular (PHP) //

		restangularInterceptor.$inject = ['$window','Restangular','toastr','$log'];
		function restangularInterceptor($window,Restangular,toastr,$log){
			Restangular.setErrorInterceptor(
				function(response) {
					if (response.status == 404) {
						toastr.info("Resource not available...");
					} else if(response.status == 500) {
						$log.error(response.data);
					} else if(response.status == 501) {
						toastr.error(response.data,'ERROR');
					} else {
						toastr.warning("Response received with HTTP error code: " + response.status );
					}
					return true; // do NOT stop the promise chain
				}
			);
		}



	})();