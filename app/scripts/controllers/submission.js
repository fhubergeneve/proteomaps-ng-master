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
function ShowMore() {
    var x = document.getElementById("ExpertParameters");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
    var button = document.getElementById("moreparameters");
    button.value = (button.value == "More Parameters") ? "Less Parameters" : "More Parameters";
}

/*global angular */
(function () {
    'use strict';
	/**
	 * @ngdoc controller
	 * @name vikmApp.controller:SubmissionCtrl
	 * @description
	 * # initController to reset localStorage
	 * # gets User. Location to setnewpassword if 'is_password_reset' = Y
	 * Controller of the vikmApp
	 */

    angular
        .module('vikmApp')
        .controller('SubmissionCtrl', SubmissionCtrl);

    SubmissionCtrl.$inject = ['$location', 'toastr','siteTitle','$http', 'Upload', 'Restangular', '$scope', '_'];
    function SubmissionCtrl($location, toastr, siteTitle, $http, Upload, Restangular, $scope, _) {
        var vm = this;
        vm.siteTitle = siteTitle.name;
        vm.nr_edges = 8;
        vm.epsilon = 0.0000000001;
        vm.ethreshold = 0.05;
        vm.exactmax = 5;
        vm.radiobuttons = {normalization:{currentVal:'no'}, showunknown:{currentVal:'no'}};

        vm.setRadiobuttons=function(variable, value){
            variable.currentVal = value;
        };

        vm.use_trash = true;
        vm.status = {};

        vm.selectedTreeFileName = "No tree file chosen";
        vm.selectedDataFileName = "No data file chosen";

        //vm.selectedFileName = "No file chosen";


        /* Retrieve all available tree files - used in select*/
        Restangular.one('get-trees').customGET().then(function(res) {
            $scope.availabletrees = Object.values(res.plain());
        });

        /* When a tree file is selected, makes a request to load it*/
        $scope.LoadSelectedTree = function(mySelect) {
            Restangular.one('load-tree/' + mySelect).withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
                var treefilename = mySelect;
                var file = new File([res], treefilename, { type: 'text/plain'});
                vm.treefileData = file;
                vm.selectedTreeFileName = treefilename;
            })
        }



    /**
     * @ngdoc function
     * @name vikmApp.controller:SubmissionCtrl:downloadSampleFasta
     * @description
     * download the sample FASTA file
     */
    vm.downloadSampleTree = function() {
        Restangular.one('test-tree').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
            var file = new Blob([res], { type: 'text/plain' });
            saveAs(file, 'test_tree.txt');
        });
    };

    vm.downloadSampleData = function() {
        Restangular.one('test-data').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
            var file = new Blob([res], { type: 'text/plain' });
            saveAs(file, 'test_data.txt');
        });
    };


    /**
     * @ngdoc function
     * @name vikmApp.controller:SubmissionCtrl:submitSampleFasta
     * @description
     * submit the sample FASTA file
     */
    vm.submitSampleTree = function() {
        Restangular.one('test-tree').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
            var testFileName = 'test.tree';
            var file = new File([res], testFileName, { type: 'text/plain'});
            vm.treefileData = file;
            vm.selectedTreeFileName = testFileName;
        });
    };

    vm.submitSampleData = function() {
        Restangular.one('test-data').withHttpConfig({responseType: 'blob'}).customGET().then(function(res) {
            var testFileName = 'test.data';
            var file = new File([res], testFileName, { type: 'text/plain'});
            vm.datafileData = file;
            vm.selectedDataFileName = testFileName;
        });
    };

    vm.clickBrowseTree = function(){
        $("#treefile").click();
    };

    vm.clickBrowseData = function(){
        $("#datafile").click();
    };

	/**
	 * @ngdoc function
	 * @name vikmApp.controller:SubmissionCtrl:upload
	 * @description
	 * upload the data to the backend
	 */
		vm.sendToBackend = function() {

            // prepare the form data
            var formData = new FormData();

            formData.append('treefile', vm.treefileData);
            formData.append('datafile', vm.datafileData);

            loadingMessage(true);
            formData.append('nr_edges', vm.nr_edges);
            formData.append('epsilon', vm.epsilon);
            formData.append('ethreshold', vm.ethreshold);
            formData.append('exactmax', vm.exactmax);
            formData.append('normalization', (vm.radiobuttons.normalization.currentVal == "no" ? "False" : "True"));
            formData.append('showunknown', vm.radiobuttons.showunknown.currentVal == "no" ? "False" : "True");


			var backendCall = Restangular.all('treemap').withHttpConfig({transformRequest: angular.identity})
				.customPOST(formData, '', undefined, {'Content-Type': undefined});


			backendCall.then(function(data){
                loadingMessage(false);
                console.log("in there");
                console.log(data);
                $location.path('/results/' + data.result_id);
			}, function(response){
                console.log("Error with status code", response);
                loadingMessage(false);
			});

		};


        /**
         * check if the peptide sequences provided are OK and format them correctly by converting them to FASTA
         * @param pepSeq
         * @returns {*}
         */

        function checkAndFormatPepSeqs(pepSeq, core_length){
            var allLinesList = pepSeq.split("\n");

            // remove all FASTA headers
            var pepList = _.filter(allLinesList, function(p){ return p.charAt(0) != ">";});

            // remove empty lines
            var pepList2 = _.filter(pepList, function(p){ return p != ""; });

            // check that the sequences correspond to the given core length
            if(! _.some(pepList2, function(p){ return p.length == core_length; })){
                return {isOK: false, errorMessage: "<strong>PEPTIDE SEQUENCE ERROR</strong><br>Peptide sequences have to correspond to the given core length."};
            }

            // add a FASTA header to all sequences
            var fastaList = _.map(pepList2, function(p, i){ return ">" + i + "\n" + p; });

            return {isOk: true, fastaSeqs: fastaList.join("\n")};
        }

	/**
	 * @ngdoc function
	 * @name vikmApp.controller:SubmissionCtrl:getFiles
	 * @description
	 * upload the data to the backend
	 */
		vm.uploadTreeFile = function($file) {
            vm.selectedTreeFileName = $file.name;
			vm.treefileData = $file;
		};

        vm.uploadDataFile = function($file) {
            vm.selectedDataFileName = $file.name;
            vm.datafileData = $file;
        };

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

	}


})();
