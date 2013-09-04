/**
 * Created with JetBrains WebStorm.
 * User: wangxunn
 * Date: 9/4/13
 * Time: 12:20 PM
 */

function CommentsController($scope){
    $scope.comments = [];
    $scope.addComment = function(){
        $scope.comments.push($scope.new_comment);
        $scope.new_comment = "";
    }
}