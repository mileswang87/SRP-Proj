/**
 * Created with JetBrains WebStorm.
 * User: wangxunn
 * Date: 9/27/13
 * Time: 12:33 AM
 */

/*global angular, console*/
/*jslint plusplus: true */
(function () {
    "use strict";
    /* classes */
    function UserClass() {
        this.display_name = "Guest";
    }

    /* init App */
    var app = angular.module("srp-app", []);
    app.factory("REST", ['$http', function ($http) {
        return {
            ajax: function (method, service, data, success) {
                var base = "https://dsp-teamlemon.cloud.dreamfactory.com/rest",
                    key,
                    p = {
                        'method': method,
                        'url': base + service,
                        headers: {"X-DreamFactory-Application-Name": "MasterProject"},
                        cache: false
                    };
                if (method === "POST") {
                    p.headers["Content-Type"] = "application/json";
                    p.data = data;
                } else if (method === "GET") {
                    if (data) {
//                        for (key in data) {
//                            if (data.hasOwnProperty(key)) {
//                                data[key] = $sanitize(data[key]);
//                            }
//                        }
                        p.params = data;
                    }
                }
                console.log(p);
                $http(p).success(success)
                    .error(function () {
                        console.log(arguments);
                    });
            },
            ajaxGet: function (service, params, success) {
                return this.ajax("GET", service, params, success);
            },
            ajaxPost: function (service, data, success) {
                return this.ajax("POST", service, data, success);
            }

        };
    }]).service('UserService', UserClass);

    /* controllers */
    /* SessionController, will handle user login/logout */
    function SessionController($scope, REST, UserService) {
        $scope.loggedIn = false;
        $scope.in_registration = false;
        $scope.userService = UserService;
        function login_success(data) {
            console.log(data);
            UserService.user = data;
            $scope.loggedIn = true;
        }
        REST.ajaxGet('/user/profile', {}, login_success);
        $scope.login = function () {
            REST.ajaxPost(
                '/user/session',
                {
                    "email": $scope.email,
                    "password": $scope.password
                },
                login_success
            );
        };
        $scope.toRegister = function () {
            $scope.in_registration = true;
        };
        $scope.toLogin = function () {
            $scope.in_registration = false;
        };
        $scope.logout = function () {
            //todo
        };
    }

    /* paragraphController */
    function ParagraphController($scope, REST) {
        REST.ajaxGet('/db/SRPParagraph', null, function (data) {
            $scope.paragraphs = data.record;
        });
        $scope.toggle = function (p) {
            p.actived = !p.actived;
        };
        $scope.toggleAll = function (p) {
            var i;
            for (i = 0; i < $scope.paragraphs.length; i++) {
                $scope.paragraphs[i].actived = true;
            }
        };
    }

    /* CommentController */
    /** @namespace $scope.paragraph */
    function CommentController($scope, REST, UserService) {
        var params;
        $scope.activeComment = null;
        $scope.comment_list = [];
        $scope.comment_list.push({text: "Topic", level: "0", id: 0});
        params = {
            "filter": "Path like '" + $scope.paragraph.id + "\\|%'"
        };
        REST.ajaxGet("/db/SRPComments", params, function (data) {
            var i, comment;
            for (i = 0; i < data.record.length; i++) {
                comment = data.record[i];
                comment.path = data.record[i].path.split("|").slice(0, -1);
                comment.level = comment.path.length;
                $scope.comment_list.push(data.record[i]);
            }
        });
        /* set comment to active */
        $scope.active = function(comment) {
            if ($scope.activeComment === comment.id) {
                $scope.activeComment = null;
            }else{
                $scope.activeComment = comment.id;
            }
        }
    }


    app.controller("SessionController", SessionController);
    app.controller("ParagraphController", ParagraphController);
    app.controller("CommentController", CommentController);

}());



