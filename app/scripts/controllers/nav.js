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
	 * @ngdoc controller
	 * @name vikmApp.controller:NavCtrl
	 * @description
	 * # NavCtrl
	 * Controller of the vikmApp
	 * Used to display user name and list projects in navbar.
	 */
	angular.module('vikmApp')
	.controller('NavCtrl', NavCtrl);

	NavCtrl.$inject = ['siteTitle', 'localStorageService', '$scope', '$filter'];

	function NavCtrl(siteTitle, localStorageService, $scope, $filter){
		var vm = this;
		vm.projects = [];
		vm.setProject = setProject;
		vm.siteTitle = siteTitle.name;
		vm.currentYear = new Date().getFullYear();
		///////



	/**
	 * @ngdoc function
	 * @name vikmApp.controller:LoginCtrl:setProject
	 * @param project_id: int. id of the new current project
	 * @description
	 * # Sets the new current project. Use the Authentication service.
	 * Controller of the vikmApp
	 */

		function setProject(project_id){
			vm.projectId = project_id;
		}


	}
})();
