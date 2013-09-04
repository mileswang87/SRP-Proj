/**
 * Created with JetBrains WebStorm.
 * User: wangxunn
 * Date: 9/4/13
 * Time: 12:20 PM
 */

function CommentsController($scope){
    $scope.comment = "";
    $scope.addComment = function(){
        $scope.comment = $scope.new_comment;
        $scope.new_comment = "";
    }
}