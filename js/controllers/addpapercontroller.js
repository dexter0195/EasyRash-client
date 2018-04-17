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

app.controller('AddPaperController', function($scope, $rootScope, $window, $mdDialog, $mdToast, PaperService, event) {
    var ap = this;

    ap.addPaper = function() {
        //server needs only mail
        for (var i = 0; i < ap.addPaperAuthors.length; i++) {
            ap.addPaperAuthors[i] = ap.addPaperAuthors[i].mail;
        }
        
        var reqData = {
            "title": ap.addPaperTitle,
            "authors": ap.addPaperAuthors, 
            "event": event.acronym,
            "text": _base64.encode(ap.addPaperRash) 
        };
        
        PaperService.addPaper(ap.addPaperUrl, reqData).then(function(res) {
            openToast($mdToast, "Paper successfully added", "success");
            ap.closeDialog();
            $window.location.reload();

        }).catch(function(res) {
            openToast($mdToast, "Error on create new paper", "error");
        });
        
    };
    
    ap.closeDialog = function() {
        $mdDialog.cancel();
    };
});
