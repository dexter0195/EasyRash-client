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

/*  Angular Module is  a container for the different parts of an app – controllers, services, filters, directives, etc.
 *  EasyRash refer to ng-app="EasyRash" inside index.html
 *  app include all modules for an app, and all this modules are visible from anyone
 */
var app = angular.module('EasyRash', ['ngMaterial', 'ngAria', 'ngRoute', 'ngLetterAvatar', 'jkAngularRatingStars', 'ngIdle']);
/*  EasyRash config as erConfig
 *  contains all generic variable and function
 *  that are server location dependant 
 */
var erConfig = {
    "basePath": "/",
    "templatePath": "/templates/",
    "baseUrl": "localhost:10000", //change here for production
    "primaryPalette": function() {
        return _storage.get("primaryPalette") || "blue"
    },
    "accentPalette": function() {
        return _storage.get("accentPalette") || "red"
    },
    "token": function() {
        return _storage.get("token") || ""
    }
};
/*  The ngRoute module provides routing and deeplinking services and directives for angular apps.
 *  ngView is a directive that complements the $route service by including the rendered template
 *  of the current route into the main layout (index.html) file. Every time the current route changes,
 *  the included view changes with it according to the configuration of the $route service.
 */
app.config(function config($locationProvider, $routeProvider, $mdThemingProvider, KeepaliveProvider, IdleProvider) {
    IdleProvider.idle(1800); // 30 minutes, the user is considered idle after this time
    IdleProvider.timeout(300); // 5 minutes, the lock will be released after this time idle
    KeepaliveProvider.interval(300); // 5 minutes, how often the lock will be renewed when not idle
    $mdThemingProvider.theme('default').primaryPalette(erConfig.primaryPalette()).accentPalette(erConfig.accentPalette());
    $mdThemingProvider.theme("error");
    $mdThemingProvider.theme("success");
    $locationProvider.hashPrefix('!');
    if (_storage.mail()) { //this routing takes place only if logged
        $routeProvider.
        when('/forcedlogout', {
            templateUrl: erConfig.templatePath + 'welcome/forcedlogout.html',
            controller: "AuthController",
            controllerAs: "authCtrl",
        }).
        when('/events', {
            templateUrl: erConfig.templatePath + 'events/events.html',
            controller: "EventsController",
            controllerAs: "eventsCtrl"
        }).
        when('/event/:eventID', {
            templateUrl: erConfig.templatePath + 'events/event.html',
            controller: "EventController",
            controllerAs: "eventCtrl"
        }).
        when('/event/:eventID/:paperID', {
            templateUrl: erConfig.templatePath + 'paper/paper.html',
            controller: "PaperController",
            controllerAs: "paperCtrl"
        }).
        when('/doc', {
            templateUrl: erConfig.templatePath + 'about/doc.html',
            controller: "DocsController",
            controllerAs: "docsCtrl"
        }).
        otherwise('/events');
    }
    else { // // this routing takes place only if not logged
        $routeProvider.when('/welcome', {
            templateUrl: erConfig.templatePath + 'welcome/index.html'
        }).
        when('/privacypolicy', {
            templateUrl: erConfig.templatePath + 'about/privacy_policy.html'
        }).
        otherwise('/welcome');
    }
    
    
});
