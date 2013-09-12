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
}else{
    requestURL = location.protocol + '//' + location.host +'/rest/db/SRPParagraph';
    requestURL2 = location.protocol + '//' + location.host +'/rest/db/SRPParagraphCommentRelation'
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
                var temp = {};
                console.log(data);
                for (var i = 0; i < data["record"].length; i ++){
                    var c = data["record"][i]["SRPComments_by_comment_id"];
                    console.log(c.id, c);
                    temp[c.id] = c;
                    if (c["parent_id"] === null){
                        c.level = 0;
                        $scope.comment_list.push(c);
                    }else{
                        c.level = temp[c["parent_id"]].level + 1;
                        var parent_index = $scope.comment_list.indexOf(temp[c["parent_id"]]);
                        $scope.comment_list.splice(parent_index + 1, 0, c);
                    }

                }
                console.log($scope.comment_list);
            })
            .error(function(){
                console.log(arguments);
            });
    };
    $scope.addComment = function (newCommentText) {
        //if (!newCommentText) return;
        //$scope.comments.push({text: newCommentText, isRemoved: false, active: false});
        //$scope.newComment = "";
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
        console.log($scope.activeComment,comment);
    };


}
