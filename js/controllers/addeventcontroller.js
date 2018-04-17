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

app.controller('AddEventController', function($scope, $window, $mdDialog, $mdToast, EventsService) {
    var ae = this;

    ae.eventChairs = [];
    ae.eventAcronym = "";
    ae.eventTitle = null;
    ae.eventDescription = null;
    ae.eventDate = null;

    ae.closeDialog = function() {
        $mdDialog.cancel();
    };
    ae.newEvent = function() {
        //server needs only mail
        for (var i = 0; i < ae.addEventChairs.length; i++) {
            ae.addEventChairs[i] = ae.addEventChairs[i].mail;
        }
        var reqData = {
            "conference": ae.addEventTitle,
            "chairs": ae.addEventChairs,
            "date": ae.addEventDate,
            "description": ae.addEventDescription
        };
        EventsService.addEvent(ae.addEventAcronym, reqData).then(function(res) {
            openToast($mdToast, "Event successfully added", "success");
            ae.closeDialog();
            $window.location.reload();

        }).catch(function(res) {
            openToast($mdToast, "Error on create new event", "error");
        });
    };
});
