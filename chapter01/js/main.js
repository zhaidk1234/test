/**
 * 预加载事件
 */
$(document).ready(function () {
    var zstation = new z3D();
    zstation.initz3D(canvasId, initOption, baseData);
    zstation.start();
});