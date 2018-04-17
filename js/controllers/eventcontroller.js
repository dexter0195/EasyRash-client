/*
 *Copyright (C) 2016 Carlo De Pieri, Alessio Koci, Gianmaria Pedrini,
 *Alessio Trivisonno
 *
 *This file is part of EasyRash.
 *
 *EasyRash is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *EasyRash is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

app.controller('EventController', function($scope, $rootScope, $window, $mdToast, $mdDialog, $routeParams, EventsService, UsersService, PaperService) {
    var ev = this;
    ev.eventID = $routeParams.eventID;
    ev.eventdata = null;
    ev.reviewers_view = false;
    ev.papers_view = false;
    ev.loading = true;
    ev.showFinalizeEvent = false;
    ev.paperNum = 0;
    ev.revNum = 0;
    
    // check if the user token is expired
    $rootScope.$broadcast("forceLogOut");
    
    EventsService.getEvent(ev.eventID).success(function(data) {
        ev.eventdata = data;
        ev.loading = false;
        ev.paperNum = ev.eventdata.submissions.length;
        ev.revNum = ev.eventdata.pc_members.length;
        ev.papers_view = (ev.paperNum > 0) ? false : true;
        ev.reviewers_view = (ev.revNum > 0) ? false : true;
        if (ev.papers_view == 0 && ev.reviewers_view == 0){
            // no request to handle
            ev.loading = false;
        }
        ev.initPapers();
        ev.initReviewers();
    }).error(function(data) {
        ev.papers_view = ev.reviewers_view = true;
        openToast($mdToast, "Wrong event id!", "error");
    });

    ev.initPapers = function() {
        ev.eventdata.submissions.forEach(function(paper, index) {
            PaperService.getPaper(paper).success(function(paperdata) {
                ev.eventdata.submissions[index] = paperdata;
                // one more request handled
                ev.paperNum--;
                if (ev.paperNum == 0 && ev.revNum == 0) {
                    // all requests handled, loading completed
                    ev.loading = false;
                    $scope.$emit("loaded");
                }
            }).error(function(data) {
                
                openToast($mdToast, "Server error", "error");
            });
        });
    };
    
    ev.initReviewers = function() {
        ev.eventdata.pc_members.forEach(function(usermail, index) {
            UsersService.getUser(usermail).success(function(userdata) {
                ev.eventdata.pc_members[index] = userdata;
                // one more request handled
                ev.revNum--;
                if (ev.paperNum == 0 && ev.revNum == 0) {
                    // all requests handled, loading completed
                    ev.loading = false;
                    $scope.$emit("loaded");
                }
            }).error(function(data) {
                openToast($mdToast, "Server error", "error");
            });
        });
    };
    
    ev.getButtonClass = function(paper){
        var buttonClass = "";
        if(paper.state == 'pso:accepted-for-publication'){
            buttonClass = "paper-accepted-button";
        }
        if(paper.state == 'pso:rejected-for-publication'){
            buttonClass = "paper-rejected-button";
        }
        if(paper.state == 'pso:awaiting-decision'){
            buttonClass = "paper-awaiting-decision-button";
        }
        if(paper.state == 'pso:under-review'){
            buttonClass = "paper-under-review-button";
        }
        return buttonClass;
    };
    
    ev.getStatusIcon = function(state) {
        var iconName, iconClass;
        if (state == 'accepted-for-publication') {
            iconName = 'thumb_up';
            iconClass = 'paper-accepted-icon'; // green material 800
        }
        else if (state == 'rejected-for-publication') {
            iconName = 'thumb_down';
            iconClass = 'paper-rejected-icon'; // red material 500
        }
        else if (state == 'awaiting-decision') {
            iconName = 'hourglass_full';
            iconClass = 'paper-awaiting-decision-icon'; // amber material 500
        }
        else if (state == 'under-review') {
            iconName = 'search';
            iconClass = 'paper-under-review-icon'; // indigo material 500
        }
        var icon = {
            name: iconName,
            class: iconClass
        };
        return icon;
    };
    
    $scope.$on("loaded", function(){
        var decidedCount = 0;
        ev.eventdata.submissions.forEach(function(paper){
            if (paper.state == "pso:accepted-for-publication" || paper.state == "pso:rejected-for-publication"){
                decidedCount++;
            }
        });
        if (decidedCount == ev.eventdata.submissions.length){
            ev.showFinalizeEvent = true;
        }
    });
    
    ev.openFinalizeEventDialog = function(){
        $mdDialog.show({
            templateUrl: erConfig.templatePath + 'events/modals/finalizeEvent.html',
            parent: angular.element(document.body),
            controller: "FinalizeEventController",
            controllerAs: "feCtrl",
            locals: {
                event: ev.eventdata,
                showFinalizeEvent: ev.showFinalizeEvent
            },
            clickOutsideToClose: true
        });
    };
    
    $scope.openEditEventDialog = function() {
        $mdDialog.show({
            templateUrl: erConfig.templatePath + 'events/modals/editEvent.html',
            parent: angular.element(document.body),
            controller: "EditEventController",
            controllerAs: "eeCtrl",
            locals: {
                event: ev.eventdata
            },
            clickOutsideToClose: true
        });
    };
    
    ev.openAddPaperDialog = function() {
        $mdDialog.show({
            templateUrl: erConfig.templatePath + 'events/modals/addPaper.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            controller: "AddPaperController",
            controllerAs: "apCtrl",
            locals: {
                event: ev.eventdata
            }
        })
    };

    ev.checkRole = function(role, id) {
        // TODO perche' cazzo sta funzione viene chiamata TANTE volte con una sola chiamata?
        return _storage.checkRole(role, id);
    };

    ev.closeDialog = function() {
        $mdDialog.cancel();
    };
    
    
});
