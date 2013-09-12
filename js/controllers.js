/**
 * Created with JetBrains WebStorm.
 * User: wangxunn
 * Date: 9/4/13
 * Time: 12:20 PM
 */

function ParagraphController($scope, $http){
    $http.get('paragraphs.json').success(function(data, status, headers, config){
        $scope.activePid = null;
        $scope.paragraphs = data.paragraphs;
        $scope.active = function(p){
            if ($scope.activePid === p.pid){
                $scope.activePid = null;
                p.cls="";
            }else{
                $scope.activePid = p.pid;
                p.cls="active";
            }
        };

    });

}

function CommentsController($scope){
    $scope.comments = [];
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
