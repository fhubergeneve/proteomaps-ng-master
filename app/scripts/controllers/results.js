/************************ LICENCE ***************************
*     This file is part of <ViKM Vital-IT Knowledge Management web application>
*     Copyright (C) <2017> SIB Swiss Institute of Bioinformatics
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
(function () {
    'use strict';
	/**
	 * @ngdoc controller
	 * @name vikmApp.controller:ResultsCtrl
	 * @description
	 * Controller of the vikmApp
	 */

    angular
        .module('vikmApp')
        .controller('ResultsCtrl', ResultsCtrl);

    ResultsCtrl.$inject = ['$location', 'toastr','siteTitle','$http', 'Upload', 'Restangular', '_', 'ENV', '$routeParams', 'FileSaver'];
    function ResultsCtrl($location, toastr, siteTitle, $http, Upload, Restangular, _, ENV, $routeParams, FileSaver) {
        var vm = this;
		vm.siteTitle = siteTitle.name;
        vm.status = {};
        const PICTURES_PER_ROW = 4;


    /* @ngdoc function
    * @name vikmApp.controller:ResultsCtrl:groupPictures
    * @description
    * prepare data to show only certain number of pictures per row
    */
     var groupPictures = function(motifData){
        return _.mapValues(motifData, function(motif){
            var motifWithImgSrc = _.map(motif, function(m){
                var r = m;
                r.imgURL = ENV.imageURL + '/?filename=' + r.img + '&result_id=' + vm.resultId;
                return r;
            });

            return {'motifs': _.chunk(motifWithImgSrc, PICTURES_PER_ROW) };
        });
     }


    /**
     * @ngdoc function
     * @name vikmApp.controller:ResultsCtrl:downloadZip
     * @description
     * download ZIP file with results
     */
     vm.downloadZip = function() {

         Restangular.one('results/' + vm.resultId + '/zip').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
             var file = new Blob([res], { type: 'application/zip, application/octet-stream' });
             saveAs(file, vm.resultId + '.zip');
         });

     }


    /**
     * @ngdoc function
     * @name vikmApp.controller:ResultsCtrl:selectXMer
     * @param xMer
     * @description
     * change the selected x-mer
     */
     vm.selectXMer = function(xMer) {
         vm.selXMer = xMer;
         const selData = vm.xMerData[vm.selXMer];
         vm.motifData = groupPictures(selData.motifs);
         vm.showLengthDistribution = false;
     }

        /**
         * @ngdoc function
         * @name vikmApp.controller:ResultsCtrl:showLengthDistribution
         * @description
         * show the length distribution tab
         */
     vm.showLengthDistributionFunc = function(){
         console.log(vm.Datasets)
         vm.showLengthDistribution = true;
         vm.selXMer = undefined;
     }

	/**
	 * @ngdoc function
	 * @name vikmApp.controller:ResultsCtrl:sendToBackend
	 * @description
	 * get the results from the backend
	 */
    vm.sendToBackend = function() {
            loadingMessage(true);

			// prepare the form data
			var backendCall = Restangular.one('results/' + vm.resultId).get();

			backendCall.then(function(data){
			    /*vm.xMerData = data.x_mers_data;
			    vm.lengthDistData = groupPictures(data.length_dist);
			    vm.xMers = data.x_mers;
                vm.selXMer = data.default_x_mer;
                const selData = vm.xMerData[vm.selXMer]
				vm.motifData = groupPictures(selData.motifs);
				vm.resultId = data.result_id;
                vm.showLengthDistribution = false;*/
                vm.Datasets = data.Datasets;
                //console.log(vm.Datasets);
                loadingMessage(false);
			}, function(response){
                console.log("Error with status code", response.status);
                loadingMessage(false);
			});

		};

        vm.displayresults = function(){
            console.log(vm.Datasets);
            console.log("ok");
        }

        /**
         * show the loading message or errors
         * @param stat
         * @param error
         */
        function loadingMessage(stat, error) {
            var toastr_loading_parameters = {
                timeOut: 5000000,
                closeButton: false,
                iconClass: 'loading-toast-icon',
                messageClass: 'loading-toast-message',
                titleClass: 'loading-toast-title',
                allowHtml: true,
                preventOpenDuplicates: true,
                tapToDismiss: false
            };
            if (stat && !vm.status.loading_data) {
                vm.status.loading_data = true;
                vm.waitingToastr = toastr.info('<p class="text-center">Please wait, data are loading</p><p class="text-center"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i> <span class="sr-only">Loading...</span></p>', '<p class="text-center">Loading</p>', toastr_loading_parameters);
            }
            else if (!stat && vm.status.loading_data) {
                vm.status.loading_data = false;
                toastr.clear(vm.waitingToastr);
                if (error) {
                    toastr.error('Error please reload the page');
                }
            }
        }

        // if resultId is passed by routePath
        if ($routeParams.result_id) {
            vm.resultId = $routeParams.result_id;
            vm.sendToBackend();
        }

	}


})();
