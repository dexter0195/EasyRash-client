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

app.controller('ShowPaperMetadataController', function($scope, $mdDialog, $mdToast, UsersService, paper, getStatusIcon, getReviewerStatusIcon) {
    var pm = this;

    pm.paper = paper;
    pm.getReviewerStatusIcon = getReviewerStatusIcon;
    pm.getStatusIcon = getStatusIcon;
    pm.ShowRawMetadata = false;
    pm.rev = [];
    pm.aut = [];

    pm.closeDialog = function() {
        $mdDialog.cancel();
    };

    pm.initAuthors = function() {
        pm.paper.data.authors.forEach(function(usermail, index) {
            UsersService.getUser(usermail).success(function(userdata) {
                pm.aut.push(userdata);
            }).error(function(data) {
                openToast($mdToast, "Server error", "error");
            });
        });
    };
    pm.initReviewers = function() {
        pm.paper.data.reviewers.forEach(function(usermail, index) {
            UsersService.getUser(usermail).success(function(userdata) {
                pm.rev.push(userdata);
            }).error(function(data) {
                openToast($mdToast, "Server error", "error");
            });
        });
    };

    pm.initReviewers();
    pm.initAuthors();
});
