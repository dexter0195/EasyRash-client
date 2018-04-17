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

app.controller("UserChipsController", function(UsersService, filterFilter) {
    var vm = this;
    vm.selectedItem = null;
    vm.searchText = null;
    vm.selectedUsers = [];
    vm.transformChip = transformChip;
    vm.querySearchDeferred = querySearchDeferred;
    vm.users = []; // caching
    function transformChip(chip) {
        if (angular.isObject(chip)) {
            return chip;
        }
    }

    function querySearchDeferred(query) {
        if (vm.users.length > 0) {
            mydata = [];
            vm.users.map(function(el) {
                var canPush = true;
                for (var i = 0; i < vm.selectedUsers.length; i++) {
                    if (vm.selectedUsers[i].mail == el.mail) {
                        canPush = false;
                    }
                }
                if (canPush) {
                    mydata.push({
                        mail: el.mail,
                        family_name: el.family_name,
                        given_name: el.given_name
                    });
                }
            });
            data = filterFilter(mydata, query);
            return data;
        }
        else {
            return UsersService.getUsers().then(function(response) {
                if (query) {
                    mydata = [];
                    response.data.map(function(el) {
                        mydata.push({
                            mail: el.mail,
                            family_name: el.family_name,
                            given_name: el.given_name
                        });
                    });
                    vm.users = mydata;
                    data = filterFilter(mydata, query);
                    return data;
                }
                else {
                    return ([{
                        family_name: 'None',
                        given_name: 'None',
                        mail: 'None'
                    }]);
                }
            });
        }
    }
});
