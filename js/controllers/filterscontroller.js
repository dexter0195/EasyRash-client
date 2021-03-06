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

app.controller("FiltersController", function($mdDialog, filteredreviewer, paper, updateReviewerFilters, openShowAnnotation, getLabelStyle, truncateAnnotationText, getReviewerStatusIcon) {
    var fc = this;
    fc.paper = paper;
    fc.filteredreviewer = filteredreviewer;
    fc.updateReviewerFilters = updateReviewerFilters;
    fc.openShowAnnotation = openShowAnnotation;
    fc.truncateAnnotationText = truncateAnnotationText;
    fc.getLabelStyle = getLabelStyle;
    fc.getReviewerStatusIcon = getReviewerStatusIcon;
    
    fc.closeDialog = function() {
        $mdDialog.cancel();
    };
});
