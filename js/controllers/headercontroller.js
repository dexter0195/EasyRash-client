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

app.controller("HeaderController", function($window, $mdDialog, $mdSidenav, $scope, $rootScope) {
    var hc = this;
    hc.isLogged = function() {
        return (_storage.mail()) ? true : false
    };
    hc.getCompleteName = function() {
        return _storage.get("given_name") + " " + _storage.get("family_name")
    };
    
    // Watch for changes in the sidenav condition
    var watchNavbar = null;
    
    hc.openSideNav = function() {
        watchNavbar = $rootScope.$watch(function(){return $mdSidenav('right-menu').isOpen();}, function(newvalue, oldvalue){
                if (oldvalue==true && newvalue==false){
                    // we're closing the SideNav with clickoutside
                    angular.element(document.querySelector("body")).css("overflow", "");
                    watchNavbar(); // disable the watchdog
                }
        });
        angular.element(document.querySelector("body")).css("overflow", "hidden");
        $mdSidenav('right-menu').open();
    };
    
    hc.closeSideNav = function() {
        angular.element(document.querySelector("body")).css("overflow", "");
        watchNavbar(); // disable the watchdog
        $mdSidenav('right-menu').close();
    }
    
    hc.openLoginModal = function() {
        $mdDialog.show({
            templateUrl: erConfig.templatePath + 'header/modals/login.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            controller: "AuthController"
        })
    };
    $scope.$on('openLoginModal', function() {
        hc.openLoginModal()
    }); // this ma be called from userconfirmationcontroller
    hc.openLoginModalFromSidenav = function() {
        $mdSidenav('right-menu').toggle();
        hc.openLoginModal();
    };
    hc.openUserModalFromSidenav = function(ev) {
        $mdSidenav('right-menu').toggle();
        hc.openUserModal(ev);
    };
    hc.openUserModal = function(ev) {
        $mdDialog.show({
            templateUrl: erConfig.templatePath + 'header/modals/user-panel.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            controller: "userPanelController"
        })
    };
});
