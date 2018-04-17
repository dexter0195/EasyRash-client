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

/*AuthService allow to manage user authentication making request for login and signup*/
app.factory('AuthService', function($http) {
    return {
        login: function(mail, password) {
            return $http({
                url: erConfig.baseUrl + '/api/token',
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(mail + ":" + password)
                },
                method: 'GET'
            });
        },
        refreshToken: function(oldtoken) {
            return $http({
                url: erConfig.baseUrl + '/api/token',
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            });
        },
        signup: function(mail, reqData) {
            return $http({
                url: erConfig.baseUrl + '/api/user/' + mail,
                data: reqData,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                method: 'PUT'
            });
        },
        sendPasswordRecovery: function(mail) {
            return $http({
                url: erConfig.baseUrl + '/api/user/' + mail + '/pwdrecovery',
                method: 'GET'
            });
        },
        changeForgottenPassword: function(userID, newToken, newPassword) {
            return $http({
                url: erConfig.baseUrl + '/api/user/' + userID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(newToken + ":"),
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                data: {
                    'password': newPassword
                },
                method: 'POST'
            });
        },
        resendConfirm: function(userID) {
            return $http({
                url: erConfig.baseUrl + '/api/confirmation/resend/' + userID,
                method: 'GET'
            });
        }
    }
});
