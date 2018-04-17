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

// PaperService manage all paper related communication with the server
app.factory("PaperService", function($http) {
    return {
        getPapers: function() {
            return $http({
                url: erConfig.baseUrl + '/api/paper',
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            })
        },
        getPaper: function(paperID) {
            return $http({
                url: erConfig.baseUrl + '/api/paper/' + paperID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            })
        },
        addPaper: function(paperID, data) {
            return $http({
                url: erConfig.baseUrl + '/api/paper/' + paperID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":"),
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data,
                method: 'PUT'
            })
        },
        modifyPaper: function(paperID, data) {
            return $http({
                url: erConfig.baseUrl + '/api/paper/' + paperID,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":"),
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data,
                method: 'POST'
            })
        },
        getPaperContent: function(paperID, type) { //type= html, pdf, ebook ecc
            return $http({
                url: erConfig.baseUrl + '/api/paper/' + paperID + '/' + type,
                headers: {
                    'Authorization': 'Basic ' + _base64.encode(_storage.get("token") + ":")
                },
                method: 'GET'
            })
        }
    }
});
