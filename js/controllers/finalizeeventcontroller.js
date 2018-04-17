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

app.controller('FinalizeEventController', function($scope, $window, $mdToast, $mdDialog, EventsService, event, showFinalizeEvent) {
    var fe = this;
    
    fe.event = event;
    fe.acceptedPapers = [];
    fe.publisherEmail = "";
    event.submissions.forEach(function(paper){
        if (paper.state == "pso:accepted-for-publication"){
            fe.acceptedPapers.push(paper);
        }
    });

    fe.finalizeEvent = function() {
        var reqData = {"publisher_email" : fe.publisherEmail};
        EventsService.finalizeEvent(event.acronym, reqData).success(function(data){
            var reqData = {"state": "close"};
            EventsService.modifyEvent(event.acronym, reqData).success(function(res) {
                openToast($mdToast, "Paper finalized successfully!", "success");
                event.state = "close";
                showFinalizeEvent = false;
                fe.closeDialog();
            }).error(function(data) {
                openToast($mdToast, "Server error", "error");
            });
        }).error(function(data) {
            openToast($mdToast, "Server error", "error");
        });
    };
    
    fe.closeDialog = function() {
        $mdDialog.cancel();
    };
});
