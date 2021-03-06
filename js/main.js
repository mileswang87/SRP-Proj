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
        this.loggedIn = false;
        this.reset = function () {
            this.display_name = "Guest";
            this.loggedIn = false;
        };
    }

    /* init App */
    var timeOffset = new Date().getTimezoneOffset();

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
            },
            ajaxDelete: function (service, data, success) {
                return this.ajax("DELETE", service, data, success);
            }

        };
    }]);
    app.service('UserService', UserClass);
    app.directive('compileContent', ['$compile',
        function ($compile) {
            return function (scope, element, attrs) {
                scope.$watch(
                    function (scope) {
                        return scope.$eval(attrs.compileContent);
                    },
                    function (value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    }
                );
            };
        }
        ]);

    /* controllers */
    /* SessionController, will handle user login/logout */
    function SessionController($scope, REST, UserService) {
        $scope.loggedIn = false;
        $scope.in_registration = false;
        $scope.userService = UserService;
        function login_success(data) {
            //console.log(data);
            UserService.display_name = data.display_name;
            UserService.loggedIn = true;
            $scope.loggedIn = true;
        }
        function logout_success() {
            UserService.reset();
            $scope.loggedIn = false;
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
            REST.ajaxDelete('/user/session', {}, logout_success);
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
        $scope.toggleAll = function (setting) {
            var i;
            for (i = 0; i < $scope.paragraphs.length; i++) {
                $scope.paragraphs[i].actived = setting;
            }
        };
        $scope.activeAll = function () {
            $scope.toggleAll(true);
        };
        $scope.closeAll = function () {
            $scope.toggleAll(false);
        };
    }

    /* CommentController */
    /** @namespace $scope.paragraph */
    function CommentController($scope, REST, UserService) {
        var params;
        $scope.userService = UserService;
        $scope.activeComment = null;
        $scope.newCommentType = 0;
        $scope.newCommentHtml = '<form ng-submit="addComment(newComment, newCommentType)">' +
            '<div ng-show="comment.level > 0" style="margin: 10px 0;"><b>Reply to this Comment</b></div>' +
            '<label>Type:</label>' +
            '</label><select class="form-control" ng-model="$parent.newCommentType">' +
            '<option value="0">Comment</option>' +
            '<option value="1">Question</option>' +
            '<option value="2">Answer</option>' +
            '<option value="3">Other</option>' +
            '</select>' +
            '<label class="w100"> Input:<br><textarea rows="5" class="w100" ng-model="$parent.newComment"></textarea></label>' +
            '<input type="submit" class="btn btn-block btn-default" value="Submit"/></form>';

        $scope.comment_list = [];
        $scope.comment_list.push({text: "<<Add comment to this paragraph>>", level: 0, id: "p" + $scope.paragraph.id, path: "", real_path: [], top: true});
        params = {
            "filter": "Path like '" + $scope.paragraph.id + "\\|%'"
        };

        function insertPosition(parent_id) {
            var i,
                insert_position = 0;
            if (parent_id) {
                parent_id = parseInt(parent_id, 10);
            } else {
                parent_id = null;
            }
            for (i = 0; i < $scope.comment_list.length; i++) {
                if ($scope.comment_list[i].id === parent_id) {
                    //find insert position
                    insert_position = i;
                }
            }
            if (insert_position === 0) {
                insert_position = $scope.comment_list.length - 1;
            }

            return insert_position + 1;
        }

        /** @namespace data.record */
        REST.ajaxGet("/db/SRPComments", params, function (data) {
            var i, comment, ip, parent_id;
            for (i = 0; i < data.record.length; i++) {
                comment = data.record[i];
                //comment.path = data.record[i].path.split("|").slice(0, -1);
                comment.real_path = data.record[i].path.split("|").slice(0, -1);
                comment.level = comment.real_path.length;
                comment.create_time_text = new Date((new Date(comment.create_time) - 60000 * timeOffset)).toLocaleString();
                comment.top = false;
                comment.voted = comment.vote > 0;
                //console.log(comment);
                if (comment.real_path.length <= 1) {
                    parent_id = null;
                } else {
                    parent_id = comment.real_path[comment.real_path.length - 1];
                }
                ip = insertPosition(parent_id);
                console.log("insert " + parent_id + " to " + ip, comment);
                $scope.comment_list.splice(ip, 0, comment);
            }
        });
        /* set comment to active */
        $scope.active = function (comment) {
            if ($scope.activeComment === comment.id) {
                $scope.activeComment = null;
            } else {
                $scope.activeComment = comment.id;
               // $compile($scope.newCommentHtml)($scope);
            }
        };

        $scope.voteUp = function (comment) {
            comment.vote += 1;
            comment.voted = true;
        };

        $scope.voteDown = function (comment) {
            comment.vote -= 1;
            comment.voted = true;
        };

        $scope.addComment = function (newCommentText, type) {
            $scope.newComment = "";
            //console.log(newCommentText, type);
            var newComment = {},
                date = new Date(),
                index,
                position = 0,
                i,
                ip,
                parent = null;

            if (newCommentText) {
                $scope.newComment = "";
                newComment.text = newCommentText;
                newComment.vote = 0;
                newComment.type = type;
                newComment.create_time = date.toJSON();
                newComment.create_time_text = new Date((date - 60000 * timeOffset)).toLocaleString();
                newComment.username = UserService.display_name;

                for (i = 0; i < $scope.comment_list.length && parent === null; i++) {
                    if ($scope.comment_list[i].id === $scope.activeComment) {
                        //find parent
                        index = i;
                        position = index;
                        parent = $scope.comment_list[index];
                        if (parent.top) {
                            //add a top level comment
                            newComment.level = 1;
                            //console.log(parent.id.substr(1));
                            newComment.path = parent.id.substr(1) + "|";
                        } else {
                            //add a non-top level comment
                            newComment.level = parent.level + 1;
                            newComment.path = parent.path + parent.id + "|";
                        }
                    }
                }

                ip = insertPosition($scope.activeComment);


                if (parent.top) {
                    //add a top level comment
                    newComment.level = 1;
                    //console.log(parent.id.substr(1));
                    newComment.path = parent.id.substr(1) + "|";
                } else {
                    //add a non-top level comment
                    newComment.level = parent.level + 1;
                    newComment.path = parent.path + parent.id + "|";
                }
                newComment.real_path = newComment.path.split("|").slice(0, -1);
                REST.ajaxPost(
                    '/db/SRPComments',
                    newComment,
                    function (data) {
                        console.log("asdfff", data);
                        newComment.id = data[0].id;
                        $scope.comment_list.splice(ip, 0, newComment);
                        $scope.activeComment = null;
                    }
                );
                //console.log(position);
                //console.log($scope.comment_list);
            }
        };
    }

    /*
     filter: comment_type
     convert int comment.type to corresponding text
    * */

    function toCommentType() {
        /**
         * @return {string}
         */
        function CommentTypeFilter(comment_type) {
            if (typeof comment_type === "string") {
                comment_type = parseInt(comment_type, 10);
            }
            switch (comment_type) {
            case 0:
                return "Comment";
            case 1:
                return "Question";
            case 2:
                return "Answer";
            default:
                return "Other";

            }
        }
        return CommentTypeFilter;
    }


    app.controller("SessionController", SessionController);
    app.controller("ParagraphController", ParagraphController);
    app.controller("CommentController", CommentController);
    app.filter("toCommentType", toCommentType);


}());



