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

app.controller('DocsController', function($http) {
    var dc = this;
    dc.api = [{
        apiname: null,
        api: []
    }];
    dc.lastApiIndex = 0;
    dc.lastApi = null;
    
    $http.get(erConfig.templatePath + '/api.json').then(function(data){
        dc.lastApi = dc.api[dc.lastApiIndex].apiname = data.data[0].api;
        data.data.forEach(function(api){
            if(dc.isNewApi(api.api)){
                dc.lastApiIndex++;
                dc.api.push({
                    apiname: api.api,
                    api: []
                });
            }
            dc.api[dc.lastApiIndex].api.push(api);    
        });       
    });
    
    dc.isNewApi = function(api){
        if(dc.lastApi!=api){
            dc.lastApi = api;
            return true;
        }
        return false;
    };
 
});
