'use strict';

var app = angular.module('facilitation');

app.controller('AgendaCtrl', function($scope, $state, WorkshopsProvider) {

    $scope.workshops = {};

    $scope.calendar = {};
    $scope.calendar.mode = 'week';

    $scope.weekviewNormalEventTemplateUrl = "../../templates/agendaEvent.html";
    $scope.startingDayWeek = 0;//new Date().getDay();

    WorkshopsProvider.getEvents(function (events) {
        $scope.eventSource = [];
        $scope.workshops = events.data;

        events.data.forEach(function (event) {
            if(event.status != "DONE") {
                var dateStart = new Date(event.begin_at);
                var dateEnd = new Date(dateStart);
                dateEnd.setMinutes(dateStart.getMinutes() + event.duration);

                var calendarEvent = {
                    title: event.title,
                    startTime: dateStart,
                    endTime: dateEnd,
                    allDay: false
                };

                $scope.eventSource.push(calendarEvent);
            }
        });
    });

    $scope.refreshAgenda = function () {
        $state.go($state.current, {}, {reload: true});
    };

    $scope.makeCalendarClickable = function () {
        var tables = Array.from(document.getElementsByClassName("weekview-normal-event-table"));

        tables.forEach(function (table) {
            for (var i = 0; i < table.rows.length; i++) {
                for (var j = 0; j < table.rows[i].cells.length; j++) {
                    table.rows[i].cells[j].setAttribute("onclick",'location.href = \"#/tab/workshops/day/\"+('+(j-1)+');');
                }
            }
        });
    };
})

// This allows to executes a function after the rendering of the specified element
// TODO : uses a $timeout...
.directive('afterRender', ['$timeout', function ($timeout) {
    var def = {
        restrict: 'A',
        terminal: true,
        transclude: false,
        link: function (scope, element, attrs) {
            $timeout(scope.$eval(attrs.afterRender), 0);
        }
    };
    return def;
}]);