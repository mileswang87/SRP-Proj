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
            p.cls="";
        }else{
            $scope.activePid = p.id;
            p.cls="active";
        }
    };
}

function CommentsController($scope, $http){
    $scope.init = function(){
        $scope.comments = [];
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
                for (var i = 0; i < data["record"].length; i ++){
                    var comment = data["record"][i]["SRPComments_by_comment_id"];
                    comment.comments=[];
                    temp[comment.id] = comment;
                    if (comment["parent_id"] === null){
                        $scope.comments.push(comment);
                    }else{
                        temp[comment["parent_id"]].comments.push(comment);
                    }
                }
            })
            .error(function(){
                console.log(arguments);
            });
    };
    $scope.addComment = function (newCommentText) {
        if (!newCommentText) return;
        $scope.comments.push({text: newCommentText, isRemoved: false, active: false});
        $scope.newComment = "";
    };
    $scope.removeComment = function(comment){
        var index = $scope.comments.indexOf(comment);
        $scope.comments.splice(index, 1)
    };
    $scope.activeComment = function(comment){
        comment.active = !comment.active;
    };


}
