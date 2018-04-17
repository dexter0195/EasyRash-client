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

app.controller("userPanelController", function($scope, $mdToast, $window, $mdDialog, UsersService) {
    var up = this;
    up.apikey = _storage.get("token");
    up.firstName = _storage.get("given_name");
    up.lastName = _storage.get("family_name");
    up.sex = _storage.get("user_sex");
    up.email = _storage.mail();
    up.oldpassword = null;
    up.newpassword = null;
    up.userPrimaryPalette = erConfig.primaryPalette();
    up.userAccentPalette = erConfig.accentPalette();
    up.colors = [{
        "color": "red",
        "code": " #f44336"
    }, {
        "color": "pink",
        "code": "#E91E63"
    }, {
        "color": "purple",
        "code": "#9C27B0"
    }, {
        "color": "deep-purple",
        "code": "#673AB7"
    }, {
        "color": "indigo",
        "code": "#3F51B5"
    }, {
        "color": "blue",
        "code": "#2196F3"
    }, {
        "color": "light-blue",
        "code": "#03A9F4"
    }, {
        "color": "cyan",
        "code": "#00BCD4"
    }, {
        "color": "teal",
        "code": "#009688"
    }, {
        "color": "green",
        "code": "#4CAF50"
    }, {
        "color": "light-green",
        "code": "#8BC34A"
    }, {
        "color": "lime",
        "code": "#CDDC39"
    }, {
        "color": "yellow",
        "code": "#FFEB3B"
    }, {
        "color": "amber",
        "code": "#FFC107"
    }, {
        "color": "orange",
        "code": "#FF9800"
    }, {
        "color": "deep-orange",
        "code": "#FF5722"
    }, {
        "color": "brown",
        "code": "#795548"
    }, {
        "color": "grey",
        "code": "#9E9E9E"
    }, {
        "color": "blue-grey",
        "code": "#607D8B"
    }];
    up.selctOnClick = function($event) {
        $event.target.select();
    };
    up.closeDialog = function() {
        $mdDialog.cancel();
    };
    up.goDocumentation = function() {
        $location.url(erConfig.basePath + "#!/api/documentation");
    };
    up.defaultTheme = function() {
        _storage.del("primaryPalette");
        _storage.del("accentPalette");
        up.userPrimaryPalette = erConfig.primaryPalette();
        up.userAccentPalette = erConfig.accentPalette();
    };
    up.updateUser = function() {
        _storage.set("primaryPalette", up.userPrimaryPalette);
        _storage.set("accentPalette", up.userAccentPalette);

        var reqData = {
            "given_name": up.firstName,
            "sex": up.sex,
            "family_name": up.lastName,
        }

        UsersService.changeUserInfo(up.email, reqData).then(function(res) {
            openToast($mdToast, "User data updated!", "success");

            if (up.oldpassword != null && up.newpassword != null) {
                UsersService.changePassword(up.email, up.oldpassword, up.newpassword).then(function(res) {
                    openToast($mdToast, "Password has been changed", "success");
                    $scope.closeDialog();
                }).catch(function(res) {
                    openToast($mdToast, "The server couldn't change the password. Try again later!", "error");
                    $scope.closeDialog();
                });
            }

            // $scope.closeDialog();
            $window.location.reload();
        }).catch(function(res) {
            openToast($mdToast, "The server couldn't change user data. Try again later!", "error");
            // $scope.closeDialog();
        });



    };

});
