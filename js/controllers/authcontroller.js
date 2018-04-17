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

app.controller("AuthController", function($scope, $rootScope, $mdToast, $window, $mdDialog, AuthService, UsersService) {
    var ac = this;
    ac.loginmail = null;
    ac.loginpassword = null;

    ac.forgotpsw_mail = null;
    ac.forgotpsw_token = null;
    ac.forgotpsw_newpass = null;
    ac.forgotpsw_view = false;

    ac.loading = false;

    ac.login = function() {
        ac.loading = true;

        AuthService.login(ac.loginmail, ac.loginpassword).then(function(res) {
            ac.saveToken(res.data, ac.loginmail, "", "", "", "", []);
            UsersService.getUser(ac.loginmail).then(function(resb) {
                var user = resb.data;
                ac.saveToken(res.data, ac.loginmail, user.given_name, user.family_name, user.sex, user.roles, []);
                openToast($mdToast, "Welcome " + user.given_name, "success");
                $scope.closeDialog();
                ac.loading = false;
                $window.location.reload();
            }).catch(function(res) {
                $scope.logOut();
                openToast($mdToast, "Server error despite valid credential, try again!", "error");
                ac.loading = false;
            });
        }).catch(function(res) {
            if (res.data == "<h1>User unconfirmed. Please confirm your account first</h1>") {
                $mdDialog.show({
                    templateUrl: erConfig.templatePath + 'header/modals/user-confirmation.html',
                    parent: angular.element(document.body),
                    locals: {
                        context: "Your account doesn't seem to be confirmed.",
                        usermail: ac.loginmail
                    },
                    clickOutsideToClose: true,
                    controller: "UserConfirmationController",
                    controllerAs: "ucCtrl"
                })
            }
            else {
                openToast($mdToast, res.data, "error");
            }
            ac.loading = false;
        });
    };
    ac.signup = function() {
        ac.loading = true;
        var reqData = {
            "given_name": this.firstName,
            "sex": this.sex,
            "family_name": this.lastName,
            "password": this.password
        }
        AuthService.signup(this.email, reqData).then(function(res) {
            openToast($mdToast, "Registration completed!", "success");
            ac.loading = false;
            $mdDialog.show({
                templateUrl: erConfig.templatePath + 'header/user-confirmation.html',
                parent: angular.element(document.body),
                locals: {
                    context: "Welcome on EasyRash. Before you login, we require our users to confirm their email.",
                    usermail: reqData.mail
                },
                clickOutsideToClose: true,
                controller: "UserConfirmationController",
                controllerAs: "ucCtrl"
            })
        }).catch(function(res) {
            openToast($mdToast, res.data, "error");
            ac.loading = false;
        });
    };
    ac.forgotPasswordDialog = function() {
        $mdDialog.show({
            templateUrl: erConfig.templatePath + 'header/modals/forgotpsw.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            controller: "AuthController",
            controllerAs: "fpswCtrl"
        })
    }
    ac.changeForgottenPsw = function() {

        AuthService.changeForgottenPassword(ac.forgotpsw_mail, ac.forgotpsw_token, ac.forgotpsw_newpass).then(function(res) {
            openToast($mdToast, "Password has been changed", "success");
            $scope.closeDialog();
            $window.location.reload();
        }).catch(function(res) {
            openToast($mdToast, "The server couldn't change the password. Try again later!", "error");
            // $scope.closeDialog();
        });

    }
    ac.getTokenRecovery = function() {
        AuthService.sendPasswordRecovery(ac.forgotpsw_mail).then(function(res) {
            openToast($mdToast, "A token has been sent", "success");
            ac.forgotpsw_view = true;
        }).catch(function(res) {
            openToast($mdToast, "The server couldn't send a token for change password. Try again later!", "error");
            //  $scope.closeDialog();
        });

    }
    ac.getToken = function() {
        return _storage.get("token");
    };
    ac.saveToken = function(token, mail, given_name, family_name, user_sex, roles, lock) {
        _storage.loginInit(mail);
        _storage.set("token", token);
        _storage.set("roles", roles);
        _storage.set("given_name", given_name);
        _storage.set("family_name", family_name);
        _storage.set("user_sex", user_sex);
        _storage.set("lock", lock);
    };
    $scope.logOut = function() {
        ac.logOutHelper();
        $window.location.reload();
    };
    ac.logOutHelper = function(){
        _storage.del("token");
        _storage.del("roles");
        _storage.del("given_name");
        _storage.del("family_name");
        _storage.del("user_sex");
        _storage.del("lock");
        $window.localStorage.removeItem('easyrash_loggedUser');
        $window.localStorage.removeItem('easyrash_lastTimeLogged');
    };
    $scope.$on("forceLogOut", function(){
        ac.checkTokenTime();
    });
    ac.checkTokenTime = function(){
        var startTime = _storage.tokenInitTime();
        if(startTime==0) return;
        var duration = 604800000; // 1w
        var expiration = startTime + duration; // 24h
        var now = new Date().getTime();
        var timeLeft = expiration - now;
        if((now < expiration) && (timeLeft<(duration/100)*80)){
            AuthService.refreshToken().then(function(res) {
                _storage.refreshToken(res.data);
            });
        }
        else if (now > expiration){
            ac.logOutHelper();
            $window.location.assign("#!/forcedlogout");
        }
    };
    
    ac.reloadOnTokenExpired = function(){
        if (_storage.mail!=undefined){
            ac.logOutHelper();
        }
        $window.location.reload();
    };
    $scope.closeDialog = function() {
        $mdDialog.cancel();
    };
});
