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

app.controller('PaperController', function($scope, $rootScope, $sce, $window, $mdDialog, $mdToast, $routeParams, $timeout, PaperService, EventsService, LockService, Idle, Keepalive) {
    var pa = this;

    // check if the user token is expired
    $rootScope.$broadcast("forceLogOut");

    /////////////////////////////// 
    // INITIALIZE DATA STRUCTURE //
    ///////////////////////////////

    pa.init = function(justUpdate) {
        if (justUpdate == false) {
            // dont reset the switch init is called only for updating the paper datas
            pa.lock = false; // ng-model dello switch, se è true non necessariamente sia ha il lock, viene prima fatta la richiesta al service
            pa.mode = "Reader"; // valore effettivo della modalita reader o annotator, settata dopo aver effettuato la richiesta con il service
            pa.lastLabelColors = [];
        }
        pa.userPapers = [];
        pa.eventID = $routeParams.eventID;
        pa.paperID = $routeParams.paperID;
        pa.loading = true;
        pa.paper = {
            data: null, // this will have data returned by the service
            rash: null, // this will contain the rash dom document
            head: null, // this will contain the rash dom head
            body: null, // this will contain only the body of the rash document
            reviewers: [],
            reviewerid: null,
            maxPerson: 0,
            maxreviewid: 0,
            maxuserannotationid: 0,
            maxannotationid: 0,
            comment_list: [],
            filtered_comment_list: [],
            annotations_list: [], // this will contain a list of annotations and final comment
            finalChairDecision: "",
            finalReviewerDecision: "",
            modified: false
        };
        pa.filteredreviewer = []; // used for the filters
        pa.reviewStateDict = {}; // key: reviewer mail value: accepted-for-publication/rejected-for-publication/awaiting-decision
        pa.userReviewFound = false;
        pa.filterUserPapers();

        PaperService.getPaper(pa.paperID).success(function(data) {
            // recover the rash document and save it in memory as a DOM document
            var paper = pa.paper;
            paper.data = data;
            parser = new DOMParser();
            paper.rash = parser.parseFromString(_base64.decode(data.text), "text/html");
            paper.reviewers = paper.data.reviewers;

            // estrapolate annotations, turn the resulting NodeList into Array
            paper.annotations_list = Array.prototype.slice.call(paper.rash.querySelectorAll('script[type="application/ld+json"]'));

            // select the body which will be printed
            paper.body = $sce.trustAsHtml(paper.rash.body.innerHTML); // nel template c'è ng-bind-html
            paper.head = $sce.trustAsHtml(paper.rash.head.innerHTML);


            $timeout(function() { // wait for the dom to update and recover my data
                var rashhead = document.querySelector("#rash-head");
                rashhead.innerHTML = paper.rash.head.innerHTML;

                //aggiungiamo il file rash.js
                var root = document.querySelector("#rash-head");
                var js = document.createElement("script");
                js.id = "rashJs";
                js.type = "text/javascript";
                js.src = "js/rash.js";
                root.appendChild(js);
                
                $timeout(function(){
                    for (var i = 0; i < paper.annotations_list.length; i++) {
                        var jsonld = JSON.parse(paper.annotations_list[i].innerText);
                        for (var j = 0; j < jsonld.length; j++) {
                            //first search for the author of the annotation
                            if (jsonld[j]["@type"] == "person") {
                                paper.maxPerson++
                                    // we need to remove the "mailto:"
                                    var author = jsonld[j]["@id"].substr(7);
                            }
                        }
                        for (var j = 0; j < jsonld.length; j++) {
                            // we need to save the reviewer id and max annotation id
                            if (jsonld[j]["@type"] == "review") {
                                var logged_user = _storage.mail();
                                // init reviewStateDict
                                if (jsonld[j]['article'].hasOwnProperty('eval')) {
                                    pa.reviewStateDict[author] = jsonld[j]['article']['eval']['status'].substr(4);
                                }
                                else {
                                    pa.reviewStateDict[author] = "awaiting-decision";
                                }
                                if (author == logged_user) {
                                    pa.userReviewFound = true;
                                    if (jsonld[j]['article'].hasOwnProperty('eval')) {
                                        paper.finalReviewerDecision = jsonld[j]['article']['eval']['status'].substr(4);
                                    }
                                    paper.reviewerid = jsonld[j]["@id"];
                                    for (var k = 0; k < jsonld[j]["comments"].length; k++) {
                                        var annid = jsonld[j]["comments"][k];
                                        annid = parseInt(annid.substr(annid.indexOf("-c") + 2));
                                        paper.maxuserannotationid = (annid > paper.maxuserannotationid) ? annid : paper.maxuserannotationid;
                                    }
                                }
                                paper.maxreviewid++
                            }
    
                            if (jsonld[j]["@type"] == "comment") {
                                var el = angular.element(document.querySelector(jsonld[j]['ref']));
                                // attribute each annotation to its reviewer
                                var author = jsonld[j]["author"].substr(7);
                                for (var l = 0; l < paper.data.reviewers.length; l++) {
                                    if (paper.data.reviewers[l] == author) {
                                        el.addClass('er_review' + l);
                                    }
                                }
                                el.addClass('er_note');
                                var ref = jsonld[j]["ref"];
                                if (ref.indexOf("#er_note_") == 0) {
                                    var annid = parseInt(ref.substr(9));
                                    paper.maxannotationid = (annid > paper.maxannotationid) ? annid : paper.maxannotationid;
                                }
                            }
                        }
                    }
                    paper.comment_list = pa.listAnnotations();
                    paper.filtered_comment_list = paper.comment_list;
    
    
                    // set default filtered reviewers
                    for (var l = 0; l < paper.data.reviewers.length; l++) {
                        pa.generateAnnotationClass(l);
                        var reviewer = {
                            id: paper.data.reviewers[l],
                            className: "er_review" + l,
                            classNameOn: "er_review" + l + "_on",
                            classNameHover: "er_review" + l + "_hover",
                            show: true
                        };
                        pa.filteredreviewer.push(reviewer);
                    }
                    pa.applyReviewerFilters();
                    pa.loading = false;
    
                    //this will happen only after an update otherwise pa.mode woulve been reset
                    //an update is called only when requesting the lock
                    //this code is here to avoid race conditions in changeMode()
                    if (pa.mode == "Annotator") {
                        //lock the paper if its already decided
                        if (pa.isDecided()) {
                            pa.lock = false
                            pa.mode = "Reader"
                            pa.changeMode()
                            openToast($mdToast, "Paper already finalized, no edits allowed, switching to Reader mode", "error");
                        }
                        //add the review block if its missing
                        else if (pa.checkRole('reviewer', pa.paperID) && pa.userReviewFound == false) {
                            pa.initReview();
                        }
                        //togliere rash da head
                        angular.element(document.querySelector("#rashJs")).remove();
                    }
                }, 1000);
            });
        }).error(function(data) {
            pa.loading = false;
            openToast($mdToast, "Wrong paper id!", "error");
        });

    };

    pa.listAnnotations = function() {
        var list = [];
        for (var i = 0; i < pa.paper.annotations_list.length; i++) {
            var jsonld = JSON.parse(pa.paper.annotations_list[i].innerText);
            for (var j = 0; j < jsonld.length; j++) {
                if (jsonld[j]["@type"] == "comment") {
                    list.push(jsonld[j]);
                }
            }
        }
        return list;
    };

    pa.initReview = function() {
        var paper = pa.paper;
        paper.maxPerson++;
        paper.maxreviewid++;
        var newid = paper.maxreviewid;
        newid = "#review" + newid.toString();
        paper.reviewerid = newid;
        var newReview = {
            "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
            "@type": "review",
            "@id": newid,
            "article": {
                "@id": ""
            },
            "comments": []
        };
        var newPerson = {
            "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
            "@type": "person",
            "@id": "mailto:" + _storage.mail(),
            "name": _storage.get("given_name") + " " + _storage.get("family_name"),
            "as": {
                "@id": "#role" + paper.maxPerson,
                "@type": "role",
                "role_type": "pro:reviewer",
                "in": ""
            }
        };
        var jsonld = JSON.parse("[]");
        jsonld.push(newReview);
        jsonld.push(newPerson);
        var savedscript = document.createElement("script");
        savedscript.type = "application/ld+json";
        savedscript.innerHTML = JSON.stringify(jsonld, null, 4);
        paper.annotations_list.push(savedscript);
    };

    ////////////////////////
    // HANDLE PAPER SAVES //
    ////////////////////////

    pa.unRash = function() {
        var root = document.querySelector("#rash-root").cloneNode(true);
        var rootA = angular.element(root);

        root.querySelectorAll(".cgen").forEach(function(el) {
            var elA = angular.element(el);
            var originalcontent = elA.attr("data-rash-original-content");
            if (originalcontent != undefined) {
                el.outerHTML = originalcontent;
            }
            else {
                elA.remove();
            }
        });

        root.querySelectorAll("section h2, section h3, section h4, section h5, section h6").forEach(function(el) {
            var h = document.createElement("h1");
            h.innerHTML = el.innerHTML;
            if (el.id.length > 0) h.id = el.id;
            if (el.className.length > 0) h.className = el.className;
            angular.element(el).parent().prepend(h);
            angular.element(el).remove();
        });

        root.querySelectorAll("span.MathJax_Preview, script[type='math/mml']").forEach(function(el) {
            angular.element(el).remove();
        });
            
        root.querySelectorAll("span.MathJax").forEach(function(el) {
            var elA = angular.element(el);
            var original = elA.attr("data-mathml");
            el.outerHTML = original;
        });

        root.querySelectorAll("span.rash-math").forEach(function(el) {
            var sc = el.querySelector("script[type='math/tex; mode=display']");
            var elA = angular.element(el); 
            el.outerHTML = '<span role="math">' + sc.innerHTML + '</span>';
            elA.remove();
        });
        
        return root;
    };

    pa.savePaper = function() {
        /* 
         * Function responsable of updating the paper rash and reviewers list server side.
         * it:
         * 1) creates the new rash document from memory and from
         * DOM and base64 encode it. 
         * 2) adds the reviewers list (that might've been edited by the chair)
         * 3) sends both to the server via a service.
         */

        // add decision if the user made one
        if (pa.paper.finalChairDecision !== "" && pa.checkRole("chair", pa.eventID)) {
            pa.setChairDecision(pa.paper.finalChairDecision);
        }
        if (pa.paper.finalReviewerDecision !== "" && pa.checkRole('reviewer', pa.paperID)) {
            pa.setReviewerDecision(pa.paper.finalReviewerDecision);
        }
        // Save all modifications done until this moment
        var doc = pa.paper.rash;
        var dochtml = doc.querySelector("html");
        var docbody = doc.querySelector("body");

        // delete old jsonld
        var targets = doc.querySelectorAll("script[type='application/ld+json'");
        targets.forEach(function(target) {
            target.remove();
        });

        // delete jsonld comments
        var cn = dochtml.childNodes;
        cn.forEach(function(mynode) {
            if ((mynode.nodeType == mynode.COMMENT_NODE) && ((mynode.data.startsWith(" Review") || mynode.data.startsWith(" Decision")))) {
                mynode.remove();
            }
        });

        // delete the old body
        docbody.remove();

        // recreate jsonld scripts and its comments
        pa.paper.annotations_list.forEach(function(ann) {
            var jsonld = JSON.parse(ann.innerText);
            var type, id;
            // now we must filter out wrong ld-json
            if (Object.prototype.toString.call(jsonld) === "[object Array]") {
                var ignore = true;
                // it's a list
                jsonld.forEach(function(elem) {
                    if (elem["@context"] == "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json") {
                        ignore = false;
                        switch (elem["@type"]) {
                            case 'decision':
                                type = "Decision"
                                break;
                            case 'review':
                                type = "Review"
                                break;
                            case 'person':
                                id = elem["@id"]
                                break;
                            default:
                                break;
                        }
                    }
                })
                if (!ignore) {
                    var text = " " + type + " by <" + id + "> ";
                    var comment = document.createComment(text);
                    dochtml.appendChild(comment);
                    var br = document.createTextNode("\n");
                    dochtml.appendChild(br);
                }
            }
            dochtml.appendChild(ann);
        });

        // recover the modified body and clean it 
        var rash_root = pa.unRash(); 
        var notes = rash_root.querySelectorAll(".er_note");
        notes.forEach(function(note) {
            var noteA = angular.element(note);
            pa.filteredreviewer.forEach(function(rev) {
                noteA.removeClass(rev.className);
                noteA.removeClass(rev.classNameOn);
                noteA.removeClass(rev.classNameHover);
            });
            noteA.removeClass("er_note");
            if (note.className.length == 0) note.removeAttribute('class');
        });

        // remove moreAnnotations indicators
        var moreAnn = rash_root.querySelectorAll(".moreAnnotations");
        moreAnn.forEach(function(ann) {
            ann.remove();
        });
        // create my new body and add it to my doc
        var newbody = document.createElement("body");
        newbody.innerHTML = rash_root.innerHTML;
        dochtml.appendChild(newbody);

        // prepare the string that will be sent to the server
        var docstring = "";
        // copy into the string the xml tags 
        var cn = doc.childNodes;
        for (var i = 0; i < cn.length - 1; i++) {
            var container = document.createElement("div");
            container.appendChild(cn[i].cloneNode());
            docstring += container.innerHTML + "\n";
        }
        // copy into the string the html itself
        docstring += dochtml.outerHTML;

        // encode the string
        var encoded = _base64.encode(docstring);

        // send this encoded string to the server
        var reqData = {
            "text": encoded
        };
        // only chairs cant edit reviewers list
        if (pa.checkRole('chair', pa.eventID)) {
            reqData["reviewers"] = pa.paper.reviewers;
            if (pa.paper.reviewers.length < 2) {
                openToast($mdToast, "You must specify at least two reviewers for this paper!", "error");
                return
            }
        }

        PaperService.modifyPaper(pa.paperID, reqData).then(function(res) {
            openToast($mdToast, "Paper correctly saved!", "success");
            // release the lock after saving
            pa.lock = false;
            pa.mode = "Reader";
            pa.changeMode()
        }).catch(function(res) {
            openToast($mdToast, "Error while saving paper", "error");
        });
    };

    pa.setChairDecision = function(decision) {
        //call this only just before saving, and only once to not mess up maxperson number
        var d = new Date();
        pa.paper.maxPerson++
            var newDecision = {
                "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
                "@type": "decision",
                "@id": "#decision1",
                "article": {
                    "@id": "",
                    "eval": {
                        "@context": "easyrash.json",
                        "@id": "#decision1-eval",
                        "@type": "score",
                        "status": "pso:" + decision,
                        "author": "mailto:" + _storage.mail(),
                        "date": d.toISOString()
                    }
                }
            };
        var newPerson = {
            "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
            "@type": "person",
            "@id": "mailto:" + _storage.mail(),
            "name": _storage.get("given_name") + " " + _storage.get("family_name"),
            "as": {
                "@id": "#role" + pa.paper.maxPerson,
                "@type": "role",
                "role_type": "pro:chair",
                "in": ""
            }
        };
        var jsonld = JSON.parse("[]");
        jsonld.push(newDecision);
        jsonld.push(newPerson);
        var savedscript = document.createElement("script");
        savedscript.type = "application/ld+json";
        savedscript.innerHTML = JSON.stringify(jsonld, null, 4);
        pa.paper.annotations_list.push(savedscript);
    }

    pa.setReviewerDecision = function(decision) {
        var d = new Date();
        var found = false
        var mail = _storage.mail()
        var decision = {
                "@context": "easyrash.json",
                "@id": "#decision1-eval",
                "@type": "score",
                "status": "pso:" + decision,
                "author": "mailto:" + mail,
                "date": d.toISOString()
            }
            // add it in the right place
        pa.paper.annotations_list.forEach(function(ann, annIndex) {
            found = false
            var jsonld = JSON.parse(ann.innerText);
            jsonld.forEach(function(elem) {
                if (elem["@type"] == "person" && elem["@id"].substr(7) == mail) {
                    found = true;
                }
            });
            if (found) {
                jsonld.forEach(function(elem, elemIndex) {
                    if (jsonld[elemIndex]["@type"] == "review") {
                        jsonld[elemIndex]["article"]["eval"] = decision;
                        var savedscript = document.createElement("script");
                        savedscript.type = "application/ld+json";
                        savedscript.innerHTML = JSON.stringify(jsonld, null, 4);
                        pa.paper.annotations_list[annIndex] = savedscript;
                    }
                });
            }
        });
    };

    //////////////////////////////
    // HANDLE ANNOTATION FILTER //
    //////////////////////////////

    pa.applyReviewerFilters = function() {
        // prepare an ordered and filtered reviewer list
        var reviewers = [];
        for (var i = 0; i < pa.filteredreviewer.length; i++) {
            var reviewer = pa.filteredreviewer[i];
            if (reviewer.show) {
                if (reviewer.id == _storage.mail()) {
                    reviewers.unshift(reviewer)
                }
                else {
                    reviewers.push(reviewer);
                }
            }
        }
        for (var i = reviewers.length - 1; i >= 0; i--) {
            var reviewer = reviewers[i];
            var domNotes = document.querySelectorAll("#rash-root .er_note." + reviewer.className);
            for (var j = 0; j < domNotes.length; j++) {
                var el = domNotes[j];
                var elA = angular.element(el);
                for (var k = reviewers.length - 1; k >= 0; k--) {
                    // make sure its clean, the last one to write on a dom reference is the
                    // right one!
                    elA.removeClass(reviewers[k].classNameOn);
                }
                elA.addClass(reviewer.classNameOn);
                // write into the object to pass classNameHover inside the event handlers
                el.classNameOn = reviewer.classNameOn;
                el.classNameHover = reviewer.classNameHover;
                el.onmouseover = function(ev) {
                    pa.annotationOver(ev, this.classNameOn, this.classNameHover);
                };
                el.onmouseout = function(ev) {
                    pa.annotationOut(ev, this.classNameHover);
                };
                el.onclick = function(ev) {
                    pa.annotationClick(ev, this.classNameOn);
                };
                var count = pa.countFilteredAnnotationPerRef(el.id);
                if (count > 1) {
                    pa.addMoreAnnotationIndicator(el, count);
                }
            }
        }
    };

    pa.clearReviewerFilters = function() {
        var elems = document.querySelectorAll("#rash-root .er_note");
        for (var j = 0; j < elems.length; j++) {
            var ell = angular.element(elems[j]);
            for (var l = 0; l < pa.filteredreviewer.length; l++) {
                ell.removeClass(pa.filteredreviewer[l].classNameOn);
                ell.removeClass(pa.filteredreviewer[l].classNameHover);
            }
            var moreAnn = document.querySelectorAll("#rash-root .moreAnnotations");
            for (var l = 0; l < moreAnn.length; l++) {
                moreAnn[l].remove();
            }
            elems[j].onmouseover = null;
            elems[j].onmouseout = null;
            elems[j].onclick = null;
        }
    };

    pa.updateReviewerFilters = function() {
        pa.clearReviewerFilters();
        pa.paper.filtered_comment_list = pa.filterAnnotations();
        pa.applyReviewerFilters();
    };

    pa.filterAnnotations = function() {
        var list = [];
        for (var i = 0; i < pa.paper.comment_list.length; i++) {
            var comment = pa.paper.comment_list[i];
            var author = comment["author"].substr(7); // remove mailto
            var reviewers = pa.filteredreviewer;
            for (var j = 0; j < reviewers.length; j++) {
                if (reviewers[j].id == author && reviewers[j].show) {
                    list.push(comment);
                }
            }
        }
        return list;
    };

    pa.countFilteredAnnotationPerRef = function(ref) {
        // count how many filtered notes are binded to a dom reference
        var count = 0;
        for (var i = 0; i < pa.paper.filtered_comment_list.length; i++) {
            if (pa.paper.filtered_comment_list[i]["ref"].substr(1) == ref) count++;
        }
        return count;
    };

    /////////////////////////////////////
    // HANDLE ANNOTATION VISUALIZATION //
    /////////////////////////////////////

    pa.generateAnnotationColor = function() {
        function getRandomColor(minHue, maxHue) {
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            // 0 = r, 1 = g, 2 = b
            var rgb = [0, 0, 0];
            // now I want random & different dominant and base colors
            var dominantColor = baseColor = getRandomInt(0, 2);
            while (baseColor == dominantColor) {
                baseColor = getRandomInt(0, 2);
            }
            // assign base&dominant and get a random third color
            for (var i = 0; i < 3; i++) {
                if (i == dominantColor) {
                    rgb[i] = maxHue;
                }
                else if (i == baseColor) {
                    rgb[i] = minHue;
                }
                else {
                    rgb[i] = getRandomInt(minHue, maxHue);
                }
            }
            return rgb;
        }

        // these max&min decides the kind of color we get
        var maxHue = 223;
        var minHue = 136;
        // this value decides how much we want class colors to be try to be different
        var sensibility = 20;

        // generate random color
        var rgb = getRandomColor(minHue, maxHue);

        // make ONE attempt to get our colors different from each other
        pa.lastLabelColors.forEach(function(color) {
            var similar = 0;
            var totalOldColor = 0;
            var totalNewColor = 0;
            for (var i = 0; i < 3; i++) {
                if (color[i] == rgb[i]) similar++;
                totalNewColor += rgb[i];
                totalOldColor += color[i];
            }
            if (similar > 1 && (totalNewColor - totalOldColor > -sensibility && totalNewColor - totalOldColor < sensibility)) {
                // these colors are too similar, try again
                rgb = getRandomColor(minHue, maxHue);
            }
        });
        pa.lastLabelColors.push(rgb);
    };

    pa.generateAnnotationClass = function(l) {
        if (pa.paper.reviewers.length > pa.lastLabelColors.length) pa.generateAnnotationColor();

        var rgb = pa.lastLabelColors[l];

        var bordercolor = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
        var bgcolor = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ', 0.6)';
        var hovercolor = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ', 0.4 )';

        var css = '.er_review' + l + '_on{ background-color: ' + bgcolor + '; border-left: 5px solid  ' + bordercolor + '; } .er_review' + l + '_hover{ background-color: ' + hovercolor + ';}',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        }
        else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    };

    pa.getLabelStyle = function(author) {
        var i = 0;
        pa.filteredreviewer.forEach(function(color, index) {
            if (pa.filteredreviewer[index].id == author) i = index;
        });
        var rgb = pa.lastLabelColors[i];
        var color = {
            'border-left-color': 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
        };
        return color;
    };

    pa.annotationOver = function(ev, classNameOn, classNameHover) {
        ev.preventDefault();
        target = angular.element(ev.target);
        while (!(target.hasClass('er_note') && target.hasClass(classNameOn))) {
            if (target[0].id == "rash-root") return; // emergency exit
            target = target.parent();
        }
        target.addClass(classNameHover);
    };

    pa.annotationOut = function(ev, classNameHover) {
        ev.preventDefault();
        target = angular.element(ev.target);
        while (!target.hasClass(classNameHover)) {
            if (target[0].id == "rash-root") return; // emergency exit
            target = target.parent();
        }
        target.removeClass(classNameHover);
    };

    pa.annotationClick = function(ev, classNameOn) {
        var obj = angular.element(ev.target);
        // make sure to select the note we have filtered
        while (!obj.hasClass(classNameOn)) {
            if (obj[0].id == "rash-root") return; // emergency exit
            obj = obj.parent();
        }
        ev.stopPropagation();
        var sel = window.getSelection();
        // if the selection is not collapsed the user is adding a new annotation
        if (sel.rangeCount == 0 || sel.getRangeAt(0).collapsed) {
            // var text = obj.innerText;
            var id = obj[0].id;
            pa.openShowAnnotation("#" + id);
        }
    }



    pa.addMoreAnnotationIndicator = function(el, num) {
        if (!angular.element(el.firstChild).hasClass("moreAnnotations")) {
            var more = document.createElement("div");
            more.innerHTML = "+" + (num - 1);
            var moreA = angular.element(more);
            moreA.addClass("moreAnnotations");
            el.insertBefore(more, el.firstChild);
        }
        else {
            var more = el.firstChild.innerHTML = "+" + (num - 1);
        }
    };

    /////////////////
    // HANDLE LOCK //
    /////////////////

    pa.changeMode = function() {
        if (pa.lock == true) { // voglio prendere il lock
            LockService.getLock(pa.paperID).success(function(data) {
                pa.mode = 'Annotator';
                Idle.watch(); // start the idle service
                // we need to re-init to get a fresh copy of the paper to edit
                pa.init(true);
            }).error(function(data) {
                openToast($mdToast, "Lock is unavailable, retry later", "error");
                pa.lock = false;
                pa.mode = 'Reader';
            });
        }
        else { // voglio diventare reader
            LockService.releaseLock(pa.paperID).success(function(data) {
                pa.lock = false;
                pa.showMobileIcon = false;
                pa.mode = "Reader";
                Idle.unwatch(); // stop the idle service
                pa.init(true)
            }).error(function(data) {
                openToast($mdToast, "Error try later", "error");

            });
        }
    }

    $scope.$on('IdleStart', function() {
        // open idle modal
        pa.closeDialog();
        // allow only the first timeout event
        $scope.allowIdleTimeout = true;
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: erConfig.templatePath + 'paper/modals/idleWarning.html',
            controller: "PaperController",
            controllerAs: "paperCtrl",
            clickOutsideToClose: true
        })
    });

    $scope.$on('IdleEnd', function() {
        // close idle modal
        pa.closeDialog();
    });

    $scope.$on('IdleTimeout', function() {
        // release the lock (switching to Reader mode)
        if ($scope.allowIdleTimeout) {
            // allow only the first timeout event
            $scope.allowIdleTimeout = false;
            pa.lock = false;
            pa.mode = "Reader";
            pa.changeMode();
            pa.closeDialog();
        }
    });

    $scope.$on('Keepalive', function() {
        // renew the lock
        LockService.getLock(pa.paperID).error(function(data) {
            openToast($mdToast, "Unable to renew the lock, something is wrong", "error");
        });
    });

    //////////////////
    // OPEN DIALOGS //
    //////////////////

    pa.openAddReviewersDialog = function() {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: erConfig.templatePath + 'paper/modals/addReviewers.html',
            controller: "AddReviewersController",
            controllerAs: "arcCtrl",
            locals: {
                paper: pa.paper,
            },
            clickOutsideToClose: true
        });
    };

    pa.openShowAnnotation = function(ref) {
        var annotations = [];
        for (var i = 0; i < pa.paper.comment_list.length; i++) {
            if (ref == pa.paper.comment_list[i]["ref"]) {
                annotations.push(pa.paper.comment_list[i]);
            }
        }
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: erConfig.templatePath + 'paper/modals/showAnnotations.html',
            controller: "ShowAnnotationsController",
            controllerAs: "saCtrl",
            clickOutsideToClose: true,
            locals: {
                paper: pa.paper,
                filteredreviewer: pa.filteredreviewer,
                annotationsToShow: annotations,
                updateReviewerFilters: pa.updateReviewerFilters,
                filterAnnotations: pa.filterAnnotations,
                listAnnotations: pa.listAnnotations,
                mode: pa.mode
            }
        });
    };

    pa.openFilterAnnotations = function(ev) {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: erConfig.templatePath + 'paper/modals/filterAnnotationsModal.html',
            controller: "FiltersController",
            controllerAs: "paperCtrl", // this must stay paperCtrl, don't change it
            clickOutsideToClose: true,
            locals: {
                paper: pa.paper,
                filteredreviewer: pa.filteredreviewer,
                updateReviewerFilters: pa.updateReviewerFilters,
                openShowAnnotation: pa.openShowAnnotation,
                getLabelStyle: pa.getLabelStyle,
                truncateAnnotationText: pa.truncateAnnotationText,
                getReviewerStatusIcon: pa.getReviewerStatusIcon
            }
        })
    };

    pa.showMetadataPaper = function(ev) {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: erConfig.templatePath + 'paper/modals/showPaperMetadata.html',
            controller: "ShowPaperMetadataController",
            controllerAs: "pmCtrl",
            locals: {
                paper: pa.paper,
                getStatusIcon: pa.getStatusIcon,
                getReviewerStatusIcon: pa.getReviewerStatusIcon
            },
            clickOutsideToClose: true
        })
    };



    pa.openFinalChairDecision = function(ev) {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: erConfig.templatePath + 'paper/modals/finalChairDecision.html',
            controller: "ChairDecisionController",
            controllerAs: "cdcCtrl",
            locals: {
                paper: pa.paper,
            },
            clickOutsideToClose: true
        });
    };

    pa.openFinalReviewerDecision = function(ev) {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: erConfig.templatePath + 'paper/modals/finalReviewerDecision.html',
            controller: "ReviewerDecisionController",
            controllerAs: "rdcCtrl",
            locals: {
                paper: pa.paper,
            },
            clickOutsideToClose: true
        })
    };



    pa.showMobileIcon = false;
    pa.triggerAddAnnotation = function() {
        var sel = window.getSelection();
        if (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
            var parentstartnode = sel.anchorNode.parentNode;
            var parentendnode = sel.focusNode.parentNode;
            if (pa.mode == "Reader") {
                openToast($mdToast, "Can't add annotation if you aren't in annotator mode", "error");
                return;
            }
            if (!pa.checkRole('reviewer', pa.paperID)) {
                openToast($mdToast, "Can't add annotation if you aren't a reviewer", "error");
                return;
            }
            if (mobileAndTabletcheck()) {
                if (!pa.showMobileIcon) {
                    pa.showMobileIcon = true;
                    var mobileIcon = document.querySelector("#mobileAddAnnotation");
                    mobileIcon.onclick = function() {
                        var sel = window.getSelection();
                        var parentstartnode = sel.anchorNode.parentNode;
                        var parentendnode = sel.focusNode.parentNode;
                        if (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
                            pa.openAddAnnotation(sel, parentstartnode, parentendnode);
                        }
                        pa.showMobileIcon = false;
                    };
                }
                else {
                    pa.showMobileIcon = false;
                    pa.deselectCurrentSelection();
                }
            }
            else {
                pa.openAddAnnotation(sel, parentstartnode, parentendnode);
            }
        }
        else {
            pa.showMobileIcon = false;
        }
    };

    // Clear the current selection
    pa.deselectCurrentSelection = function() {
        var sel = window.getSelection ? window.getSelection() : document.selection;
        if (sel) {
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
            }
            else if (sel.empty) {
                sel.empty();
            }
        }
    };
    
    pa.handleDynamicTag = function(ran){
        var target = ran.commonAncestorContainer;
        var root = document.querySelector("#rash-root");
        var found = false;
        while(target.id!="rash-root"){
            var targetA = angular.element(target);
            if(!found){ 
                if(targetA.hasClass("cgen")){
                    found = true;
                    return true;
                }
                else if (target.nodeName=="H1" || target.nodeName=="H2" || target.nodeName=="H3" || target.nodeName=="H4" || target.nodeName=="H5" || target.nodeName=="H6"){
                    found = true;
                    return true;
                }
                else if(targetA.hasClass("MathJax_Preview") || targetA.hasClass("MathJax") || targetA.hasClass("rash-math") || targetA.attr("type")=="math/mml"){
                    found = true;
                    return true;
                }
            }
            target = target.parentNode;
        }
        return false;
    };
    
    pa.openAddAnnotation = function(sel, parentstartnode, parentendnode) {
        if (parentstartnode.isSameNode(parentendnode)) {
            if(pa.handleDynamicTag(sel.getRangeAt(0))){
                openToast($mdToast, "This element is forbidden, sorry!", "error");
            }
            else {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    templateUrl: erConfig.templatePath + 'paper/modals/addAnnotation.html',
                    controller: "AnnotationController",
                    controllerAs: "annotationCtrl",
                    clickOutsideToClose: true,
                    locals: {
                        sel: sel,
                        updateReviewerFilters: pa.updateReviewerFilters,
                        paper: pa.paper,
                        filterAnnotations: pa.filterAnnotations,
                        listAnnotations: pa.listAnnotations
                    }
                });
            }
        }
        else {
            openToast($mdToast, "Can't select across different elements, sorry!", "error");
        }
    };

    //////////////////////
    // HELPER FUNCTIONS //
    //////////////////////


    pa.downloadPaper = function() {
        //https://stackoverflow.com/questions/8310657/how-to-create-a-dynamic-file-link-for-download-in-javascript
        var name = pa.paperID + ".html";
        PaperService.getPaperContent(pa.paperID, "html").success(function(contents) {
            var blob = new Blob([contents], {
                type: "text/html"
            });

            var dlink = document.createElement('a');
            dlink.download = name;
            dlink.href = window.URL.createObjectURL(blob);
            dlink.onclick = function(e) {
                // revokeObjectURL needs a delay to work properly
                var that = this;
                setTimeout(function() {
                    window.URL.revokeObjectURL(that.href);
                }, 1500);
            };

            dlink.click();
            dlink.remove();
        });

    }

    pa.closeDialog = function() {
        $mdDialog.cancel();
    };

    pa.checkRole = function(role, id) {
        return _storage.checkRole(role, id);
    };

    pa.filterUserPapers = function() {
        var user = _storage.mail();
        PaperService.getPapers().success(function(papers) {
            papers.forEach(function(paper) {
                if (paper.reviewers.indexOf(user) !== -1) {
                    pa.userPapers.push(paper);
                }
            });
        });
    };

    pa.isDecided = function() {
        if (!pa.loading) {
            var state = pa.paper.data.state
            if (state == "pso:accepted-for-publication" || state == "pso:rejected-for-publication") {
                return true
            }
        }
        return false
    };

    pa.isAwaitingDecision = function() {
        if (!pa.loading) {
            var state = pa.paper.data.state;
            if (state == "pso:awaiting-decision") {
                return true;
            }
        }
        return false;
    };

    pa.getState = function() {
        if (!pa.loading) {
            return pa.paper.data.state.substr(4);
        }
        else {
            return "";
        }
    };

    pa.getReviewerStatusIcon = function(mail) {
        return pa.getStatusIcon(pa.reviewStateDict[mail]);
    };

    pa.getStatusIcon = function(state) {
        var iconName, iconClass;
        if (state == 'accepted-for-publication') {
            iconName = 'thumb_up';
            iconClass = 'paper-accepted-icon'; // green material 800
        }
        else if (state == 'rejected-for-publication') {
            iconName = 'thumb_down';
            iconClass = 'paper-rejected-icon'; // red material 500
        }
        else if (state == 'awaiting-decision') {
            iconName = 'hourglass_full';
            iconClass = 'paper-awaiting-decision-icon'; // amber material 500
        }
        else if (state == 'under-review') {
            iconName = 'search';
            iconClass = 'paper-under-review-icon'; // indigo material 500
        }
        else {
            iconName = 'hourglass_full';
            iconClass = 'paper-awaiting-decision-icon'; // amber material 500
        }
        var icon = {
            name: iconName,
            class: iconClass
        };
        return icon;
    };

    pa.getIconStyle = function(state) {
        // needed when the class css rule is overrided by angular
        var iconStyle;
        if (state == 'accepted-for-publication') {
            iconStyle = {
                'color': '#388e3c'
            }; // green material 800
        }
        else if (state == 'rejected-for-publication') {
            iconStyle = {
                'color': '#f44336'
            }; // red material 500
        }
        else if (state == 'awaiting-decision') {
            iconStyle = {
                'color': '#ffc107'
            }; // amber material 500
        }
        else if (state == 'under-review') {
            iconStyle = {
                'color': '#3f51b5'
            }; // indigo material 500
        }
        return iconStyle;
    };

    pa.truncateAnnotationText = function(limit, text) {
        if (text.length > limit) text = text.substring(0, limit) + " [...]";
        return text;
    };

    //////////
    // INIT //
    //////////

    pa.init(false);
});
