/**
 * Created with JetBrains WebStorm.
 * User: wangxunn
 * Date: 9/4/13
 * Time: 12:20 PM
 */

/* Set up localhost debug request */
if (location.host !== 'dsp-teamlemon.cloud.dreamfactory.com'){
    requestURL = 'paragraphs.json';
    requestURL2 = "ParagraphCommentRelation.json";
    requestComments = "";
}else{
    requestURL = location.protocol + '//' + location.host +'/rest/db/SRPParagraph';
    requestURL2 = location.protocol + '//' + location.host +'/rest/db/SRPParagraphCommentRelation'
    requestComments = location.protocol + '//' + location.host +'/rest/db/SRPComments'
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

function SessionController($scope, $http){
    $scope.init = function(){
        $scope.login_success = false;
        $http({
            method: 'GET',
            url: location.protocol + '//' + location.host +'/rest/user/profile',
            headers:{"X-DreamFactory-Application-Name":"MasterProject"},
            cache: false
        }).success(function(){
                $scope.login_success = true;
            })
    };
    $scope.login = function(){
        $http({
            method: 'POST',
            url: location.protocol + '//' + location.host +'/rest/user/session',
            headers:{"X-DreamFactory-Application-Name":"MasterProject"},
            data: {
                "email":$scope.email,
                "password":$scope.password
            },
            cache: false
        }).success(function(){
                $scope.login_success = true;
            })
    }
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

function CommentsController($scope, $http){
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
                $http({
                    method: 'POST',
                    url: requestComments,
                    data: {
                        "record":newC
                    },
                    headers:{"X-DreamFactory-Application-Name":"MasterProject",
                        "Content-Type":"application/json"},
                    cache: false
                }).success(function(){
                        //todo
                    }
                ).error(function(){
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
