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

app.controller('AnnotationController', function($scope, $sce, $window, $mdDialog, $mdToast, $routeParams, $timeout, PaperService, EventsService, sel, paper, listAnnotations, filterAnnotations, updateReviewerFilters) {
    var ac = this;
    var selection = sel;
    var myrange = sel.getRangeAt(0);
    var sel_text = myrange.cloneContents().textContent;
    $scope.selectedtext = sel_text;
    ac.ids = 0;
    ac.text_annotation = null;
    ac.getContainingNode = function(node) {
        // Goes up the dom to find a node with an id
        while (node) {
            if (node.nodeType == 1) {
                return node;
            }
            node = node.parentNode;
        }
    }

    ac.countAnnotationPerRef = function(ref) {
        // count how many notes are binded to a dom reference
        var count = 0;
        for (var i = 0; i < paper.comment_list.length; i++) {
            if (paper.comment_list[i]["ref"].substr(1) == ref) count++;
        }
        return count;
    };

    
    ac.saveAnnotation = function() {

        var newdomneeded = false;
        parent = document.createRange();
        parent.selectNodeContents(myrange.commonAncestorContainer);

        // check if right before our range there's our moreAnnotation indicator 
        // if that's the case, add it to our range
        var parentFirstChild = myrange.commonAncestorContainer.firstChild;
        var parentFirstChildA = angular.element(parentFirstChild);
        if (parentFirstChildA.hasClass("moreAnnotations")) {
            var morerange = document.createRange();
            morerange.selectNode(parentFirstChild);
            if (morerange.compareBoundaryPoints(morerange.END_TO_START, myrange)) {
                parentFirstChild.parentNode.removeChild(parentFirstChild.parentNode.firstChild);
                myrange.insertNode(parentFirstChild);
            }
        }

        var rangediv = document.createElement("div");
        rangediv.appendChild(myrange.cloneContents());
        var parentdiv = document.createElement("div");
        parentdiv.appendChild(parent.cloneContents());


        if (rangediv.innerHTML == parentdiv.innerHTML) {
            // The new selection is the same as the parent
            var parentNode = ac.getContainingNode(myrange.commonAncestorContainer);
            var parentANode = angular.element(parentNode);
            parentANode.addClass("er_note"); // only if needed!
            if (parentNode.id == "") {
                paper.maxannotationid++; // to increment only if we're using OUR and new fragments
                var domid = "er_note_" + (paper.maxannotationid).toString();
                parentNode.id = domid;
            }
            else {
                var domid = parentNode.id;
            }
        }
        else {
            newdomneeded = true;
            paper.maxannotationid++; // to increment only if we're using OUR and new fragments
            var domid = "er_note_" + (paper.maxannotationid).toString();
        }

        paper.maxuserannotationid++;
        var newid = paper.maxuserannotationid;
        newid = paper.reviewerid + "-c" + newid.toString();
        var d = new Date(); // add to annotations_list
        var newann = {
            "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
            "@type": "comment",
            "@id": newid,
            "text": ac.text_annotation,
            "ref": "#" + domid,
            "author": "mailto:" + _storage.mail(),
            "date": d.toISOString()
        };

        for (i = 0; i < paper.annotations_list.length; i++) {
            var jsonld = JSON.parse(paper.annotations_list[i].innerText);
            for (j = 0; j < jsonld.length; j++) {
                if (jsonld[j]["@type"] == "review" && jsonld[j]["@id"] == paper.reviewerid) {
                    jsonld[j]["comments"].push(newid);
                    jsonld.push(newann);
                    // overwrite paper.annotations_list node
                    var savedscript = document.createElement("script");
                    savedscript.type = "application/ld+json";
                    savedscript.innerHTML = JSON.stringify(jsonld, null, 4);
                    paper.annotations_list[i] = savedscript;
                }
            }
        }

        for (var i = 0; i < paper.data.reviewers.length; i++) {
            if (paper.data.reviewers[i] == _storage.mail()) {
                var my_reviewerid = "er_review" + i;
            }
        }
        if (newdomneeded) {
            // add to dom
            var selectedText = myrange.extractContents();
            var span = document.createElement("span");
            span.id = domid;
            span.className = 'er_note ' + my_reviewerid;
            span.appendChild(selectedText);
            myrange.insertNode(span);
        }
        else {
            // we still need to add our reviewerid class if needed
            var parent = angular.element(ac.getContainingNode(myrange.commonAncestorContainer));
            var rev_class = my_reviewerid;
            if (!parent.hasClass(rev_class)) {
                parent.addClass(rev_class);
            }
        }

        ac.closeDialog();
        paper.comment_list = listAnnotations();
        paper.filtered_comment_list = filterAnnotations();
        updateReviewerFilters();
        paper.modified = true;
    }

    ac.closeDialog = function() {
        $mdDialog.cancel();
    };

});
