/**
 * Created with JetBrains WebStorm.
 * User: wangxunn
 * Date: 9/4/13
 * Time: 12:20 PM
 */

function CommentsController($scope){
    $scope.comments = [];
    $scope.numberOfComments = 0;
    $scope.addComment = function (newCommentText) {
        $scope.comments.push({text: newCommentText, isRemoved: false, active: false});
        $scope.newComment = "";
        $scope.numberOfComments += 1;
    };
    $scope.removeComment = function(comment){
        comment.isRemoved = true;
        $scope.numberOfComments -= 1;
    };
    $scope.activeComment = function(comment){
        comment.active = !comment.active;
    };


    $scope.addComment("this is a test comment");
}
