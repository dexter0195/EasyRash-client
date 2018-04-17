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

app.controller('EditEventController', function($scope, $rootScope, $window, $mdToast, $mdDialog, $routeParams, EventsService, UsersService, event) {
    var ee = this;
    ee.newChairs = [];
    ee.oldChairs = [];
    // ee.eventdata is the model
    ee.eventdata = event;
    //date needs to be a Date Object
    ee.eventdata.date = new Date(ee.eventdata.date);
    //load old chairs
    ee.eventdata.chairs.forEach(function(usermail, index) {
        UsersService.getUser(usermail).success(function(userdata) {
            if (ee.eventdata.chairs[index]["mail"] != _storage.mail()) {
                ee.oldChairs.push(userdata);
            }
        }).error(function(data) {
            openToast($mdToast, "Server error", "error");
        });
    });

    ee.editEvent = function() {
        ee.eventdata.chairs = [];
        ee.newChairs.forEach(function(chair, index) {
            ee.eventdata.chairs.push(ee.newChairs[index]["mail"]);
        })
        var reqData = {
            "conference": ee.eventdata["conference"],
            "description": ee.eventdata["description"],
            "date": ee.eventdata["date"],
            "chairs": ee.eventdata["chairs"]
        }
  
        EventsService.modifyEvent(event.acronym, reqData).then(function(res) {
            openToast($mdToast, "Event correctly saved!", "success");
        }).catch(function(res) {
        
            openToast($mdToast, "Error while saving event", "error");
        });
        ee.closeDialog();
    };

    ee.closeDialog = function() {
        $mdDialog.cancel();
    };
});
