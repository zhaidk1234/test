/**
 * 预加载事件
 */
$(document).ready(function () {
    var zstation = new z3D();
    zstation.initz3D(canvasId, initOption, baseData);
    zstation.start();
    //加载机柜数据
    z3DObj.createEmptyCabinetData(eCData);
});
/**
 * 重新初始化
 */
function threeRestart() {
    $('#' + canvasId).empty();
    zstation = null;
    z3DObj = null;
    zstation = new z3D();
    zstation.initz3D(canvasId, initOption, baseData);
    zstation.start();
}