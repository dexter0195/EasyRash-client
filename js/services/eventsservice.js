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

/*EventsService allow to manage events, with function getEvents() addEvent() ...*/
app.factory('EventsService', function($http) {
    return {
        getEvents: function() {
            return $http({
                url: erConfig.baseUrl + '/api/event',
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            });
        },
        getEvent: function(eventID) {
            return $http({
                url: erConfig.baseUrl + '/api/event/' + eventID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            });
        },
        finalizeEvent: function(eventID, data) {
            return $http({
                url: erConfig.baseUrl + '/api/event/' + eventID + "/finalize",
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":"),
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data,
                method: 'POST'
            });
        },
        addEvent: function(eventID, data) {
            return $http({
                url: erConfig.baseUrl + '/api/event/' + eventID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":"),
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data,
                method: 'PUT'
            });
        },
        modifyEvent: function(eventID, data) {
            return $http({
                url: erConfig.baseUrl + '/api/event/' + eventID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":"),
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data,
                method: 'POST'
            });
        }
    }
});
