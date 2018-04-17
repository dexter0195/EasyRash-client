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

/*UsersService contains all function for manipulate users through API*/
app.factory('UsersService', function($http) {
    return {
        getUsers: function() {
            return $http({
                url: erConfig.baseUrl + '/api/user',
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            })
        },
        getUser: function(userID) {
            return $http({
                url: erConfig.baseUrl + '/api/user/' + userID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            })
        },
        changePassword: function(userID, oldPassword, newPassword) {
            return $http({
                url: erConfig.baseUrl + '/api/user/' + userID,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    //'Authorization': 'Basic ' + _base64.encode(userID + ":" + oldPassword)
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                data: {
                    'password': newPassword
                },
                method: 'POST'
            });
        },
        changeUserInfo: function(userID, data) {
            return $http({
                url: erConfig.baseUrl + '/api/user/' + userID,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                'data': data,
                method: 'POST'
            });
        }
    }
});
