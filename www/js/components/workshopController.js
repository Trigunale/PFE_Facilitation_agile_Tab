'use strict';

var app = angular.module('facilitation');

app.controller('WorkshopCtrl', function($scope, $stateParams, $interval, socket, TimerService, WorkshopsProvider) {
    $scope.workshop = {};
    $scope.timerIsSync = null;
    $scope.workshopRunning = false;

    var timerInterval, ispaused = false;

    $scope.initializeTimer = function (val) {
        $scope.timeForTimer = val;
        $scope.timer = val;
        $scope.started = false;
        $scope.paused = false;
        $scope.done = false;
    };

    WorkshopsProvider.getWorkshopById($stateParams.workshopId, function (workshopResult) {
        $scope.workshop = workshopResult.data;

        $scope.workshopSteps = filterWorkshopSteps(workshopResult.data).filter(function (duration) {return duration > -1;}); //[10,20,10]; // mocked
        $scope.roundNum = 0; // first iteration
        $scope.initializeTimer($scope.workshopSteps[$scope.roundNum]);
    });

    function filterWorkshopSteps(workshop){
        return workshop.steps.map(function (step) {
            if(step.duration != undefined && step.duration.theorical != undefined) return step.duration.theorical;
            else return -1;
        });
    };

    // Used to join the wanted room
    $scope.synchronizeTimer = function(){
        console.log("Join room : "+$scope.workshop._id);
        socket.emit('join_room', $scope.workshop._id);
    };

    $scope.$on("$destroy", function(){
        console.log("Leave room : "+$scope.workshop._id);
        socket.emit('leave_room', $scope.workshop._id);
    });

    // TODO : MOVE TO SERVICE

    $scope.startWorkshop = function () {
        if($scope.timerIsSync) {
            var timerInfo = {"workshop":$scope.workshop._id,"duration":$scope.timeForTimer};
            socket.emit('launch_timer', timerInfo);
            $scope.startTimer();
            $scope.workshopRunning = true;
        } else {
            alert("Sync please !");
        }
    };

    socket.on('new_user', function(msg){
        $scope.timerIsSync = true;
        // TODO : testing only, to remove
        //alert(msg);
    });

    $scope.$on('timer-stopped', function(event, remaining) {
        if (remaining === 0) {
            $scope.roundNum++;
            if($scope.roundNum < $scope.workshopSteps.length){
                $scope.initializeTimer($scope.workshopSteps[$scope.roundNum]);
                $scope.startWorkshop();
            } else {
                $scope.done = true;
                stopTimer();
            }
        }
    });



    $scope.startTimer = function () {
        ispaused = false;
        $scope.started = true;
        if(angular.isDefined(timerInterval)) return;
        runTimer();
    };

    $scope.pauseTimer = function () {
        ispaused = true;
        $scope.started = false;
        $scope.paused = true;
        stopTimer();
    };

    $scope.resumeTimer = function(){
        if(!ispaused) return;
        ispaused = false;
        runTimer();
    };

    $scope.resetTimer = function(){
        ispaused = false;
        stopTimer();
        $scope.timer = $scope.timeForTimer;
        $scope.started = false;
        $scope.paused = false;
        $scope.done = false;
        //$scope.$apply();
    };


    function runTimer(){
        timerInterval = $interval(function(){
            $scope.timer--;
            // TODO : Check if that fix is not totally shitty
            if($scope.timer == -1) stopTimer();
            //$scope.$apply();
        }, 1000);
    };

    function stopTimer() {
        if (angular.isDefined(timerInterval)) {
            $interval.cancel(timerInterval);
            timerInterval = undefined;
            $scope.roundNum++;
            if($scope.roundNum < $scope.workshopSteps.length){
                $scope.initializeTimer($scope.workshopSteps[$scope.roundNum]);
                $scope.startWorkshop();
            } else {
                $scope.done = true;
                $scope.initializeTimer(0);
            }
        }
    };

    // This function helps to display the time in a correct way in the center of the timer
    $scope.humanizeDurationTimer = function(input, units) {
        return TimerService.humanizeDurationTimer(input, units);
    };
});