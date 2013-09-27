/**
 * Created with JetBrains WebStorm.
 * User: wangxunn
 * Date: 9/4/13
 * Time: 12:20 PM
 */

/* Set up localhost debug request */
base = "https://dsp-teamlemon.cloud.dreamfactory.com";

if (location.host !== 'dsp-teamlemon.cloud.dreamfactory.com' && false){
//    requestURL = 'paragraphs.json';
//    requestURL2 = "ParagraphCommentRelation.json";
//    requestComments = "";
}else{
    requestURL = base +'/rest/db/SRPParagraph';
    requestURL2 = base +'/rest/db/SRPParagraphCommentRelation';
    requestComments = base +'/rest/db/SRPComments';
}

var myApp = angular.module('SRP', []);
myApp.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});
myApp.service('UserService', function(){
    var userInstance;
    this.user = function(){
        return userInstance;
    }
});

function SessionController($scope, $http, UserService){
    $scope.init = function(){
        $scope.login_success = false;
        $scope.in_registration = false;
        $http({
            method: 'GET',
            url: location.protocol + '//' + location.host +'/rest/user/profile',
            headers:{"X-DreamFactory-Application-Name":"MasterProject"},
            cache: false
        }).success(function(data){
                console.log(arguments);
                UserService.user = data;
                $scope.user = data;
                $scope.login_success = true;
            }).error(function(){
                console.log(arguments);
            })
    };

    $scope.toRegister = function(){
       $scope.in_registration = true;
    };
    $scope.toLogin = function(){
        $scope.in_registration = false;
    };
    $scope.logout = function(){
        //todo
    };
    $scope.submit = function(){
        if ($scope.in_registration){
            //do register
            $http({
                method: 'POST',
                url: location.protocol + '//' + location.host +'/rest/user/register',
                headers:{"X-DreamFactory-Application-Name":"MasterProject"},
                data: {
                    "email":$scope.email,
                    "password":$scope.password,
                    "display_name":$scope.display_name,
                    "last_name":$scope.last_name,
                    "first_name":$scope.first_name
                },
                cache: false
            }).success(function(data){
                    UserService.user = data;
                    $scope.user = data;
                    console.log(arguments);
                    $scope.login_success = true;
                })
                .error(function(){
                    console.log(arguments);
                });
        }else{
            //do login
            $http({
                method: 'POST',
                url: location.protocol + '//' + location.host +'/rest/user/session',
                headers:{"X-DreamFactory-Application-Name":"MasterProject"},
                data: {
                    "email":$scope.email,
                    "password":$scope.password
                },
                cache: false
            }).success(function(data){
                    UserService.user = data;
                    $scope.user = UserService;
                    console.log(arguments,UserService);
                    $scope.login_success = true;
                })
                .error(function(){
                    console.log(arguments);
                });
        }
    };
}

function ParagraphController($scope, $http){
    $scope.init = function(){
        $scope.activePid = null;
        $http({
            method: 'GET',
            url: requestURL,
            headers:{"X-DreamFactory-Application-Name":"MasterProject"},
            cache: false
        })
            .success(function(data, status, headers, config){
                $scope.paragraphs = data.record;
            })
            .error(function(){
                console.log(arguments);
            });
    };

    $scope.active = function(p){
        if ($scope.activePid === p.id){
            $scope.activePid = null;
        }else{
            $scope.activePid = p.id;
        }
    };
}

function CommentsController($scope, $http, UserService){
    $scope.init = function(){
        $scope.activeComment = null;
        $scope.comment_list = [];
        $scope.comment_hashmap = {};
        $http({
            method: 'GET',
            url: requestURL2,
            params: {
                "related":"SRPComments_by_comment_id",
                "filter":"paragraph_id="+$scope.paragraph.id
            },
            headers:{"X-DreamFactory-Application-Name":"MasterProject"},
            cache: false
        })
            .success(function(data, status, headers, config){
                for (var i = 0; i < data["record"].length; i ++){
                    var c = data["record"][i]["SRPComments_by_comment_id"];
                    $scope.comment_hashmap[c.id] = c;
                    if (c["parent_id"] === null){
                        c.level = 0;
                        $scope.comment_list.push(c);
                    }else{
                        c.level =  $scope.comment_hashmap[c["parent_id"]].level + 1;
                        var parent_index = $scope.comment_list.indexOf( $scope.comment_hashmap[c["parent_id"]]);
                        $scope.comment_list.splice(parent_index + 1, 0, c);
                    }

                }
            })
            .error(function(){
                console.log(arguments);
            });
    };
    /*
    * add comment
    * 1. post a new comment(newC) to requestComments url
    * 2. post a new relation to requestParagraphCommentRelations url
    * */
    $scope.addComment = function (newCommentText) {
        console.log(UserService.user.display_name);
        if (!newCommentText) return;
        if ($scope.activeComment){
            var parent = $scope.comment_hashmap[$scope.activeComment];
            var parent_index = $scope.comment_list.indexOf(parent);
        }else{
            parent = null;
            parent_index = -2;
        }
        var newC = {
            text: newCommentText,
            parent_id: (parent)? parent.id:null,
            level: (parent)? parent.level+1:0,
            username: UserService.user.display_name,
            rate:0
        };
        $http({
            method: 'POST',
            url: requestComments,
            data: {
                "record":newC
            },
            headers:{"X-DreamFactory-Application-Name":"MasterProject",
            "Content-Type":"application/json"},
            cache: false
        })
            .success(function(data, status, headers, config){
                newC.id = data.record[0].id;
                $scope.comment_list.splice(parent_index + 1, 0, newC);
                $scope.newComment = "";
                        console.log(data);
                        $http({
                            method: 'POST',
                            url: requestURL2,
                            data: {
                                "record":{
                                    "paragraph_id":$scope.paragraph.id,
                                    "comment_id":newC.id
                                }
                            },
                            headers:{"X-DreamFactory-Application-Name":"MasterProject",
                                "Content-Type":"application/json"},
                            cache: false
                        }).success(function(){
                                console.log(arguments);
                            }).error(function(){
                                console.log(arguments);
                            })
                    .error(function(){
                        console.log(arguments);
                    });

                //todo update relations
            })
            .error(function(){
                alert("Guest Cannot leave comments now");
                console.log(arguments);
            });
    };
    $scope.removeComment = function(comment){
        var index = $scope.comments.indexOf(comment);
        $scope.comments.splice(index, 1)
    };
    $scope.active = function(comment){
        if ($scope.activeComment === comment.id){
            $scope.activeComment = null;
        }else{
            $scope.activeComment = comment.id;
        }
    };


}