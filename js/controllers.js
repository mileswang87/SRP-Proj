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
        $scope.toggleComments = function(p){
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
//
//function CommentsController($scope){
//    $scope.comments = [];
//    $scope.numberOfComments = 0;
//    $scope.addComment = function (newCommentText) {
//        $scope.comments.push({text: newCommentText, isRemoved: false, active: false});
//        $scope.newComment = "";
//        $scope.numberOfComments += 1;
//        console.log(!$scope.numberOfComments);
//    };
//    $scope.removeComment = function(comment){
//        comment.isRemoved = true;
//        $scope.numberOfComments -= 1;
//    };
//    $scope.activeComment = function(comment){
//        comment.active = !comment.active;
//    };
//
//
//    $scope.addComment("this is a test comment");
//}
