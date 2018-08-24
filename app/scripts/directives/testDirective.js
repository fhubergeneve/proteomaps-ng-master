/*global angular*/
(function(){
  'use strict';

  /**
   * @ngdoc directive
   * @name vikmApp.directive:testDirective
   * @description just an example
   */
  angular.module('vikmApp')
    .directive('testDirective',testDirective);

  testDirective.$digest = [];
  function testDirective() {
    return {
      restrict: "E",
      templateUrl: 'scripts/directives/testDirective.html',
      scope: { testData:"=" },
      link: function link($scope, $element){
        
        // we get the data here
        console.log($scope.testData);

        // now let's select the div "test-directive" defined in testDirective.html
        var svg = d3.select("#test-directive")
                    .append("svg")
                    .attr("width", 400)
                    .attr("height", 50)

        svg.append("g")
          .append("text")
          .attr("x", 0)
          .attr("y", 20)
          .text("Yeah, test-directive is working. Your application title is " + $scope.testData)

      }
    };
  }

})();
