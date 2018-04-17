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

app.controller("UserConfirmationController", function($scope, $mdToast, $window, $mdDialog, AuthService, usermail, context) {
    var uc = this;
    uc.mail = usermail;
    uc.context = context;

    uc.resendConfirmation = function() {
        uc.loading = true;
        AuthService.resendConfirm(uc.mail).then(function(res) {
            uc.loading = false;
            openToast($mdToast, "Confirmation email resent! Check your inbox!", "success");
        }).catch(function(res) {
            uc.loading = false;
            openToast($mdToast, "There has been an error resending your confirmation error. Try again!", "error");
        });
    };

    uc.openLoginModal = function() {
        $scope.$emit('openLoginModal');
    };

    uc.closeDialog = function() {
        $mdDialog.cancel();
    };
});
