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

/* AngularJS lets you extend HTML with new attributes called Directives.
 *The restrict option is typically set to:

 'A' - only matches attribute name <div header> </div>
 'E' - only matches element name <header></header>
 'C' - only matches class name
 'M' - only matches comment
 * */
app.directive("erheader", function() {
    return {
        restrict: 'E',
        templateUrl: erConfig.templatePath + 'header/index.html',
        controller: 'HeaderController',
        controllerAs: 'headerCtrl'
    };
});
app.directive("servernotfound", function() {
    return {
        restrict: 'E',
        templateUrl: erConfig.templatePath + '404/index.html'
    };
});
app.directive("erfooter", function() {
    return {
        restrict: 'E',
        templateUrl: erConfig.templatePath + 'footer/index.html'
    };
});

app.directive("filterannotations", function() {
    return {
        restrict: 'E',
        templateUrl: erConfig.templatePath + 'paper/modals/filterAnnotations.html'
    };
});
