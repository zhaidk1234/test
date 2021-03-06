/**
 * 作者:Mr.Zhai
 * 创建时间:2018年1月11日
 * 版本：V0.0.1.bug
 * 功能描述:用户创建three组态
 */

/**
 * 使用方式
 * var zstation=new z3D();
 * zstation.initz3D('divid',{...},[datajson]);
 * zstation.start();
 */
function z3D() {}
var z3DObj = null;
var editState = 0; //编辑状态，0为不可编辑，1为可编辑
var moveState = 0; //机柜移动状态，0为不可移动，1为可移动
var cabinetRateState = 0; //机柜利用状态, 0为不显示,1为显示
var serverRateState = 0; //服务器利用状态, 0为不显示,1为显示
var alarmState = 0; //告警信息状态, 0为不显示,1为显示
/**
 * 方法：初始化
 * @param {*} _fId 画布所属div的Id
 * @param {*} _option 参数 {
 *  antialias:true,//抗锯齿效果为设置有效
 *  clearCoolr:0xFFFFFF,
 *  showHelpGrid:false,//是否显示网格线
 * }
 * @param {*} _basedata 基础数据 Json格式 参数 {
 *  objList:true,//对象列表
 *  eventList:0xFFFFFF,//事件对象列表
 *  btns:false,//按钮列表
 * }
 * @param {*} _datajson 需添加数据 Json格式 参数 {
 *  objList:true,//对象列表
 *  eventList:0xFFFFFF,//事件对象列表
 * }
 */
z3D.prototype.initz3D = function (_fId, _option, _basedata, _datajson) {
    //参数处理
    this.option = new Object();
    this.option.antialias = _option.antialias || true; //抗锯齿效果为设置有效
    this.option.clearCoolr = _option.clearCoolr || 0x1b7ace; //背景色
    this.option.showHelpGrid = _option.showHelpGrid || false; //是否显示网格线

    //对象
    this.fId = _fId; //div容器id
    this.width = $(document.body).width();
    this.height = $(document.body).height();
    this.renderer = null; //渲染器
    this.camera = null; //摄像机
    this.scene = null; //场景
    this.stats = null; //性能插件
    this.objects = [];
    this.splineOutline = null; //曲线输出线
    this.splineHelperObjects = []; //曲线辅助数组
    this.ARC_SEGMENTS = 200; //节点最大值
    this.splineMesh = null; //曲线
    this.splines = {}; //曲线对象
    this.splinePointsLength = 4; //曲线初始化节点数量
    this.positions = []; //
    this.wallpoints = []; //墙体点位数据
    this.serverRotation = null; //服务器旋转角度
    this.cabinetHeight = 200; //服务器旋转角度

    this.mouseClick = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.controls = null; //鼠标控制器
    this.transformControl = null; //变换控制器
    this.dragControl = null; //拖动控制器
    this.SELECTED = null; //选中物体
    this.INTERSECTED = null; //鼠标覆盖物体

    this.basedata = _basedata; //基础数据渲染 
    this.datajson = _datajson; //需添加数据



    this.hiding = null; //拖动组件隐藏状态
    this.cabinetRateBoxHelpers = []; //对象辅助线集合
    this.cabinetRateCube = []; //生成对象集合
    this.serversRateCubeArr = []; //机柜利用率

    this.alarmTipsArr = []; //告警标志
    this.alarmServersArr = []; //告警标志

    var _this = this;
};

/**
 * 启动three
 */
z3D.prototype.start = function () {
    //此处用于判断浏览器
    if (!Detector.webgl) {
        var warning = Detector.getWebGLErrorMessage();
        document.getElementById(_this.fId).appendChild(warning);
        return;
    }

    //开始
    var _this = this;
    z3DObj = _this;

    _this.initThree(_this.fId); //渲染器
    _this.initStats(_this.fId); //性能监视器
    _this.initCamera();
    _this.initScene();
    _this.initLight(); //光线
    _this.initHelpGrid(); //辅助网格
    _this.initObject();
    //添加3D基础对象
    $.each(_this.basedata.objList, function (index, _obj) {
        _this.InitAddBaseObject(_obj);
    });
    _this.initMouseCtrl(); //鼠标控制器
    _this.initTransformControl(); //变换控制器
    //_this.initDragControl(); //拖动控制器
    _this.initResize(_this.fId);
    _this.addBtns(_this.basedata.btns); //创建按钮

    _this.animation(); //循环渲染界面
};

/**
 * 初始化渲染器
 */
z3D.prototype.initThree = function () {
    var _this = this;
    _this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: _this.option.antialias
    });
    _this.renderer.setSize(_this.width, _this.height); //设置画布大小
    $("#" + _this.fId).append(_this.renderer.domElement);
    _this.renderer.setClearColor(_this.option.clearCoolr, 1.0);
    _this.renderer.shadowMap.enabled = true; //阴影
    _this.renderer.shadowMapSoft = true;
    //鼠标事件监听
    _this.renderer.domElement.addEventListener('mousedown', _this.onDocumentMouseDown, false);
    _this.renderer.domElement.addEventListener('mousemove', _this.onDocumentMouseMove, false);
    _this.renderer.domElement.addEventListener('mouseover', function (event) {
        _this.controls.enabled = true;
    });
    _this.renderer.domElement.addEventListener('mouseout', function (event) {
        _this.controls.enabled = false;
    });
};

/**
 * 初始化性能监视器
 */
z3D.prototype.initStats = function () {
    var _this = this;
    _this.stats = new Stats();
    _this.stats.domElement.style.position = 'absolute';
    _this.stats.domElement.style.top = '0px';
    _this.stats.domElement.style.left = '0px';
    $("#" + _this.fId).append(_this.stats.domElement);
};

/**
 * 初始化摄像机
 */
z3D.prototype.initCamera = function () {
    var _this = this;
    _this.camera = new THREE.PerspectiveCamera(45, _this.width / _this.height, 1, 10000); //透视摄像投影
    _this.camera.name = 'mainCamera';
    _this.camera.position.x = 0;
    _this.camera.position.y = 1000;
    _this.camera.position.z = 1800;
    _this.camera.up.x = 0;
    _this.camera.up.y = 1;
    _this.camera.up.z = 0;
    _this.camera.lookAt({
        x: 0,
        y: 0,
        z: 0
    });
    _this.objects.push(_this.camera);
};

/**
 * 创建场景
 */
z3D.prototype.initScene = function () {
    var _this = this;
    _this.scene = new THREE.Scene();
};

/**
 * 灯光布置
 * @description{
 * AmbientLight: 环境光，基础光源，它的颜色会被加载到整个场景和所有对象的当前颜色上。
 * PointLight：点光源，朝着所有方向都发射光线
 * SpotLight ：聚光灯光源：类型台灯，天花板上的吊灯，手电筒等
 * DirectionalLight：方向光，又称无限光，从这个发出的光源可以看做是平行光.
 * }
 */
z3D.prototype.initLight = function () {
    var _this = this;

    //方向光
    var light = new THREE.DirectionalLight(0xFF0000, 1.0, 0);
    light.position.set(100, 100, 200);
    _this.scene.add(light);
    // //方向光辅助线
    // var dlightHelper = new THREE.DirectionalLightHelper(light, 500); // 50 is helper size
    // _this.scene.add(dlightHelper);

    //环境光
    var light1 = new THREE.AmbientLight(0xcccccc);
    light.position.set(0, 0, 0);
    _this.scene.add(light1);

    //点光源
    var light2 = new THREE.PointLight(0x555555);
    light2.shadow.camera.near = 1;
    light2.shadow.camera.far = 5000;
    light2.position.set(0, 350, 0);
    light2.castShadow = true; //表示这个光是可以产生阴影的
    _this.scene.add(light2);
    // //点光源辅助线
    // var plightHelper = new THREE.PointLightHelper(light2, 500); // 50 is helper size
    // _this.scene.add(plightHelper);
};

/**
 * 创建网格线
 */
z3D.prototype.initHelpGrid = function () {
    var _this = this;
    if (_this.option.showHelpGrid) {
        //网格辅助线
        var helpGrid = new THREE.GridHelper(1600, 50);
        _this.scene.add(helpGrid);

        //坐标轴辅助线
        var axesHelper = new THREE.AxesHelper(800); // 500 is size
        _this.scene.add(axesHelper);

        //向量辅助线
        // var directionV3 = new THREE.Vector3(1, 0, 1);
        // var originV3 = new THREE.Vector3(0, 200, 0);
        // var arrowHelper = new THREE.ArrowHelper(directionV3, originV3, 100, 0xff0000, 20, 10); // 100 is length, 20 and 10 are head length and width
        // _this.scene.add(arrowHelper);

        //对象辅助线
        // $.each(_this.objects, function (index, _obj) {
        //     if (_obj.type != "PerspectiveCamera") {      
        //         var bboxHelper = new THREE.BoundingBoxHelper(_obj, 0x999999);
        //         _this.scene.add(bboxHelper);
        //     }
        // });

        //相机辅助线
        // var cameraHelper = new THREE.CameraHelper(_this.camera);
        // _this.scene.add(cameraHelper);
    }
};

/**
 * 创建鼠标控制器
 */
z3D.prototype.initMouseCtrl = function () {
    var _this = this;
    _this.controls = new THREE.OrbitControls(_this.camera); //应用OrbitControls插件，实现鼠标控制

    _this.controls.rotateSpeed = 0.1; //角度变换速度
    _this.controls.zoomSpeed = 5; //缩放速度
    _this.controls.panSpeed = 1; //平移速度

    _this.controls.enableZoom = true; //是否允许缩放
    _this.controls.enablePan = true; //是否允许移动
    _this.controls.enableRotate = true; //是否允许旋转

    _this.controls.enableDamping = true; //是否允许缓冲效果
    _this.controls.dampingFactor = 0.1; //缓冲大小

    _this.controls.autoRotate = false; //自动旋转
    _this.controls.autoRotateSpeed = 0.1; //自动旋转速度

    _this.controls.keyPanSpeed = 5; //键盘移动速度
    _this.controls.keys = {
        LEFT: 37, //left arrow
        UP: 38, // up arrow
        RIGHT: 39, // right arrow
        BOTTOM: 40 // down arrow
    };
    _this.controls.enabled = false;
};
/**
 * 变换控制器
 */
z3D.prototype.initTransformControl = function () {
    var _this = this;
    _this.transformControl = new THREE.TransformControls(_this.camera, _this.renderer.domElement);
    _this.transformControl.size = 2; //自定义大小
    //_this.transformControl.axisoption = "XZ"; //自定义拖拽参考面
    //_this.transformControl.addEventListener('change', _this.animation);
    _this.scene.add(_this.transformControl);
    //隐藏变换相关动作
    _this.transformControl.addEventListener('change', function (e) {
        //editState = editState ? 0 : 1; //切换可编辑状态
        _this.initCoordinates(_this.transformControl.object.position); //显示坐标
        _this.commonFunc.delayHideTransform();
    });
    _this.transformControl.addEventListener('mouseDown', function (e) {
        _this.commonFunc.cancelHideTransorm();
    });
    _this.transformControl.addEventListener('mouseUp', function (e) {
        // editState = 0;
        console.log(_this.transformControl.object.position);
        _this.commonFunc.delayHideTransform();
    });
    _this.transformControl.addEventListener('objectChange', function (e) {
        _this.commonFunc.updateSplineOutline();
    });
};
/**
 * 初始化坐标监视器
 */
z3D.prototype.initCoordinates = function (_position) {
    var _this = this;
    //坐标显示拼接
    var html = '';
    html += '<table style="color:#000000;">';
    html += '<tr>';
    html += '<td>X:</td>';
    html += '<td>' + _position.x + '</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td>Y:</td>';
    html += '<td>' + _position.y + '</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td>Z:</td>';
    html += '<td>' + _position.z + '</td>';
    html += '</tr>';
    html += '</table>';
    var cDiv = document.getElementById("Coordinates");
    var p = _this.commonFunc.convertToSceenCoordinate(_position);
    if (cDiv != null) {
        cDiv.style.top = p.y + 10 + 'px';
        cDiv.style.left = p.x + 10 + 'px';
        cDiv.style.display = 'block';
        cDiv.innerHTML = html;
    } else {
        var cooDiv = document.createElement("div");
        cooDiv.id = "Coordinates";
        cooDiv.style.position = 'absolute';
        cooDiv.style.padding = '5px';
        cooDiv.style.backgroundColor = '#f9f21f3d';
        cooDiv.style.display = 'block';
        cooDiv.style.top = p.y + 10 + 'px';
        cooDiv.style.left = p.x + 10 + 'px';
        cooDiv.innerHTML = html;
        $("#" + _this.fId).append(cooDiv);
    }
};
/**
 * 创建告警提示框
 * @param {*} _position 
 * @param {*} _context {
 * 
 * }
 */
z3D.prototype.initAlarmInfo = {
    /**
     * 初始化提示框
     */
    init: function (_obj) {
        var _this = z3DObj;
        if (_obj != null) {
            var _context = _this.initAlarmInfo.findAlarmInfoById(_obj.uuid);
            //坐标显示拼接
            var html = '';
            html += '<table style="color:#000000;">';
            html += '<tr>';
            html += '<td>设备编号:</td>';
            html += '<td>' + _obj.uuid + '</td>';
            html += '</tr>';
            html += '<tr>';
            html += '<td>设备名称:</td>';
            html += '<td>' + _obj.name + '</td>';
            html += '</tr>';
            html += '<tr>';
            html += '<td>告警信息:</td>';
            html += '<td>' + _context + '</td>';
            html += '</tr>';
            html += '</table>';
            var cDiv = document.getElementById("alarmInfo");
            var p = _this.commonFunc.convertToSceenCoordinate({
                x: _obj.parent.position.x,
                y: _obj.position.y,
                z: _obj.parent.position.z
            });
            if (cDiv != null) {
                cDiv.style.top = p.y + 10 + 'px';
                cDiv.style.left = p.x + 10 + 'px';
                cDiv.style.display = 'block';
                cDiv.innerHTML = html;
            } else {
                var cooDiv = document.createElement("div");
                cooDiv.id = "alarmInfo";
                cooDiv.style.position = 'absolute';
                cooDiv.style.padding = '5px';
                cooDiv.style.backgroundColor = '#f9f21f3d';
                cooDiv.style.display = 'block';
                cooDiv.style.top = p.y + 10 + 'px';
                cooDiv.style.left = p.x + 10 + 'px';
                cooDiv.innerHTML = html;
                $("#" + _this.fId).append(cooDiv);
            }
        }
    },
    /**
     * 关闭告警提示窗
     */
    hide: function () {
        var cDiv = document.getElementById("alarmInfo");
        if (cDiv != null) {
            cDiv.style.display = 'none';
        }
    },
    /**
     * 根据设备uuid查找错误信息
     */
    findAlarmInfoById: function (_uuid) {
        var _this = this;
        return '这是错误信息';
    }
};
/**
 * 拖动控制器
 */
z3D.prototype.initDragControl = function (_objs) {
    var _this = this;
    var objs = _objs || _this.splineHelperObjects;
    _this.dragcontrols = new THREE.DragControls(objs, _this.camera, _this.renderer.domElement); //
    _this.dragcontrols.enabled = false;
    _this.dragcontrols.addEventListener('hoveron', function (event) {
        //if (editState != 0) {
        if (moveState != 0) { //可移动状态 
            _this.transformControl.attach(event.object.parent);
        }
        //}
        _this.commonFunc.cancelHideTransorm();
    });
    _this.dragcontrols.addEventListener('hoveroff', function (event) {
        _this.commonFunc.delayHideTransform();
    });
};
/**
 * 控制器回调
 */
z3D.prototype.updateControls = function () {
    var controls = this;
    //controls.update();
};

/**
 * 将元素变为与浏览器相同大小
 */
z3D.prototype.initResize = function () {
    var _this = this;
    var browser_width = $(document.body).width();
    var browser_height = $(document.body).height();
    $("#" + _this.fId).css("width", browser_width);
    $("#" + _this.fId).css("height", browser_height);
    _this.camera.aspect = browser_width / browser_height;
    _this.camera.updateProjectionMatrix();
    _this.renderer.setSize(browser_width, browser_height);
    //元素随窗口变化而变化
    $(window).resize(function () {
        browser_width = $(document.body).width();
        browser_height = $(document.body).height();
        $("#" + _this.fId).css("width", browser_width);
        $("#" + _this.fId).css("height", browser_height);
        _this.camera.aspect = browser_width / browser_height;
        _this.camera.updateProjectionMatrix();
        _this.renderer.setSize(browser_width, browser_height);
    });
};

/**
 * 循环渲染界面
 */
z3D.prototype.animation = function () {
    var _this = z3DObj;
    _this.renderer.clear();
    requestAnimationFrame(_this.animation); //循环渲染
    //渲染告警信息，看向相机镜头
    if (_this.alarmTipsArr.length > 0) {
        $.each(_this.alarmTipsArr, function (index, _tip) {
            _tip.lookAt(_this.camera.position);
        });
    }
    _this.controls.update();
    _this.renderer.render(_this.scene, _this.camera);
    _this.stats.update();
    _this.transformControl.update();
};

/**
 * 增加测试对象
 */
z3D.prototype.initObject = function () {
    var _this = this;
};
/**
 * 读取节点数据
 */
z3D.prototype.initLoadDrawPointObject = function (new_positions) {
    var _this = this;
    while (new_positions.length > _this.positions.length) {
        _this.commonFunc.addPoint();
    }
    while (new_positions.length < _this.positions.length) {
        _this.commonFunc.removePoint();
    }
    for (var i = 0; i < _this.positions.length; i++) {
        _this.positions[i].copy(new_positions[i]);
    }
    _this.commonFunc.updateSplineOutline();
};
/**
 * 添加基础对象
 * @param {*} _obj {
 * show:是否显示，
 * uuid:编码，
 * objType：对象类型，
 * length:长度，
 * width：宽度,
 * height:高度，
 * rotation：旋转角度{direction：旋转基准，degree：旋转角度}
 * x：x轴位置，
 * y：y轴位置，
 * z：z轴位置，
 * style：样式{skinColor：皮肤样式，skin：六面皮肤细节{up,down,fore,behind,left,right}}
 * }
 */
z3D.prototype.InitAddBaseObject = function (_obj) {
    var _this = this;
    if (_obj.show == null || typeof (_obj.show) == 'undefined' || _obj.show) {
        var _tempObj = null;
        switch (_obj.objType) {
            case 'floor':
                _tempObj = _this.CreateFloor(_this, _obj);
                _this.addObject(_tempObj);
                break;
            case 'cube':
                _tempObj = _this.createCube(_this, _obj);
                _this.addObject(_tempObj);
                break;
            case 'wall':
                _this.CreateWall(_this, _obj);
                break;
            case 'plane':
                _tempObj = _this.createPlaneGeometry(_this, _obj);
                _this.addObject(_tempObj);
                break;
            case 'glasses':
                _this.createGlasses(_this, _obj);
                break;
            case 'emptyCabinet':
                _tempObj = _this.createEmptyCabinet(_this, _obj);
                _this.addObject(_tempObj);
                break;
            case 'serverCube':
                _this.createServerCube(_this, _obj);
                break;
            case 'cloneObj':
                _tempObj = _this.commonFunc.cloneObj(_obj.copyfrom, _obj);
                _this.addObject(_tempObj);
                break;
        }
    }
};
/**
 * 创建连接线
 */
z3D.prototype.createLinkLine = function () {

    var _this = this;

    /*******
     * Curves
     *********/
    // for (var i = 0; i < 0; i++) {
    //     _this.commonFunc.addSplineObject(_this.positions[i]);
    // }
    _this.positions = [];
    // for (var i = 0; i < 0; i++) {
    //     _this.positions.push(_this.splineHelperObjects[i].position);
    // }
    var geometry = new THREE.Geometry();
    for (var i = 0; i < _this.ARC_SEGMENTS; i++) {
        geometry.vertices.push(new THREE.Vector3());
    }
    var curve = new THREE.CatmullRomCurve3(_this.positions);
    curve.curveType = 'catmullrom';
    curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35,
        linewidth: 2
    }));
    curve.mesh.castShadow = true;
    _this.splines.uniform = curve;
    _this.splines.uniform.tension = 0; //曲率指数
    for (var k in _this.splines) {
        var spline = _this.splines[k];
        _this.scene.add(spline.mesh);
    }
    // _this.initLoadDrawPointObject([new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
    //     new THREE.Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
    //     new THREE.Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
    //     new THREE.Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746)
    // ]);
    // var geometry = new THREE.Geometry();
    // var material = new THREE.LineBasicMaterial({
    //     vertexColors: THREE.VertexColors
    // });
    // var color1 = new THREE.Color(0x444444),
    //     color2 = new THREE.Color(0xFF0000);

    // // 线的材质可以由2点的颜色决定
    // var p1 = new THREE.Vector3(-100, 0, 100);
    // var p2 = new THREE.Vector3(100, 0, -100);
    // geometry.vertices.push(p1);
    // geometry.vertices.push(p2);
    // geometry.colors.push(color1, color2);

    // var line = new THREE.LineSegments(geometry, material, THREE.LinePieces);
    // // 加入到场景中             
    // _this.scene.add(line);
};
/**
 * 创建地板
 * @param {*} _this 
 * @param {*} _obj 
 */
z3D.prototype.CreateFloor = function (_this, _obj) {
    if (_this == null) {
        _this = this;
    }
    var _cube = _this.createCube(_this, _obj);
    return _cube;
};
/**
 * 创建墙体数据
 * @param {*} _wallpoints 
 */
z3D.prototype.CreateWallData = function (_wallpoints) {
    var _this = this;
    //墙体模板
    var wallbasedata = {
        show: true,
        uuid: "00000000-0000-0000-0000-000000000002",
        name: 'wall',
        objType: 'wall',
        thick: 20,
        length: 100,
        height: 240,
        wallData: [],
        style: {
            skinColor: 0x8ac9e2
        }
    };
    if (_wallpoints.length > 0) {
        //创建墙体基本数据
        for (var i = 0; i < _wallpoints.length - 1; i++) {
            var calRes = _this.commonFunc.calculateAngle(_wallpoints[i], _wallpoints[i + 1]);
            //每一面墙的数据
            var wall = {
                uuid: _this.commonFunc.guid,
                name: 'wall' + i,
                thick: 20,
                height: 240,
                skin: {
                    skin_up: {
                        skinColor: 0xdddddd,
                    },
                    skin_down: {
                        skinColor: 0xdddddd,
                    },
                    skin_fore: {
                        skinColor: 0xb0cee0,
                    },
                    skin_behind: {
                        skinColor: 0xb0cee0,
                    },
                    skin_left: {
                        skinColor: 0xdeeeee,
                    },
                    skin_right: {
                        skinColor: 0xb0cee0,
                    }
                },
                startDot: {
                    x: calRes.p1.x,
                    y: 120,
                    z: calRes.p1.z
                },
                endDot: {
                    x: calRes.p2.x,
                    y: 120,
                    z: calRes.p2.z
                },
                rotation: [{
                    direction: 'y',
                    degree: calRes.angleA
                }] //旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 
            };
            wallbasedata.wallData.push(wall);
        }
    }
    _this.InitAddBaseObject(wallbasedata);
};
/**
 * 创建墙体
 * @param {*} _this 
 * @param {*} _obj 
 */
z3D.prototype.CreateWall = function (_this, _obj) {
    if (_this == null) {
        _this = this;
    }
    var _commonThick = _obj.thick || 40; //墙体厚度
    var _commonLength = _obj.length || 100; //墙体厚度
    var _commonHeight = _obj.height || 300; //强体高度
    var _commonSkin = _obj.style.skinColor || 0x98750f;
    //建立墙面
    $.each(_obj.wallData, function (index, wallobj) {
        var wallLength = _commonLength;
        var wallWidth = wallobj.thick || _commonThick;
        var positionX = ((wallobj.startDot.x || 0) + (wallobj.endDot.x || 0)) / 2;
        var positionY = ((wallobj.startDot.y || 0) + (wallobj.endDot.y || 0)) / 2;
        var positionZ = ((wallobj.startDot.z || 0) + (wallobj.endDot.z || 0)) / 2;
        //z相同 表示x方向为长度
        if (wallobj.startDot.z == wallobj.endDot.z) {
            wallLength = Math.abs(wallobj.startDot.x - wallobj.endDot.x);
            wallWidth = wallobj.thick || _commonThick;
        } else if (wallobj.startDot.x == wallobj.endDot.x) {
            wallLength = wallobj.thick || _commonThick;
            wallWidth = Math.abs(wallobj.startDot.z - wallobj.endDot.z);
        }
        var cubeobj = {
            length: wallLength,
            width: wallWidth,
            height: wallobj.height || _commonHeight,
            rotation: wallobj.rotation,
            x: positionX,
            y: positionY,
            z: positionZ,
            uuid: wallobj.uuid,
            name: wallobj.name,
            style: {
                skinColor: _commonSkin,
                skin: wallobj.skin
            }
        };
        var _cube = _this.createCube(_this, cubeobj);
        if (_this.commonFunc.hasObj(wallobj.childrens) && wallobj.childrens.length > 0) {
            $.each(wallobj.childrens, function (index, walchildobj) {
                var _newobj = null;
                _newobj = _this.CreateHole(_this, walchildobj);
                _cube = _this.mergeModel(_this, walchildobj.op, _cube, _newobj);
            });
        }
        _this.addObject(_cube);
    });
};
/**
 * 挖洞
 * @param {*} _this 
 * @param {*} _obj 
 */
z3D.prototype.CreateHole = function (_this, _obj) {
    if (_this == null) {
        _this = this;
    }
    var _commonThick = 40; //墙体厚度
    var _commonLength = 100; //墙体厚度
    var _commonHeight = 300; //强体高度
    var _commonSkin = 0x98750f;
    //建立墙面
    var wallLength = _commonLength;
    var wallWidth = _obj.thick || _commonThick;
    var positionX = ((_obj.startDot.x || 0) + (_obj.endDot.x || 0)) / 2;
    var positionY = ((_obj.startDot.y || 0) + (_obj.endDot.y || 0)) / 2;
    var positionZ = ((_obj.startDot.z || 0) + (_obj.endDot.z || 0)) / 2;
    //z相同 表示x方向为长度
    if (_obj.startDot.z == _obj.endDot.z) {
        wallLength = Math.abs(_obj.startDot.x - _obj.endDot.x);
        wallWidth = _obj.thick || _commonThick;
    } else if (_obj.startDot.x == _obj.endDot.x) {
        wallLength = _obj.thick || _commonThick;
        wallWidth = Math.abs(_obj.startDot.z - _obj.endDot.z);
    }
    var cubeobj = {
        length: wallLength,
        width: wallWidth,
        height: _obj.height || _commonHeight,
        rotation: _obj.rotation,
        x: positionX,
        uuid: _obj.uuid,
        name: _obj.name,
        y: positionY,
        z: positionZ,
        style: {
            skinColor: _commonSkin,
            skin: _obj.skin
        }
    };
    var _cube = _this.createCube(_this, cubeobj);
    return _cube;
};
/**
 * 模型合并 使用ThreeBSP插件mergeOP计算方式 -表示减去 +表示加上 
 * @param {*} _this 
 * @param {*} mergeOP 
 * @param {*} _fobj 
 * @param {*} _sobj 
 */
z3D.prototype.mergeModel = function (_this, mergeOP, _fobj, _sobj) {
    if (_this == null) {
        _this = this;
    }
    var fobjBSP = new ThreeBSP(_fobj);
    var sobjBSP = new ThreeBSP(_sobj);
    // var sobjBSP = new ThreeBSP(_sobj);
    var resultBSP = null;
    if (mergeOP == '-') {
        resultBSP = fobjBSP.subtract(sobjBSP);
    } else if (mergeOP == '+') {
        var subMesh = new THREE.Mesh(_sobj);
        _sobj.updateMatrix();
        _fobj.geometry.merge(_sobj.geometry, _sobj.matrix);
        return _fobj;
        // resultBSP = fobjBSP.union(sobjBSP);
    } else if (mergeOP == '&') { //交集
        resultBSP = fobjBSP.intersect(sobjBSP);
    } else {
        _this.addObject(_sobj);
        return _fobj;
    }
    var cubeMaterialArray = [];
    for (var i = 0; i < 1; i++) {
        cubeMaterialArray.push(new THREE.MeshLambertMaterial({
            //map: _this.createSkin(128, 128, { imgurl: '../datacenterdemo/res2/'+(i%11)+'.jpg' }),
            vertexColors: THREE.FaceColors
        }));
    }
    var cubeMaterials = new THREE.MeshFaceMaterial(cubeMaterialArray);
    var result = resultBSP.toMesh(cubeMaterials);
    result.material.shading = THREE.FlatShading;
    result.geometry.computeFaceNormals();
    result.geometry.computeVertexNormals();
    result.uuid = _fobj.uuid + mergeOP + _sobj.uuid;
    result.name = _fobj.name + mergeOP + _sobj.name;
    result.material.needsUpdate = true;
    result.geometry.buffersNeedUpdate = true;
    result.geometry.uvsNeedUpdate = true;
    var _foreFaceSkin = null;
    for (var i = 0; i < result.geometry.faces.length; i++) {
        var _faceset = false;
        for (var j = 0; j < _fobj.geometry.faces.length; j++) {
            if (result.geometry.faces[i].vertexNormals[0].x === _fobj.geometry.faces[j].vertexNormals[0].x &&
                result.geometry.faces[i].vertexNormals[0].y === _fobj.geometry.faces[j].vertexNormals[0].y &&
                result.geometry.faces[i].vertexNormals[0].z === _fobj.geometry.faces[j].vertexNormals[0].z &&
                result.geometry.faces[i].vertexNormals[1].x === _fobj.geometry.faces[j].vertexNormals[1].x &&
                result.geometry.faces[i].vertexNormals[1].y === _fobj.geometry.faces[j].vertexNormals[1].y &&
                result.geometry.faces[i].vertexNormals[1].z === _fobj.geometry.faces[j].vertexNormals[1].z &&
                result.geometry.faces[i].vertexNormals[2].x === _fobj.geometry.faces[j].vertexNormals[2].x &&
                result.geometry.faces[i].vertexNormals[2].y === _fobj.geometry.faces[j].vertexNormals[2].y &&
                result.geometry.faces[i].vertexNormals[2].z === _fobj.geometry.faces[j].vertexNormals[2].z) {
                result.geometry.faces[i].color.setHex(_fobj.geometry.faces[j].color.r * 0xff0000 + _fobj.geometry.faces[j].color.g * 0x00ff00 + _fobj.geometry.faces[j].color.b * 0x0000ff);
                _foreFaceSkin = _fobj.geometry.faces[j].color.r * 0xff0000 + _fobj.geometry.faces[j].color.g * 0x00ff00 + _fobj.geometry.faces[j].color.b * 0x0000ff;
                _faceset = true;
            }
        }
        if (_faceset == false) {
            for (var j = 0; j < _sobj.geometry.faces.length; j++) {
                if (result.geometry.faces[i].vertexNormals[0].x === _sobj.geometry.faces[j].vertexNormals[0].x &&
                    result.geometry.faces[i].vertexNormals[0].y === _sobj.geometry.faces[j].vertexNormals[0].y &&
                    result.geometry.faces[i].vertexNormals[0].z === _sobj.geometry.faces[j].vertexNormals[0].z &&
                    result.geometry.faces[i].vertexNormals[1].x === _sobj.geometry.faces[j].vertexNormals[1].x &&
                    result.geometry.faces[i].vertexNormals[1].y === _sobj.geometry.faces[j].vertexNormals[1].y &&
                    result.geometry.faces[i].vertexNormals[1].z === _sobj.geometry.faces[j].vertexNormals[1].z &&
                    result.geometry.faces[i].vertexNormals[2].x === _sobj.geometry.faces[j].vertexNormals[2].x &&
                    result.geometry.faces[i].vertexNormals[2].y === _sobj.geometry.faces[j].vertexNormals[2].y &&
                    result.geometry.faces[i].vertexNormals[2].z === _sobj.geometry.faces[j].vertexNormals[2].z &&
                    result.geometry.faces[i].vertexNormals[2].z === _sobj.geometry.faces[j].vertexNormals[2].z) {
                    result.geometry.faces[i].color.setHex(_sobj.geometry.faces[j].color.r * 0xff0000 + _sobj.geometry.faces[j].color.g * 0x00ff00 + _sobj.geometry.faces[j].color.b * 0x0000ff);
                    _foreFaceSkin = _sobj.geometry.faces[j].color.r * 0xff0000 + _sobj.geometry.faces[j].color.g * 0x00ff00 + _sobj.geometry.faces[j].color.b * 0x0000ff;
                    _faceset = true;
                }
            }
        }
        if (_faceset == false) {
            result.geometry.faces[i].color.setHex(_foreFaceSkin);
        }
        // result.geometry.faces[i].materialIndex = i
    }
    result.castShadow = true;
    result.receiveShadow = true;
    return result;
};


/**
 * 创建盒子体
 * @param {*} _this 
 * @param {*} _obj 
 */
z3D.prototype.createCube = function (_this, _obj) {
    if (_this == null) {
        _this = this;
    }
    var _length = _obj.length || 1000; //默认1000
    var _width = _obj.width || _length;
    var _height = _obj.height || 10;
    var _x = _obj.x || 0,
        _y = _obj.y || 0,
        _z = _obj.z || 0;
    var skinColor = _obj.style.skinColor || 0x98750f;
    var skinOpacity = _obj.style.opacity || 1;
    var cubeGeometry = new THREE.CubeGeometry(_length, _height, _width, 0, 0, 1);

    //六面颜色
    for (var i = 0; i < cubeGeometry.faces.length; i += 2) {
        var hex = skinColor || Math.random() * 0x531844;
        cubeGeometry.faces[i].color.setHex(hex);
        cubeGeometry.faces[i + 1].color.setHex(hex);
    }
    //六面纹理
    var skin_up_obj = {
        vertexColors: THREE.FaceColors,
        transparent: true
    };
    var skin_down_obj = skin_up_obj,
        skin_fore_obj = skin_up_obj,
        skin_behind_obj = skin_up_obj,
        skin_left_obj = skin_up_obj,
        skin_right_obj = skin_up_obj;
    var skin_opacity = 1;
    if (_obj.style != null && typeof (_obj.style) != 'undefined' &&
        _obj.style.skin != null && typeof (_obj.style.skin) != 'undefined') {
        //透明度
        if (_obj.style.skin.opacity != null && typeof (_obj.style.skin.opacity) != 'undefined') {
            skin_opacity = _obj.style.skin.opacity;
            //console.log(skin_opacity);
        }
        //上
        skin_up_obj = _this.createSkinOptionOnj(_this, _length, _width, _obj.style.skin.skin_up, cubeGeometry, 4);
        //下
        skin_down_obj = _this.createSkinOptionOnj(_this, _length, _width, _obj.style.skin.skin_down, cubeGeometry, 6);
        //前
        skin_fore_obj = _this.createSkinOptionOnj(_this, _length, _width, _obj.style.skin.skin_fore, cubeGeometry, 0);
        //后
        skin_behind_obj = _this.createSkinOptionOnj(_this, _length, _width, _obj.style.skin.skin_behind, cubeGeometry, 2);
        //左
        skin_left_obj = _this.createSkinOptionOnj(_this, _length, _width, _obj.style.skin.skin_left, cubeGeometry, 8);
        //右
        skin_right_obj = _this.createSkinOptionOnj(_this, _length, _width, _obj.style.skin.skin_right, cubeGeometry, 10);
    }
    var cubeMaterialArray = [];
    cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_fore_obj));
    cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_behind_obj));
    cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_up_obj));
    cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_down_obj));
    cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_right_obj));
    cubeMaterialArray.push(new THREE.MeshLambertMaterial(skin_left_obj));
    var cubeMaterials = new THREE.MeshFaceMaterial(cubeMaterialArray);
    cube = new THREE.Mesh(cubeGeometry, cubeMaterials); //贴纹理
    cube.transparent = true;
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.uuid = _obj.uuid;
    cube.name = _obj.name;
    cube.position.set(_x, _y, _z);
    if (_obj.rotation != null && typeof (_obj.rotation) != 'undefined' && _obj.rotation.length > 0) {
        $.each(_obj.rotation, function (index, rotation_obj) {
            switch (rotation_obj.direction) {
                case 'x':
                    cube.rotateX(rotation_obj.degree);
                    break;
                case 'y':
                    cube.rotateY(rotation_obj.degree);
                    break;
                case 'z':
                    cube.rotateZ(rotation_obj.degree);
                    break;
                case 'arb':
                    cube.rotateOnAxis(new THREE.Vector3(rotation_obj.degree[0], rotation_obj.degree[1], rotation_obj.degree[2]), rotation_obj.degree[3]);
                    break;
            }
        });
    }

    return cube;
};
/**
 * 创建二维平面-长方形
 * @param {*} _this 
 * @param {*} _obj
 * options={           
 *        width:0,
 *        height:0,
 *        pic:"",
 *        transparent:true,
 *        opacity:1
 *        blending:false,
 *    position: { x:,y:,z:},
 *    rotation: { x:,y:,z:},
 *    }
 */
z3D.prototype.createPlaneGeometry = function (_this, _obj) {

    var options = _obj;
    var texture;
    if (typeof options.pic == "string") { //传入的材质是图片路径，使用 textureloader加载图片作为材质
        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin(this.crossOrigin);
        texture = loader.load(options.pic, function () {}, undefined, function () {});
    } else {
        texture = new THREE.CanvasTexture(options.pic);
    }
    var MaterParam = { //材质的参数
        map: texture,
        overdraw: true,
        side: THREE.FrontSide,
        //blending: THREE.AdditiveBlending,
        transparent: options.transparent,
        //needsUpdate:true,
        //premultipliedAlpha: true,
        opacity: options.opacity
    }
    if (options.blending) {
        MaterParam.blending = THREE.AdditiveBlending; //使用饱和度叠加渲染
    }
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(options.width, options.height, 1, 1),
        new THREE.MeshBasicMaterial(MaterParam)
    );
    plane.position.x = options.position.x;
    plane.position.y = options.position.y;
    plane.position.z = options.position.z;
    plane.rotation.x = options.rotation.x;
    plane.rotation.y = options.rotation.y;
    plane.rotation.z = options.rotation.z;
    return plane;
};
/**
 * 创建机柜数据
 * @param {*} _wallpoints 
 */
z3D.prototype.createEmptyCabinetData = function (_CabinetObj) {
    var _this = this;
    //机柜数据
    var EmptyCabinetData = [];
    if (_CabinetObj.length > 0) {
        //创建机柜基本数据
        for (var i = 0; i < _CabinetObj.length; i++) {
            var cabinetName = 'cabinet' + _this.commonFunc.guid();
            //机柜的数据
            var cabinet = {
                show: _CabinetObj[i].show || true,
                name: _CabinetObj[i].name || cabinetName,
                shellname: _CabinetObj[i].shellname || cabinetName + '_shell',
                uuid: _CabinetObj[i].uuid || _this.commonFunc.guid(),
                rotation: _CabinetObj[i].rotation || [{
                    state: "local", //旋转坐标系（自身local，世界word）
                    direction: 'y', //旋转坐标轴
                    degree: 0.5 * Math.PI //Math.PI 等于180度,沿坐标轴逆时针旋转
                }], //基于坐标轴旋转,
                objType: 'emptyCabinet',
                transparent: _CabinetObj[i].transparent || true,
                size: {
                    length: 66,
                    width: 70,
                    height: _this.cabinetHeight,
                    thick: 2
                },
                position: {
                    x: _CabinetObj[i].position.x || 0,
                    y: 105,
                    z: _CabinetObj[i].position.z || 0
                },
                doors: {
                    doorType: 'lr', // ud上下门 lr左右门 单门可以缺省
                    doorSize: [1],
                    doorname: [cabinetName + '_door_01'],
                    skins: [{
                        skinColor: 0x333333,
                        skin_fore: {
                            imgurl: "images/rack_door_back.jpg",
                        },
                        skin_behind: {
                            imgurl: "images/rack_front_door.jpg",
                        }
                    }]
                },
                skin: {
                    skinColor: 0xff0000,
                    skin_up: {
                        skin: {
                            skinColor: 0xff0000,
                            skin_up: {
                                imgurl: "images/rack_door_back.jpg"
                            },
                            skin_down: {
                                imgurl: "images/rack_door_back.jpg"
                            },
                            skin_fore: {
                                skinColor: 0xff0000,
                                imgurl: "images/rack_door_back.jpg"
                            },
                            skin_behind: {
                                skinColor: 0xff0000,
                                imgurl: "images/rack_door_back.jpg"
                            },
                            skin_left: {
                                imgurl: "images/rack_door_back.jpg"
                            },
                            skin_right: {
                                imgurl: "images/rack_door_back.jpg"
                            },
                        }
                    },
                    skin_down: {
                        skin: {
                            skinColor: 0x333333,
                        }
                    },
                    skin_left: {
                        skin: {
                            skinColor: 0x333333,
                        }
                    },
                    skin_right: {
                        skin: {
                            skinColor: 0x333333,
                        }
                    },
                    skin_behind: {
                        skin: {
                            skinColor: 0x333333,
                        }
                    }
                }
            };
            EmptyCabinetData.push(cabinet);
        }
    }
    //添加3D机柜
    $.each(EmptyCabinetData, function (index, _eCobj) {
        _this.InitAddBaseObject(_eCobj);
    });
};
/**
 * 创建空柜子
 * @param {*} _this 
 * @param {*} _obj
 * 参数demo
 * var _obj = {
 *        show: true,
 *        name: 'test',
 *        uuid: 'test',
 *        rotation: [{
 *            direction: 'y',
 *            degree: 0.25 * Math.PI
 *        }], //旋转     uuid:'',
 *        objType: 'emptyCabinet',
 *        transparent: true,
 *        size: {
 *            length: 50,
 *            width: 60,
 *            height: 200,
 *            thick: 2
 *        },
 *        position: {
 *            x: -220,
 *            y: 105,
 *            z: -150
 *        },
 *        doors: {
 *            doorType: 'lr', // ud门 lr左右门
 *            doorSize: [1],
 *            skins: [{
 *                skinColor: 0x333333,
 *                skin_fore: {
 *                    imgurl: "../datacenterdemo/res/rack_door_back.jpg",
 *                },
 *                skin_behind: {
 *                    imgurl: "../datacenterdemo/res/rack_front_door.jpg",
 *                }
 *            }]
 *        },
 *        skin: {
 *            skinColor: 0xdddddd,
 *            skin: {
 *                skinColor: 0xdddddd,
 *                skin_up: {
 *                    imgurl: "../datacenterdemo/res/rack_door_back.jpg"
 *                },
 *                skin_down: {
 *                    imgurl: "../datacenterdemo/res/rack_door_back.jpg"
 *                },
 *                skin_fore: {
 *                    imgurl: "../datacenterdemo/res/rack_door_back.jpg"
 *                },
 *                skin_behind: {
 *                    imgurl: "../datacenterdemo/res/rack_door_back.jpg"
 *                },
 *                skin_left: {
 *                    imgurl: "../datacenterdemo/res/rack_door_back.jpg"
 *                },
 *                skin_right: {
 *                    imgurl: "../datacenterdemo/res/rack_door_back.jpg"
 *                },
 *            }
 *        }
 *    };
 */
z3D.prototype.createEmptyCabinet = function (_this, _obj) {
    if (_this == null) {
        _this = z3DObj;
    }
    //创建五个面
    //上
    var upobj = {
        show: true,
        uuid: '',
        name: '',
        objType: 'cube',
        length: _obj.size.length + 1,
        width: _obj.size.width,
        height: _obj.size.thick + 1,
        x: _obj.position.x + 1,
        y: _obj.position.y + (_obj.size.height / 2 - _obj.size.thick / 2),
        z: _obj.position.z,
        style: {
            skinColor: _obj.skin.skinColor,
            skin: _obj.skin.skin_up.skin
        }
    };
    var upcube = _this.createCube(_this, upobj);
    //左
    var leftobj = {
        show: true,
        uuid: "",
        name: '',
        objType: 'cube',
        length: _obj.size.length,
        width: _obj.size.thick,
        height: _obj.size.height,
        x: 0,
        y: -(_obj.size.height / 2 - _obj.size.thick / 2),
        z: 0 - (_obj.size.width / 2 - _obj.size.thick / 2) - 1,
        style: {
            skinColor: _obj.skin.skinColor,
            skin: _obj.skin.skin_left.skin
        }
    };
    var leftcube = _this.createCube(_this, leftobj);
    var Cabinet = _this.mergeModel(_this, '+', upcube, leftcube);
    //右
    var Rightobj = {
        show: true,
        uuid: "",
        name: '',
        objType: 'cube',
        length: _obj.size.length,
        width: _obj.size.thick,
        height: _obj.size.height,
        x: 0,
        y: -(_obj.size.height / 2 - _obj.size.thick / 2),
        z: (_obj.size.width / 2 - _obj.size.thick / 2) + 1,
        style: {
            skinColor: _obj.skin.skinColor,
            skin: _obj.skin.skin_right.skin
        }
    };
    var Rightcube = _this.createCube(_this, Rightobj);
    Cabinet = _this.mergeModel(_this, '+', Cabinet, Rightcube);
    //后
    var Behidobj = {
        show: true,
        uuid: "",
        name: '',
        objType: 'cube',
        length: _obj.size.thick,
        width: _obj.size.width,
        height: _obj.size.height,
        x: (_obj.size.length / 2 - _obj.size.thick / 2) + 1,
        y: -(_obj.size.height / 2 - _obj.size.thick / 2),
        z: 0,
        style: {
            skinColor: _obj.skin.skinColor,
            skin: _obj.skin.skin_behind.skin
        }
    };
    var Behindcube = _this.createCube(_this, Behidobj);
    Cabinet = _this.mergeModel(_this, '+', Cabinet, Behindcube);
    //下
    var Downobj = {
        show: true,
        uuid: "",
        name: '',
        objType: 'cube',
        length: _obj.size.length + 1,
        width: _obj.size.width,
        height: _obj.size.thick,
        x: -1,
        y: -(_obj.size.height - _obj.size.thick) - 1,
        z: 0,
        style: {
            skinColor: _obj.skin.skinColor,
            skin: _obj.skin.skin_down.skin
        }
    };
    var Downcube = _this.createCube(_this, Downobj);
    Cabinet = _this.mergeModel(_this, '+', Cabinet, Downcube);

    var tempobj = new THREE.Object3D();
    tempobj.add(Cabinet);
    tempobj.name = _obj.name;
    tempobj.uuid = _obj.uuid;
    Cabinet.name = _obj.shellname;
    Cabinet.uuid = _this.commonFunc.guid();
    _this.objects.push(Cabinet);
    tempobj.position = Cabinet.position;

    //门
    if (_obj.doors != null && typeof (_obj.doors) != 'undefined') {
        var doors = _obj.doors;
        if (doors.skins.length == 1) { //单门
            var singledoorobj = {
                show: true,
                uuid: _this.commonFunc.guid(),
                name: _obj.doors.doorname[0],
                objType: 'cube',
                length: _obj.size.thick,
                width: _obj.size.width,
                height: _obj.size.height,
                x: _obj.position.x - _obj.size.length / 2 - _obj.size.thick / 2,
                y: _obj.position.y,
                z: _obj.position.z,
                style: {
                    skinColor: _obj.doors.skins[0].skinColor,
                    skin: _obj.doors.skins[0]
                }
            };
            var singledoorcube = _this.createCube(_this, singledoorobj);
            if (_obj.rotation != null && typeof (_obj.rotation) != 'undefined' && _obj.rotation.length > 0) {
                singledoorcube.r = _obj.rotation;
            }
            _this.objects.push(singledoorcube);
            tempobj.add(singledoorcube);
        } else if (doors.skins.length > 1) { //多门

        }
    }
    //重绘坐标点，只针对基于XZ平面
    _this.commonFunc.redrawCenter(tempobj);

    if (_obj.rotation != null && typeof (_obj.rotation) != 'undefined' && _obj.rotation.length > 0) {
        $.each(_obj.rotation, function (index, rotation_obj) {
            var rotationState = rotation_obj.state || "word";
            if (rotationState == "word") { //世界坐标
                switch (rotation_obj.direction) {
                    case 'x':
                        tempobj.rotateX(rotation_obj.degree);
                        break;
                    case 'y':
                        tempobj.rotateY(rotation_obj.degree);
                        break;
                    case 'z':
                        tempobj.rotateZ(rotation_obj.degree);
                        break;
                    case 'arb':
                        tempobj.rotateOnAxis(new THREE.Vector3(rotation_obj.degree[0], rotation_obj.degree[1], rotation_obj.degree[2]), rotation_obj.degree[3]);
                        break;
                }
            } else if (rotationState == "local") {
                var cp0 = tempobj.children[0].position;
                var cp1 = tempobj.children[1].position;
                switch (rotation_obj.direction) {
                    case 'x':
                        tempobj.rotateX(rotation_obj.degree);
                        break;
                    case 'y':
                        var cp2 = _this.commonFunc.rotationPoint(cp1, cp0, rotation_obj.degree, "y");
                        tempobj.children[0].position.set(cp0.x, cp0.y, cp0.z);
                        tempobj.children[0].rotateY(rotation_obj.degree);
                        tempobj.children[1].position.set(cp2.x, cp2.y, cp2.z);
                        tempobj.children[1].rotateY(rotation_obj.degree);
                        break;
                    case 'z':
                        tempobj.rotateZ(rotation_obj.degree);
                        break;
                    case 'arb':
                        tempobj.rotateOnAxis(new THREE.Vector3(rotation_obj.degree[0], rotation_obj.degree[1], rotation_obj.degree[2]), rotation_obj.degree[3]);
                        break;
                }
            }
        });
    }
    return tempobj;
};
/**
 * 创建空机柜模型
 * @param {*} _obj 
 * @param {*} _color 
 * @param {*} _alpha 
 * @param {*} _height 
 */
z3D.prototype.createCabinetCube = function (_obj, _color, _alpha, _height) {
    var _this = z3DObj;
    var CabinetCubeName = 'test' + _this.commonFunc.guid();
    var CabinetCubeSkinColor = _color || 0xff0000;
    var CabinetCubeSkinOpacity = _alpha || 0.8;
    var CabinetCubeHeight = _height || 200;
    var cube = {
        show: true,
        name: CabinetCubeName,
        shellname: '_shell',
        uuid: _this.commonFunc.guid(),
        rotation: _this.serverRotation, //基于坐标轴旋转,
        objType: 'cube',
        transparent: true,
        length: 62,
        width: 66,
        height: 2,
        thick: 2,
        x: _obj.position.x || 0,
        y: 0,
        z: _obj.position.z || 0,
        style: {
            skinColor: CabinetCubeSkinColor,
            opacity: CabinetCubeSkinOpacity,
            skin: {
                skin_up: {
                    skinColor: CabinetCubeSkinColor,
                    opacity: CabinetCubeSkinOpacity,
                },
                skin_down: {
                    skinColor: CabinetCubeSkinColor,
                    opacity: CabinetCubeSkinOpacity,
                },
                skin_left: {
                    skinColor: CabinetCubeSkinColor,
                    opacity: CabinetCubeSkinOpacity,
                },
                skin_right: {
                    skinColor: CabinetCubeSkinColor,
                    opacity: CabinetCubeSkinOpacity,
                },
                skin_behind: {
                    skinColor: CabinetCubeSkinColor,
                    opacity: CabinetCubeSkinOpacity,
                }
            }
        }
    };
    _this.InitAddBaseObject(cube);
    //动画展示
    var resObj = z3DObj.commonFunc.findObject(CabinetCubeName);
    new createjs.Tween.get(resObj.scale).to({
        y: CabinetCubeHeight / 2
    }, 1000, createjs.Ease.linear);
    new createjs.Tween.get(resObj.position).to({
        y: CabinetCubeHeight / 2
    }, 1000, createjs.Ease.linear);

    return resObj;
};
/**
 * 清除空机柜模型
 * @param {*} _obj 
 * @param {*} _color 
 * @param {*} _alpha 
 * @param {*} _height 
 */
z3D.prototype.clearCabinetCube = function (_obj) {
    var _this = z3DObj;
    _this.scene.remove(_obj);
    _this.commonFunc.removeInObject('uuid', _obj.uuid);
};

/**
 * 创建服务器数据
 * @param {*} _Pobj 父节点
 * @param {*} _ServerObj 
 */
z3D.prototype.createServerData = function (_Pobj, _ServerObj) {
    var _this = z3DObj;
    //主机所在坐标，针对y坐标
    var parentObj = _Pobj;
    //主机数数据
    var ServerData = [];
    //主机模板
    var serverType = "is_database";
    var serverName = "equipment_card_" + _this.commonFunc.guid();
    var serverHeight = 10;
    var serverRotation = [{
        direction: 'y',
        degree: 0.5 * Math.PI
    }];
    _this.serverRotation = serverRotation;
    var serverSkinBehindUrl = "images/server1.jpg";
    var serverSkinOtherUrl = "images/rack_inside.jpg";
    var serverSkinColor = 0xff0000;
    var cabinetHeight = _this.cabinetHeight;
    var serverStyle = {};
    $.each(_ServerObj, function (index, _sobj) {
        if (_sobj.serverType != null && typeof (_sobj.serverType) != 'undefined') {
            serverType = _sobj.serverType;
        }
        var res = _this.commonFunc.switchServerType(serverType, serverSkinColor, serverSkinOtherUrl);
        serverHeight = res.serverHeight;
        serverSkinBehindUrl = res.serverSkinBehindUrl;
        serverStyle = res.serverStyle;
        cabinetHeight = cabinetHeight - serverHeight;
        var serverObj = {
            show: true,
            uuid: _sobj.uuid || _this.commonFunc.guid(),
            name: _sobj.name || serverName,
            objType: 'serverCube',
            CabinetId: parentObj.uuid,
            length: 60,
            width: 65,
            height: serverHeight,
            x: 0, //parentObj.position.x
            y: cabinetHeight + serverHeight / 2 || 0,
            z: 0, //parentObj.position.z
            rotation: _sobj.rotation || serverRotation, //旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 
            style: _sobj.style || serverStyle
        };
        if (_this.commonFunc.hasObj(_sobj.alarmLevel)) {
            serverObj.alarmLevel = _sobj.alarmLevel;
        }
        ServerData.push(serverObj);
    });

    if (ServerData.length > 0) {
        //添加服务器
        $.each(ServerData, function (index, _sobj) {
            _this.InitAddBaseObject(_sobj);
        });
    }
};
/**
 * 创建服务器
 * @param {*} _this 
 * @param {*} _obj 
 */
z3D.prototype.createServerCube = function (_this, _obj) {
    if (_this == null) {
        _this = z3DObj;
    }
    var _sCube = _this.createCube(_this, _obj);
    _this.objects.push(_sCube);
    var cabinet = _this.commonFunc.findObject3DByUUID(_obj.CabinetId);
    cabinet.add(_sCube);
    //清除原有对象
    _this.commonFunc.removeInObject3D('uuid', _obj.CabinetId);
    _this.scene.remove(cabinet);
    //重新添加对象
    _this.addObject(cabinet);
    //判断是否有告警信息
    if (_this.commonFunc.hasObj(_obj.alarmLevel) && alarmState) {
        var levelColor = _this.commonFunc.switchAlarmLevel(_obj.alarmLevel);
        _this.commonFunc.setSkinColorById(_obj.uuid, levelColor);
        _sCube.isAlarm = true;
        _this.alarmServersArr.push(_sCube);
    }
};
/**
 * 清楚服务器
 * @param {*} _this 
 * @param {*} _obj 
 */
z3D.prototype.clearServerCube = function (_obj) {
    var _this = z3DObj;
    var cabinet = _this.commonFunc.findObject3DByUUID(_obj.uuid);
    //清除原有对象    
    _this.scene.remove(cabinet);
    _this.commonFunc.removeInObject3D('uuid', cabinet.uuid);
    if (cabinet != null) {
        if (_this.commonFunc.hasObj(cabinet.children) && cabinet.children.length > 2) {
            var count = cabinet.children.length;
            //遍历并清楚所有主机
            for (var i = 0; i < count - 2; i++) {
                var sCube = cabinet.children[2];
                cabinet.remove(sCube);
                _this.commonFunc.removeInObject('uuid', sCube.uuid);
            }
        }
    }
    //重新添加对象
    _this.addObject(cabinet);
};
/**
 * 创建玻璃
 * @param {*} _this 
 * @param {*} _obj 
 */
z3D.prototype.createGlasses = function (_this, _obj) {
    if (_this == null) {
        _this = z3DObj;
    }
    var tmpobj = _this.createPlaneGeometry(_this, _obj);
    _this.addObject(tmpobj);
    _obj.rotation.y = Math.PI + _obj.rotation.y;
    var tmpobj2 = _this.createPlaneGeometry(_this, _obj);
    _this.addObject(tmpobj2);
};
/**
 * 创建告警标识
 * @param {*} _obj [{
 * uuid:''
 * pid:''
 * level:''
 * }]
 */
z3D.prototype.createAlarmTips = function (_objs) {
    var _this = z3DObj;
    //清除原有告警
    _this.clearAlarmTips();
    alarmState = alarmState == 0 ? 1 : 0;
    if (_objs != null && _objs.length > 0 && alarmState) {
        $.each(_objs, function (index, _obj) {
            var level = _obj.level || '1';
            var parentCabinet = _this.commonFunc.findObject3DByUUID(_obj.pid);
            var parentServer = _this.commonFunc.findObjectByUUID(_obj.uuid);
            var levelColor = _this.commonFunc.switchAlarmLevel(level);

            //制作告警标志
            var geometry = new THREE.PlaneGeometry(50, 50, 1);
            var texture = new THREE.TextureLoader().load('images/alarmTips.png');
            var material = new THREE.MeshPhongMaterial({
                color: 0x000000,
                emissive: levelColor, //告警表面颜色
                map: texture,
                transparent: true
            });
            var alarmTip = new THREE.Mesh(geometry, material);
            alarmTip.position.set(parentCabinet.position.x, _this.cabinetHeight + 40, parentCabinet.position.z);
            _this.alarmTipsArr.push(alarmTip);
            //转换颜色
            if (parentServer != null) {
                parentServer.isAlarm = true;
                _this.alarmServersArr.push(parentServer);
                _this.commonFunc.setSkinColorById(parentServer.uuid, levelColor);
            }
            _this.addObject(alarmTip);
        });
    }
};
/**
 * 根据告警信息改变服务器颜色
 * @param {*} _obj 
 */
z3D.prototype.createServerAlarmTips = function (_obj, _level) {
    var _this = z3DObj;
    var parentServer = null;
    var level = _level || '1';
    var levelColor = _this.commonFunc.switchAlarmLevel(level);
    if (_this.commonFunc.hasObj(_obj.uuid)) {
        parentServer = _this.commonFunc.findObjectByUUID(_obj.uuid);
    }
    //转换颜色
    if (parentServer != null) {
        _this.commonFunc.setSkinColorById(parentServer.uuid, levelColor);
    }
};
/**
 * 清楚告警信息
 * @param {*} _obj 
 */
z3D.prototype.clearAlarmTips = function () {
    var _this = z3DObj;
    if (_this.alarmTipsArr.length > 0) {
        $.each(_this.alarmTipsArr, function (index, _tip) {
            _this.commonFunc.removeInObject('uuid', _tip.uuid);
            _this.scene.remove(_tip);
        });
        _this.alarmTipsArr = [];
    }
    if (_this.alarmServersArr.length > 0) {
        $.each(_this.alarmServersArr, function (index, _ser) {
            _this.commonFunc.setSkinColorById(_ser.uuid, 0x000000);
            delete _ser.isAlarm;
        });
        _this.alarmServersArr = [];
    }
};
/**
 * 创建皮肤参数对象
 * @param {*} _this 
 * @param {*} flength 长
 * @param {*} fwidth 宽
 * @param {*} _obj 
 * @param {*} _cube 
 * @param {*} _cubefacenub 
 */
z3D.prototype.createSkinOptionOnj = function (_this, flength, fwidth, _obj, _cube, _cubefacenub) {
    if (_this.commonFunc.hasObj(_obj)) {
        if (_this.commonFunc.hasObj(_obj.imgurl)) {
            return {
                map: _this.createSkin(flength, fwidth, _obj),
                transparent: true,
                opacity: _obj.opacity || 1
            };
        } else {
            if (_this.commonFunc.hasObj(_obj.skinColor)) {
                _cube.faces[_cubefacenub].color.setHex(_obj.skinColor);
                _cube.faces[_cubefacenub + 1].color.setHex(_obj.skinColor);
            }
            return {
                vertexColors: THREE.FaceColors,
                transparent: true,
                opacity: _obj.opacity || 1
            };
        }
    } else {
        return {
            vertexColors: THREE.FaceColors,
        };
    }
};
/**
 * 创建皮肤
 * @param {*} flength 
 * @param {*} fwidth 
 * @param {*} _obj 
 */
z3D.prototype.createSkin = function (flength, fwidth, _obj) {
    var imgwidth = 128,
        imgheight = 128;
    if (_obj.width != null && typeof (_obj.width) != 'undefined') {
        imgwidth = _obj.width;
    }
    if (_obj.height != null && typeof (_obj.height) != 'undefined') {
        imgheight = _obj.height;
    }
    var texture = new THREE.TextureLoader().load(_obj.imgurl); //读取图片，制作纹理
    var _repeat = false;
    if (_obj.repeatx != null && typeof (_obj.repeatx) != 'undefined' && _obj.repeatx == true) {
        texture.wrapS = THREE.RepeatWrapping; //水平方向
        _repeat = true;
    }
    if (_obj.repeaty != null && typeof (_obj.repeaty) != 'undefined' && _obj.repeaty == true) {
        texture.wrapT = THREE.RepeatWrapping; //垂直方向
        _repeat = true;
    }
    if (_repeat) {
        texture.repeat.set(flength / imgheight, fwidth / imgheight);
    }
    return texture;
};

/**
 * 添加对象
 * @param {*} _obj 
 */
z3D.prototype.addObject = function (_obj) {
    var _this = z3DObj;
    _this.objects.push(_obj);
    _this.scene.add(_obj);
};

/**
 * 添加按钮
 * @param {*} _btnobjs 
 */
z3D.prototype.addBtns = function (_btnobjs) {
    var _this = z3DObj;
    if (_btnobjs != null && _btnobjs.length > 0) {
        $("#" + _this.fId).after('<div id="toolbar" class="toolbar" ></div>');
        $.each(_btnobjs, function (index, _obj) {
            $("#toolbar").append(' <img src="' + _obj.btnimg + '" title="' + _obj.btnTitle + '" id="' + _obj.btnid + '" />');
            $("#" + _obj.btnid).on("click", _obj.event);
        });
    }
};

/**
 * 视角俯视
 * @param {*} _plan 所控制得平面
 * 
 */
z3D.prototype.viewRecover = function (_plan) {
    var _this = z3DObj;
    var mainCamera = _this.commonFunc.findObject("mainCamera"); //主摄像机
    var controls = _this.controls; //主控制器
    z3D.prototype.changeEditState(_plan);
    controls.enableRotate = true; //允许旋转
    //角度初始化
    var conTarget = new createjs.Tween(controls.target)
        .to(controls.target0, 1000, createjs.Ease.InOut);
    //位置初始化并镜头俯视
    var conPosition = new createjs.Tween(controls.object.position)
        .to(controls.position0, 1000, createjs.Ease.InOut);
    //根据编辑状态，更换视角
    if (editState) {
        conPosition.to({
            x: 0,
            y: 2000,
            z: 0
        }, 1000, createjs.Ease.InOut);
    }
    //镜头聚焦初始化
    mainCamera.lookAt({
        x: 0,
        y: 0,
        z: 0
    });
    controls.enableRotate = editState == 1 ? false : true; //不允许旋转
};
/**
 * 改变编辑状态
 * @param {*} _plan 所控制得平面
 * 
 */
z3D.prototype.changeEditState = function (_plan) {
    var _this = z3DObj;
    // editState = editState == 0 ? 1 : 0; //更改可编辑状态
    // if (editState == 0) {
    moveState = moveState == 0 ? 1 : 0; //更改可移动状态
    if (moveState == 0) {
        _this.transformControl.dispose(); //取消拖拽
        _this.transformControl.detach();
        _this.dragcontrols.enabled = false; //取消控制
        _this.CreateWallData(_this.positions); //创建墙体信息
        _this.commonFunc.cancelEdit();
    } else {
        _this.initTransformControl();
        _this.transformControl.axisoption = _plan;
    }
};
/**
 * 要素位置还原
 * @param {*} _objs 
 * @param {*} _basedata 基础数据
 * @param {*} _datajson 需添加数据
 */
z3D.prototype.meshViewRecover = function (_objs, _basedata, _datajson) {
    var _this = z3DObj;

    var baseDataObjs = null;
    if (_this.commonFunc.hasObj(_basedata)) {
        baseDataObjs = _this.commonFunc.hasObj(_basedata.objList) ? _basedata.objList : null;
    }
    var dataJsonObjs = null;
    if (_this.commonFunc.hasObj(_datajson)) {
        dataJsonObjs = _this.commonFunc.hasObj(_datajson.objList) ? _datajson.objList : null;
    }

    if (baseDataObjs != null) {
        //将基础数据与需添加数据合并
        baseDataObjs = dataJsonObjs != null ? baseDataObjs.concat(dataJsonObjs) : baseDataObjs;
        //遍历并找到动态数据中，对应的Mesh对象
        $.each(_objs, function (index, _obj) {
            if (_obj.uuid != null && _obj._obj != '' && _obj.type == "Mesh") {
                var meshobj = _this.commonFunc.findObjectInData(_obj.uuid, baseDataObjs);
                var Mposition = new createjs.Tween(_obj.position).to({
                    x: meshobj.x,
                    y: meshobj.y,
                    z: meshobj.z,
                }, 1000, createjs.Ease.InOut);
            }
        });
    }
};

/**
 * 通用方法
 */
z3D.prototype.commonFunc = {
    /**
     * 判断对象
     */
    hasObj: function (_obj) {
        if (_obj != null && typeof (_obj) != 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 查找对象
     */
    findObject: function (_objname) {
        var _this = z3DObj;
        //console.log('findObject');
        var findedobj = null;
        $.each(_this.objects, function (index, _obj) {
            if (_obj.name != null && _obj.name != '') {
                if (_obj.name == _objname) {
                    findedobj = _obj;
                    return true;
                }
            }
        });
        return findedobj;
    },
    /**
     * 查找对象
     */
    findObject3DByUUID: function (_uuid) {
        var _this = z3DObj;
        //console.log('findObject');
        var findedobj = null;
        $.each(_this.objects, function (index, _obj) {
            if (_obj.type == "Object3D") {
                if (_obj.uuid != null && _obj.uuid != '') {
                    if (_obj.uuid == _uuid) {
                        findedobj = _obj;
                        return true;
                    }
                }
            }
        });
        return findedobj;
    },
    /**
     * 查找对象
     */
    findObjectByUUID: function (_uuid) {
        var _this = z3DObj;
        //console.log('findObject');
        var findedobj = null;
        $.each(_this.objects, function (index, _obj) {
            if (_obj.type != "Object3D") {
                if (_obj.uuid != null && _obj.uuid != '') {
                    if (_obj.uuid == _uuid) {
                        findedobj = _obj;
                        return true;
                    }
                }
            }
        });
        return findedobj;
    },
    /**
     * 在动态数据中查找对象
     */
    findObjectInData: function (_objuuid, _objs) {
        var _this = z3DObj;
        var findedobj = null;
        $.each(_objs, function (index, _obj) {
            if (_obj.uuid != null && _obj.uuid != '') {
                if (_obj.uuid == _objuuid) {
                    findedobj = _obj;
                    return true;
                }
            }
        });
        return findedobj;
    },
    /**
     * 找到全局变量中objects得某个特定元素
     */
    findIndexOfObject3D: function (_id, _val) {
        var _this = z3DObj;
        for (var i = 0; i < _this.objects.length; i++) {
            if (_this.objects[i].type == "Object3D") {
                if (_this.objects[i][_id] == _val) return i;
            }
        }
        return -1;
    },
    /**
     * 移除全局变量中objects得某个特定元素
     */
    removeInObject3D: function (_id, _val) {
        var _this = z3DObj;
        var index = _this.commonFunc.findIndexOfObject3D(_id, _val);
        if (index > -1) {
            _this.objects.splice(index, 1);
        }
    },
    /**
     * 找到全局变量中objects得某个特定元素
     */
    findIndexOfObject: function (_id, _val) {
        var _this = z3DObj;
        for (var i = 0; i < _this.objects.length; i++) {
            if (_this.objects[i].type != "Object3D") {
                if (_this.objects[i][_id] == _val) return i;
            }
        }
        return -1;
    },
    /**
     * 移除全局变量中objects得某个特定元素
     */
    removeInObject: function (_id, _val) {
        var _this = z3DObj;
        var index = _this.commonFunc.findIndexOfObject(_id, _val);
        if (index > -1) {
            _this.objects.splice(index, 1);
        }
    },
    /**
     * 复制对象
     */
    cloneObj: function (_objname, newparam) {
        /*newparam
        {
            show: true,
            uuid:
            copyfrom: 'cabinet1_1',
            name:
            childrenname:[]
            objType: 'cloneObj',
            position:{x:y:z:}//相对复制品的
            scale:{x:1,y:1,z:1}
            rotation: [{ direction: 'y', degree: 0.25*Math.PI}],//旋转     uuid:'',
        }
        */
        var _this = z3DObj;
        var fobj = _this.commonFunc.findObject(_objname);
        var newobj = fobj.clone();
        if (newobj.children != null && newobj.children.length > 1) {
            $.each(newobj.children, function (index, obj) {
                obj.name = newparam.childrenname[index];
                _this.objects.push(obj);
            });
        }
        //位置
        if (_this.commonFunc.hasObj(newparam.position)) {
            newobj.position.x = newparam.position.x;
            newobj.position.y = newparam.position.y;
            newobj.position.z = newparam.position.z;
        }
        //大小
        if (_this.commonFunc.hasObj(newparam.scale)) {
            newobj.scale.x = newparam.scale.x;
            newobj.scale.y = newparam.scale.y;
            newobj.scale.z = newparam.scale.z;
        }
        //角度
        if (_this.commonFunc.hasObj(newparam.rotation)) {
            $.each(newparam.rotation, function (index, rotation_obj) {
                switch (rotation_obj.direction) {
                    case 'x':
                        newobj.rotateX(rotation_obj.degree);
                        break;
                    case 'y':
                        newobj.rotateY(rotation_obj.degree);
                        break;
                    case 'z':
                        newobj.rotateZ(rotation_obj.degree);
                        break;
                    case 'arb':
                        newobj.rotateOnAxis(new THREE.Vector3(rotation_obj.degree[0], rotation_obj.degree[1], rotation_obj.degree[2]), rotation_obj.degree[3]);
                        break;
                }
            });
        }
        newobj.name = newparam.name;
        newobj.uuid = newparam.uuid;
        return newobj;
    },
    /**
     * 设置表皮颜色
     */
    setSkinColor: function (_objname, _color) {
        var _this = z3DObj;
        var _obj = _this.commonFunc.findObject(_objname);
        if (_obj != null) {
            if (_this.commonFunc.hasObj(_obj.material.emissive)) {
                _obj.material.emissive.setHex(_color);
            } else if (_this.commonFunc.hasObj(_obj.material)) {
                if (_obj.material.length > 0) {
                    $.each(_obj.material, function (index, obj) {
                        obj.emissive.setHex(_color);
                    });
                }
            }
        }
    },
    /**
     * 根据UUID设置表皮颜色
     */
    setSkinColorById: function (_objuuid, _color) {
        var _this = z3DObj;
        var _obj = _this.commonFunc.findObjectByUUID(_objuuid);
        if (_obj != null) {
            if (_this.commonFunc.hasObj(_obj.material.emissive)) {
                _obj.material.emissive.setHex(_color);
            } else if (_this.commonFunc.hasObj(_obj.material)) {
                if (_obj.material.length > 0) {
                    $.each(_obj.material, function (index, obj) {
                        obj.emissive.setHex(_color);
                    });
                }
            }
        }
    },
    /**
     * 添加图片标识
     */
    addIdentification: function (_objname, _obj) {
        /*
        {
            name:'test',
            size:{x:20,y:20},
            position:{x:0,y:100,z:0},
            imgurl: '../datacenterdemo/res/connection.png'
        }
        */
        var _this = z3DObj;
        var _fobj = _this.commonFunc.findObject(_objname);
        var loader = new THREE.TextureLoader();
        var texture = loader.load(_obj.imgurl, function () {}, undefined, function () {});
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            useScreenCoordinates: false
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.name = _obj.name;
        sprite.position.x = _fobj.position.x + _obj.position.x;
        sprite.position.y = _fobj.position.y + _obj.position.y;
        sprite.position.z = _fobj.position.z + _obj.position.z;
        if (_this.commonFunc.hasObj(_obj.size)) {
            sprite.scale.set(_obj.size.x, _obj.size.y);
        } else {
            sprite.scale.set(1, 1);
        }
        _this.addObject(sprite);
    },
    /**
     * 添加文字
     */
    makeTextSprite: function (_objname, parameters) {
        var _this = z3DObj;
        var _fobj = _this.commonFunc.findObject(_objname);
        if (parameters === undefined) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters.fontface : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters.fontsize : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters.borderThickness : 4;
        var textColor = parameters.hasOwnProperty("textColor") ? parameters.textColor : {
            r: 0,
            g: 0,
            b: 0,
            a: 1.0
        };
        var message = parameters.hasOwnProperty("message") ? parameters.message : "helloz3D";
        var x = parameters.hasOwnProperty("position") ? parameters.position.x : 0;
        var y = parameters.hasOwnProperty("position") ? parameters.position.y : 0;
        var z = parameters.hasOwnProperty("position") ? parameters.position.z : 0;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText(message);
        var textWidth = metrics.width;
        context.lineWidth = borderThickness;
        context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
        context.fillText(message, borderThickness, fontsize + borderThickness);
        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            //useScreenCoordinates: false
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.x = _fobj.position.x + x;
        sprite.position.y = _fobj.position.y + y;
        sprite.position.z = _fobj.position.z + z;
        sprite.name = parameters.name;
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        _this.addObject(sprite);
    },
    /**
     * 鼠标所在点的屏幕坐标转化成一个Threejs三维坐标
     */
    convertTo3DCoordinate: function (clientX, clientY) {
        var _this = z3DObj;
        var mv = new THREE.Vector3(
            (clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1,
            0.5);
        mv.unproject(_this.camera); //这句将一个向量转成threejs坐标
        return new THREE.Vector2(mv.x, mv.y);
    },
    /**
     * Threejs三维坐标转化成一个屏幕坐标
     */
    convertToSceenCoordinate: function (_position) {
        var _this = z3DObj;
        var world_vector = new THREE.Vector3(_position.x, _position.y, _position.z);
        var vector = world_vector.project(_this.camera);
        var halfWidth = window.innerWidth / 2;
        var halfHeight = window.innerHeight / 2;
        var result = {
            x: Math.round(vector.x * halfWidth + halfWidth),
            y: Math.round(-vector.y * halfHeight + halfHeight)
        };
        return result;
    },
    /**
     * 延迟隐藏变换
     */
    delayHideTransform: function () {
        var _this = z3DObj;
        _this.commonFunc.cancelHideTransorm();
        _this.commonFunc.hideTransform();
    },
    /**
     * 隐藏变换
     */
    hideTransform: function () {
        var _this = z3DObj;
        _this.hiding = setTimeout(function () {
            var cDiv = document.getElementById("Coordinates");
            if (cDiv != null) {
                cDiv.style.display = 'none';
            }
            _this.transformControl.detach(_this.transformControl.object);
        }, 2500);
    },
    /**
     * 取消隐藏变换
     */
    cancelHideTransorm: function () {
        var _this = z3DObj;
        if (_this.hiding) clearTimeout(_this.hiding);
    },
    /**
     * 更新曲线状态
     */
    updateSplineOutline: function () {
        var _this = z3DObj;
        for (var k in _this.splines) {
            var spline = _this.splines[k];
            _this.splineMesh = spline.mesh;
            for (var i = 0; i < _this.ARC_SEGMENTS; i++) {
                var p = _this.splineMesh.geometry.vertices[i];
                var t = i / (_this.ARC_SEGMENTS - 1);
                spline.getPoint(t, p);
            }
            _this.splineMesh.geometry.verticesNeedUpdate = true;
        }
    },
    /**
     * 增加节点，改变曲线状态
     * @param {*} _point 点的位置
     * @param {*} _isClose 是否为闭合点
     */
    addSplineObject: function (position, _isClose) {
        var _this = z3DObj;
        var material = new THREE.MeshLambertMaterial({
            color: Math.random() * 0xffffff
        });
        var geometry = new THREE.BoxGeometry(20, 20, 20);
        var object = new THREE.Mesh(geometry, material);
        if (_this.position) {
            object.position.copy(_this.position);
        } else if (position) {
            object.position.x = position.x;
            object.position.y = 10;
            object.position.z = position.z;
        } else {
            object.position.x = Math.random() * 1000 - 500;
            object.position.y = Math.random() * 600;
            object.position.z = Math.random() * 800 - 400;
        }
        object.castShadow = true;
        object.receiveShadow = true;
        if (!_isClose) {
            _this.scene.add(object);
        }
        _this.splineHelperObjects.push(object);
        return object;
    },
    /**
     * 增加节点
     * @param {*} _point 点的位置
     * @param {*} _isClose 是否为闭合点
     */
    addPoint: function (_point, _isClose) {
        var _this = z3DObj;
        _this.splinePointsLength++;
        _this.positions.push(_this.commonFunc.addSplineObject(_point, _isClose).position);

        if (_this.positions.length > 1) {
            _this.commonFunc.updateSplineOutline();
        }
    },
    /**
     * 移除节点
     */
    removePoint: function () {
        var _this = z3DObj;
        _this.splinePointsLength--;
        _this.positions.pop();
        _this.scene.remove(_this.splineHelperObjects.pop());
        if (_this.positions.length > 1) {
            _this.commonFunc.updateSplineOutline();
        } else {
            _this.scene.remove(_this.splineMesh);
        }
    },
    /**
     * 移除节点
     */
    cancelEdit: function () {
        var _this = z3DObj;
        console.log(_this.positions);
        if (_this.positions.length > 0) {
            for (var i = _this.positions.length; i > 0; i--) {
                _this.commonFunc.removePoint();
            }
        }
        //初始化曲线参数
        _this.splineOutline = null; //曲线输出线
        _this.splineHelperObjects = []; //曲线辅助数组
        _this.splineMesh = null; //曲线
        _this.splines = {}; //曲线对象
        _this.splinePointsLength = 4; //曲线初始化节点数量
        _this.positions = []; //
        //隐藏坐标点
        var cDiv = document.getElementById("Coordinates");
        if (cDiv != null) {
            cDiv.style.display = 'none';
        }
    },
    /**
     * 根据两点计算角度 
     */
    calculateAngle: function (_pointOne, _pointTwo) {
        //两点坐标
        var x1 = _pointOne.x;
        var y1 = _pointOne.z;
        var x2 = _pointTwo.x;
        var y2 = _pointTwo.z;
        //计算中心点坐标
        var x0 = (x1 + x2) / 2;
        var y0 = (y1 + y2) / 2;
        //两点间距离
        var d = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        //输出点
        var p1 = {
            x: x0 - d / 2,
            y: _pointOne.y,
            z: y0
        };
        var p2 = {
            x: x0 + d / 2,
            y: _pointTwo.y,
            z: y0
        };
        //直角三角形三边边长
        var a = Math.abs(y0 - y1);
        var b = Math.abs(x0 - x1);
        var c = d / 2;
        var angleA = Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2)) / (2 * b * c));
        //返回值为
        var res = {
            p1: p1,
            p2: p2,
            angleA: angleA
        };
        return res;
    },
    /**
     * 根据旋转点，中心点，旋转角度，基准坐标轴，计算旋转点围绕中心点旋转某角度后的坐标()
     * @param
     */
    rotationPoint: function (_rotate, _center, _angle, _axis) {
        var _this = z3DObj;
        var point = null;
        switch (_axis) {
            case 'y':
                point = _this.commonFunc.rotationPointY(_rotate, _center, _angle);
                break;
        }
        return point;
    },
    /**
     * 根据旋转点，中心点，旋转角度，基于y轴计算旋转点围绕中心点旋转某角度后的坐标()
     * @param
     */
    rotationPointY: function (_rotate, _center, _angle) {
        var _this = z3DObj;
        var point = null;
        //两点坐标
        var cx = _center.x;
        var cz = _center.z;
        var x1 = _rotate.x - cx;
        var z1 = _rotate.z - cz;
        //角度
        var a = _angle;
        //计算旋转后坐标
        var x2 = (x1 * Math.cos(a) + z1 * Math.sin(a)) + cx;
        var z2 = (z1 * Math.cos(a) - x1 * Math.sin(a)) + cz;

        point = {
            x: x2,
            y: _rotate.y,
            z: z2
        };
        return point;
    },
    /**
     * 重绘Object3D类中心点,只针对基于XZ平面
     */
    redrawCenter: function (_obj3d) {
        var _this = z3DObj;
        //对象原中心点
        var cp0 = {};
        cp0.x = _obj3d.children[0].position.x;
        cp0.y = _obj3d.children[0].position.y;
        cp0.z = _obj3d.children[0].position.z;

        $.each(_obj3d.children, function (index, _obj) {
            _obj.translateX(-cp0.x);
            //_obj.translateY(-cp0.y);
            _obj.translateZ(-cp0.z);
        });
        _obj3d.position.set(cp0.x, 0, cp0.z);
    },
    /**
     * 根据服务器类型,返回相应数据
     * @returns {}
     */
    switchAlarmLevel: function (_level) {
        var _this = z3DObj;
        var levelColor = 0xff0000;
        switch (_level) {
            case '1':
                levelColor = 0xff0000; //红色
                break;
            case '2':
                levelColor = 0xffff00; //黄色
                break;
            case '3':
                levelColor = 0x0000ff; //蓝色
                break;
        }
        return levelColor;
    },
    /**
     * 根据服务器类型,返回相应数据
     * @returns {}
     */
    switchServerType: function (_type, _color, _url) {
        var _this = z3DObj;
        var serverSkinColor = _color;
        var serverSkinOtherUrl = _url;
        var serverHeight = 0;
        var serverSkinBehindUrl = "";
        var serverStyle = {};
        switch (_type) {
            case 'is_database':
                serverHeight = 10;
                serverSkinBehindUrl = "images/server1.jpg";
                serverStyle = {
                    skinColor: serverSkinColor,
                    skin: {
                        skin_up: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_down: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_fore: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_behind: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinBehindUrl,
                        },
                        skin_left: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_right: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        }
                    }
                };
                break;
            case 'is_server':
                serverHeight = 20;
                serverSkinBehindUrl = "images/server2.jpg";
                serverStyle = {
                    skinColor: serverSkinColor,
                    skin: {
                        skin_up: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_down: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_fore: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_behind: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinBehindUrl,
                        },
                        skin_left: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_right: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        }
                    }
                };
                break;
            case 'Type3':
                serverHeight = 30;
                serverSkinBehindUrl = "images/server3.jpg";
                serverStyle = {
                    skinColor: serverSkinColor,
                    skin: {
                        skin_up: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_down: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_fore: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_behind: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinBehindUrl,
                        },
                        skin_left: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        },
                        skin_right: {
                            skinColor: serverSkinColor,
                            imgurl: serverSkinOtherUrl,
                        }
                    }
                };
                break;
        }
        var res = {
            serverHeight: serverHeight,
            serverSkinBehindUrl: serverSkinBehindUrl,
            serverStyle: serverStyle
        };
        return res;
    },
    gradientColor: function (startColor, endColor, step) {
        var _this = z3DObj;
        startRGB = _this.commonFunc.colorRgb(startColor); //转换为rgb数组模式
        startR = startRGB[0];
        startG = startRGB[1];
        startB = startRGB[2];
        endRGB = _this.commonFunc.colorRgb(endColor);
        endR = endRGB[0];
        endG = endRGB[1];
        endB = endRGB[2];
        sR = (endR - startR) / step; //总差值
        sG = (endG - startG) / step;
        sB = (endB - startB) / step;
        var colorArr = [];
        for (var i = 0; i < step; i++) {
            //计算每一步的hex值 
            var hex = _this.commonFunc.colorHex('rgb(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' + parseInt((sB * i + startB)) + ')');
            colorArr.push(hex);
        }
        return colorArr;
    },
    /**
     * 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
     */
    colorRgb: function (_sColor) {
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var sColor = _sColor.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var j = 1; j < 7; j += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(j, j + 2)));
            }
            return sColorChange;
        } else {
            return sColor;
        }
    },
    /**
     * 将rgb表示方式转换为hex表示方式
     */
    colorHex: function (rgb) {
        var _this = rgb;
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if (/^(rgb|RGB)/.test(_this)) {
            var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, "").split(",");
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                hex = hex < 10 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = _this;
            }
            return strHex;
        } else if (reg.test(_this)) {
            var aNum = _this.replace(/#/, "").split("");
            if (aNum.length === 6) {
                return _this;
            } else if (aNum.length === 3) {
                var numHex = "#";
                for (var i = 0; i < aNum.length; i += 1) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return _this;
        }
    },
    /**
     * RGB转16进制(rgb2hex)
     * 输入：rgb(13,0,255)
     * 输出：0x0d00ff
     */
    colorRGB2Hex: function (_color) {
        var _this = z3DObj;
        var color = _color.toString();
        var hex = '0x' + _this.commonFunc.colorRGBTo16(color);
        return hex;
    },
    /**
     * RGB转16进制(rgb2hex)
     * 输入：rgb(13,0,255)
     * 输出：0x0d00ff
     */
    colorRGBTo16: function (_color) {
        var color = _color.toString();
        var rgb = color.split(',');
        var r = parseInt(rgb[0].split('(')[1]);
        var g = parseInt(rgb[1]);
        var b = parseInt(rgb[2].split(')')[0]);
        var hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    },
    /**
     * 生成UUID
     */
    guid: function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
};

/**
 * 鼠标按下事件
 */
var dbclick = 0;
z3D.prototype.onDocumentMouseDown = function (event) {
    dbclick++;
    var _this = z3DObj;
    var intersects;
    _this.mouseClick.x = (event.clientX / _this.width) * 2 - 1;
    _this.mouseClick.y = -(event.clientY / _this.height) * 2 + 1;
    setTimeout(function () {
        dbclick = 0;
    }, 300);
    event.preventDefault();
    //可编辑时
    if (editState) {
        console.log(_this.mouseClick);
        if (event.button == 0) { //鼠标左键
            var vector = new THREE.Vector3(); //三维坐标对象
            vector.set(_this.mouseClick.x, _this.mouseClick.y, 0.5);
            vector.unproject(_this.camera);
            var raycaster = new THREE.Raycaster(_this.camera.position, vector.sub(_this.camera.position).normalize());
            intersects = raycaster.intersectObjects(_this.scene.children);
            if (intersects.length > 0) {
                var selected = intersects[0]; //取第一个物体
                _this.commonFunc.addPoint(selected.point, false);
            }
        } else if (event.button == 2) { //鼠标右键
            if (_this.positions.length > 0) {
                _this.commonFunc.addPoint(_this.positions[0], true);
            }
        }
    }
    //双击时
    if (dbclick >= 2) {
        _this.raycaster.setFromCamera(_this.mouseClick, _this.camera);
        intersects = _this.raycaster.intersectObjects(_this.objects); //射线和模型求交，选中一系列直线
        if (intersects.length > 0) {
            _this.controls.enabled = false;
            _this.SELECTED = intersects[0].object;
            if (_this.basedata.eventList != null && _this.basedata.eventList.dbclick != null && _this.basedata.eventList.dbclick.length > 0) {
                $.each(_this.basedata.eventList.dbclick, function (index, _obj) {
                    if ("string" == typeof (_obj.obj_name)) {
                        if (_obj.obj_name == _this.SELECTED.name) {
                            _obj.obj_event(_this.SELECTED);
                        }
                    } else if (_obj.findObject != null || 'function' == typeof (_obj.findObject)) {
                        if (_obj.findObject(_this.SELECTED.name)) {
                            _obj.obj_event(_this.SELECTED);
                        }
                    }
                });
            }
            _this.controls.enabled = true;
        }
    }
};

/**
 * 鼠标移动事件
 * @param {*} event 
 */
z3D.prototype.onDocumentMouseMove = function (event) {
    event.preventDefault();
    var _this = z3DObj;
    _this.mouseClick.x = (event.clientX / _this.width) * 2 - 1;
    _this.mouseClick.y = -(event.clientY / _this.height) * 2 + 1;
    _this.raycaster.setFromCamera(_this.mouseClick, _this.camera);

    //当鼠标移入对象时，发生事件
    var intersects = _this.raycaster.intersectObjects(_this.objects);
    if (intersects.length > 0) {
        if (_this.INTERSECTED != intersects[0].object) {
            if (_this.INTERSECTED) {
                if (_this.commonFunc.hasObj(_this.INTERSECTED.name)) {
                    _this.commonFunc.setSkinColor(_this.INTERSECTED.name, _this.INTERSECTED.currentHex);
                }
            }
            _this.INTERSECTED = intersects[0].object;
            var interSectedMaterial = _this.INTERSECTED.material[0] || _this.INTERSECTED.material;
            _this.INTERSECTED.currentHex = _this.commonFunc.hasObj(interSectedMaterial.emissive) ? interSectedMaterial.emissive.getHex() : interSectedMaterial.color.getHex();
            if (_this.commonFunc.hasObj(_this.INTERSECTED.name)) {
                if (_this.basedata.eventList != null && _this.basedata.eventList.mouseMove != null && _this.basedata.eventList.mouseMove.length > 0) {
                    $.each(_this.basedata.eventList.mouseMove, function (index, _obj) {
                        if ("string" == typeof (_obj.obj_name)) {
                            if (_obj.obj_name == _this.INTERSECTED.name) {
                                _obj.obj_event(_this.INTERSECTED);
                            }
                        } else if (_obj.findObject != null || 'function' == typeof (_obj.findObject)) {
                            if (_obj.findObject(_this.INTERSECTED.name)) {
                                _obj.obj_event(_this.INTERSECTED);
                            }
                        }
                    });
                }
            }
            //是否报警
            if (_this.commonFunc.hasObj(_this.INTERSECTED.isAlarm) && _this.INTERSECTED.isAlarm) {
                _this.initAlarmInfo.init(_this.INTERSECTED);
            } else {
                _this.initAlarmInfo.hide();
            }
        }
    } else {
        if (_this.INTERSECTED) {
            if (_this.commonFunc.hasObj(_this.INTERSECTED.name)) {
                _this.commonFunc.setSkinColor(_this.INTERSECTED.name, _this.INTERSECTED.currentHex);
            }
        }
        _this.INTERSECTED = null;
    }
};
/**
 * 打开右大门
 * @param {*} _obj 
 * @param {*} func 
 */
z3D.prototype.openRightDoor = function (_obj, func) {
    var doorstate = "close";
    var tempobj = null;
    if (_obj.doorState != null && typeof (_obj.doorState) != 'undefined') {
        doorstate = _obj.doorState;
        tempobj = _obj.parent;
    } else {
        console.log("add parent");
        var _objparent = _obj.parent;
        tempobj = new THREE.Object3D();
        tempobj.position.set(_obj.position.x - _obj.geometry.parameters.width / 2, _obj.position.y, _obj.position.z);
        _obj.position.set(_obj.geometry.parameters.width / 2, 0, 0);
        tempobj.add(_obj);
        _objparent.add(tempobj);
    }
    _obj.doorState = (doorstate == "close" ? "open" : "close");
    new createjs.Tween(tempobj.rotation).to({
        y: (doorstate == "close" ? -0.25 * 2 * Math.PI : -0 * 2 * Math.PI)
    }, 10000, createjs.Ease.elasticOut);
};
/**
 * 打开左大门
 * @param {*} _obj 
 * @param {*} func 
 */
z3D.prototype.openLeftDoor = function (_obj, func) {
    var doorstate = "close";
    var tempobj = null;
    if (_obj.doorState != null && typeof (_obj.doorState) != 'undefined') {
        doorstate = _obj.doorState;
        tempobj = _obj.parent;
    } else {
        //console.log("add parent");
        var _objparent = _obj.parent;
        tempobj = new THREE.Object3D();
        tempobj.position.set(_obj.position.x + _obj.geometry.parameters.width / 2, _obj.position.y, _obj.position.z);
        _obj.position.set(-_obj.geometry.parameters.width / 2, 0, 0);
        tempobj.add(_obj);
        _objparent.add(tempobj);
    }
    _obj.doorState = (doorstate == "close" ? "open" : "close");
    new createjs.Tween(tempobj.rotation).to({
        y: (doorstate == "close" ? 0.25 * 2 * Math.PI : -0 * 2 * Math.PI)
    }, 10000, createjs.Ease.elasticOut);
};
/**
 * 打开机柜门
 * @param {*} _obj 
 * @param {*} func 
 */
z3D.prototype.opcabinetdoor = function (_obj, _serverData, func) {
    var _this = z3DObj;
    var doorstate = "close";
    var tempobj = null;
    if (_obj.doorState != null && typeof (_obj.doorState) != 'undefined') {
        doorstate = _obj.doorState;
        tempobj = _obj.parent;
    } else {
        //console.log("add parent");
        var _objparent = _obj.parent;
        tempobj = new THREE.Object3D();
        tempobj.pid = _obj.parent.uuid;
        tempobj.pPosition = _obj.parent.position;
        var R = _obj.geometry.parameters.depth / 2;
        if (_obj.r != null && typeof (_obj.r) != 'undefined' && _obj.r.length > 0) {
            $.each(_obj.r, function (index, rotation_obj) {
                switch (rotation_obj.direction) {
                    case 'x':
                        break;
                    case 'y':
                        var x = R * Math.sin(rotation_obj.degree);
                        var z = R * Math.cos(rotation_obj.degree);
                        tempobj.position.set(_obj.position.x + x, _obj.position.y, _obj.position.z + z);
                        _obj.position.set(-x, 0, -z);
                        break;
                    case 'z':
                        break;
                    case 'arb':
                        break;
                }
            });
        } else {
            tempobj.position.set(_obj.position.x, _obj.position.y, _obj.position.z + _obj.geometry.parameters.depth / 2);
            _obj.position.set(0, 0, -_obj.geometry.parameters.depth / 2);
        }
        tempobj.add(_obj);
        _objparent.add(tempobj);
    }
    _obj.doorState = (doorstate == "close" ? "open" : "close");
    //获得门所在得Object3D对象数据
    var OP = {};
    if (tempobj.pid != null && tempobj.pid != 'undefined') {
        OP.uuid = tempobj.pid;
        OP.position = tempobj.pPosition;
    } else {
        OP.uuid = _obj.parent.uuid;
        OP.position = _obj.parent.position;
    }
    if (_obj.doorState == "open") {
        if (_serverData != null && _serverData != 'undefined') {
            var eCcube = _this.createCabinetCube(OP, 0xff0000, 0.8, 200);
            //清除对象
            setTimeout(function () {
                _this.clearCabinetCube(eCcube);
            }, 1100);
            //创建主机
            setTimeout(function () {
                _this.createServerData(OP, _serverData);
            }, 1000);
        }
    } else {
        _this.clearServerCube(OP);
    }
    new createjs.Tween(tempobj.rotation).to({
        y: (doorstate == "close" ? 0.25 * 2 * Math.PI : 0 * 2 * Math.PI)
    }, 1000, createjs.Ease.linear);
};
/**
 * 抽出主机
 * @param {*} _obj 
 * @param {*} func 
 */
z3D.prototype.openServer = function (_obj, func) {
    var _this = z3DObj;
    var cardstate = "in";
    if (_obj.cardstate != null && typeof (_obj.cardstate) != 'undefined') {
        cardstate = _obj.cardstate;
    } else {
        _obj.cardstate = "out";
    }
    var R = 50;
    var x = 0;
    var z = 0;
    if (_this.serverRotation != null && typeof (_this.serverRotation) != 'undefined' && _this.serverRotation.length > 0) {
        $.each(_this.serverRotation, function (index, rotation_obj) {
            switch (rotation_obj.direction) {
                case 'x':
                    break;
                case 'y':
                    x = R * Math.cos(rotation_obj.degree);
                    z = -R * Math.sin(rotation_obj.degree);
                    break;
                case 'z':
                    break;
                case 'arb':
                    break;
            }
        });
    }
    new createjs.Tween(_obj.position).to({
        x: (cardstate == "in" ? _obj.position.x - x : _obj.position.x + x),
        z: (cardstate == "in" ? _obj.position.z - z : _obj.position.z + z),
    }, 1000, createjs.Ease.linear).call(function () {
        _obj.cardstate = cardstate == "in" ? "out" : "in";
    });
};

/**
 * 机柜利用率显示
 * @param {*} _obj 
 * @param {*} func 
 */
z3D.prototype.cabinetRateView = {
    /**
     * 初始化利用率方法
     */
    initRate: function () {
        var _this = z3DObj;
        cabinetRateState = cabinetRateState == 0 ? 1 : 0;
        //找到所有机柜
        var ecObjs = [];
        $.each(_this.objects, function (index, _obj) {
            if (_obj.type == "Object3D") {
                ecObjs.push(_obj);
            }
        });
        if (cabinetRateState) {
            _this.cabinetRateView.showRate(ecObjs);
        } else {
            _this.cabinetRateView.hideRate(ecObjs);
        }
    },
    /**
     * 展示利用率
     */
    showRate: function (_objs, func) {
        var _this = z3DObj;
        if (_objs != null) {
            $.each(_objs, function (index, _obj) {
                if (_obj != null) {
                    if (_this.commonFunc.hasObj(_obj.children) && _obj.children.length > 0) {
                        var count = _obj.children.length;
                        //遍历并清楚所有主机
                        for (var i = 0; i < count; i++) {
                            var sCube = _obj.children[i];
                            //将所有纹理清除
                            if (_this.commonFunc.hasObj(sCube.material) && sCube.material.length > 0) {
                                var materialOld = new Object();
                                materialOld = sCube.material;
                                sCube.material = [];
                                sCube.materialOld = materialOld;
                            } else {
                                if (sCube.type == "Object3D") {
                                    if (_this.commonFunc.hasObj(sCube.children) && sCube.children.length > 0) {
                                        var Scount = sCube.children.length;
                                        //遍历并清楚所有主机
                                        for (var j = 0; j < Scount; j++) {
                                            var SsCube = sCube.children[j];
                                            //将所有纹理清除
                                            if (_this.commonFunc.hasObj(SsCube.material) && SsCube.material.length > 0) {
                                                var SmaterialOld = new Object();
                                                SmaterialOld = SsCube.material;
                                                SsCube.material = [];
                                                SsCube.materialOld = SmaterialOld;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                //创建对象辅助线
                var bboxHelper = new THREE.BoxHelper(_obj, 0x999999);
                _this.cabinetRateBoxHelpers.push(bboxHelper);
                _this.scene.add(bboxHelper);
                //系数
                var p = 100;
                var arrayColor = _this.commonFunc.gradientColor("#00ff00", "#ff0000", p); //起始绿色，终点红色，共分p段
                //计算占有率
                var r = _this.cabinetRateView.CalculateRate(_obj.uuid);
                r = r != 0 ? r : 1;
                var hc = _this.commonFunc.colorRGB2Hex(arrayColor[r - 1]);
                //根据占有率渲染柱状体
                var eCcube = _this.createCabinetCube(_obj, hc, 0.8, r * 2);
                _this.cabinetRateCube.push(eCcube);
            });
        }
    },
    /**
     * 关闭利用率
     */
    hideRate: function (_objs, func) {
        var _this = z3DObj;
        if (_objs != null) {
            $.each(_objs, function (index, _obj) {
                if (_obj != null) {
                    if (_this.commonFunc.hasObj(_obj.children) && _obj.children.length > 0) {
                        var count = _obj.children.length;
                        //遍历并清楚所有主机
                        for (var i = 0; i < count; i++) {
                            var sCube = _obj.children[i];
                            //将所有纹理还原                            
                            if (_this.commonFunc.hasObj(sCube.materialOld) && sCube.materialOld.length > 0) {
                                var materialOld = new Object();
                                materialOld = sCube.materialOld;
                                sCube.materialOld = [];
                                sCube.material = materialOld;
                            } else {
                                if (sCube.type == "Object3D") {
                                    if (_this.commonFunc.hasObj(sCube.children) && sCube.children.length > 0) {
                                        var Scount = sCube.children.length;
                                        //遍历并清楚所有主机
                                        for (var j = 0; j < Scount; j++) {
                                            var SsCube = sCube.children[j];
                                            //将所有纹理清除
                                            if (_this.commonFunc.hasObj(SsCube.materialOld) && SsCube.materialOld.length > 0) {
                                                var SmaterialOld = new Object();
                                                SmaterialOld = SsCube.materialOld;
                                                SsCube.materialOld = [];
                                                SsCube.material = SmaterialOld;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            });
            //查找所有对象辅助线,并删除
            if (_this.cabinetRateBoxHelpers != null && _this.cabinetRateBoxHelpers.length > 0) {
                $.each(_this.cabinetRateBoxHelpers, function (index, _obj) {
                    _this.scene.remove(_obj);
                });
            }
            //查找所有对象,并删除
            if (_this.cabinetRateCube != null && _this.cabinetRateCube.length > 0) {
                $.each(_this.cabinetRateCube, function (index, _obj) {
                    _this.clearCabinetCube(_obj);
                });
            }
        }
    },
    /**
     * 根据机柜uuid找到所有其所有子集
     */
    findChildrenByID: function (_uuid) {
        var _this = z3DObj;
        return serverData;
    },
    /**
     * 根据机柜uuid,计算机柜占有率
     */
    CalculateRate: function (_uuid) {
        var _this = z3DObj;
        var childrenServer = _this.cabinetRateView.findChildrenByID(_uuid);
        var serverHeightSum = 0;
        $.each(childrenServer, function (index, _child) {
            var sh = _this.commonFunc.switchServerType(_child.serverType);
            serverHeightSum = serverHeightSum + sh.serverHeight;
        });
        var res = Math.round(serverHeightSum / _this.cabinetHeight * 100);
        return res;
    }
};
/**
 * 机柜利用率显示
 * @param {*} _obj 
 * @param {*} func 
 */
z3D.prototype.serverRateView = {
    /**
     * 初始化利用率方法
     */
    initRate: function () {
        var _this = z3DObj;
        serverRateState = serverRateState == 0 ? 1 : 0;
        //初始化场景
        if (serverRateState) {
            _this.serverRateView.showRate();
        } else {
            _this.serverRateView.hideRate();
        }
    },
    /**
     * 显示服务器利用率
     */
    showRate: function () {
        var _this = z3DObj;
        //清除所有机柜数据
        _this.serverRateView.clearCabinetData();
        var objs = _this.serverRateView.findServerRateData();
        _this.serverRateView.createServerRatData(objs);
    },
    /**
     * 恢复原始加载
     */
    hideRate: function () {
        var _this = z3DObj;
        //清除所有设备数据
        _this.serverRateView.clearServerData();
        var objs = _this.serverRateView.findEmptyCabinetData();
        _this.createEmptyCabinetData(objs);
    },
    /**
     * 创建服务器利用率数据
     */
    createServerRatData: function (_objs) {
        var _this = z3DObj;
        $.each(_objs, function (index, _obj) {
            var cabinetName = _obj.name || 'cn' + _this.commonFunc.guid();
            var cabinetPositions = _obj.position || {
                x: 0,
                z: 0
            };
            //serverRateCube ==>src
            var serverRateCubecount = 0;
            var separate = 5; //每个设备之间的间隔
            if (_this.commonFunc.hasObj(_obj.children) && _obj.children.length > 0) {
                serverRateCubeCount = _obj.children.length;
                //计算每一个设备高度
                var srch = Math.floor((_this.cabinetHeight - separate * (_obj.children.length - 1)) / _obj.children.length);
                //系数
                var p = 100;
                var arrayColor = _this.commonFunc.gradientColor("#00ff00", "#ff0000", p); //起始绿色，终点红色，共分p段

                $.each(_obj.children, function (i, _c) {
                    var sRCName = _c.name || 'src' + _this.commonFunc.guid();
                    var sRCUUID = _c.uuid || _this.commonFunc.guid();
                    var sRCRate = Number(_c.rate) || 0;
                    var sRCSkinOpacity = 0.8;
                    var sRCSkinColor = _this.commonFunc.colorRGB2Hex(arrayColor[sRCRate]) || 0xff0000;
                    var sRCHeight = Math.floor(srch * sRCRate / 100);
                    var rateCube = new THREE.Object3D();

                    //如果利用率不等于零
                    if (sRCRate != 0) {
                        var cube = {
                            show: true,
                            name: sRCName,
                            shellname: sRCName + '_shell',
                            uuid: sRCUUID,
                            rotation: _this.serverRotation, //基于坐标轴旋转,
                            objType: 'cube',
                            transparent: true,
                            length: 62,
                            width: 66,
                            height: sRCHeight,
                            thick: 2,
                            x: cabinetPositions.x || 0,
                            y: (i * srch) + sRCHeight / 2 || 0,
                            z: cabinetPositions.z || 0,
                            style: {
                                skinColor: sRCSkinColor,
                                opacity: sRCSkinOpacity,
                                skin: {
                                    skin_up: {
                                        skinColor: sRCSkinColor,
                                        opacity: sRCSkinOpacity,
                                    },
                                    skin_down: {
                                        skinColor: sRCSkinColor,
                                        opacity: sRCSkinOpacity,
                                    },
                                    skin_left: {
                                        skinColor: sRCSkinColor,
                                        opacity: sRCSkinOpacity,
                                    },
                                    skin_right: {
                                        skinColor: sRCSkinColor,
                                        opacity: sRCSkinOpacity,
                                    },
                                    skin_behind: {
                                        skinColor: sRCSkinColor,
                                        opacity: sRCSkinOpacity,
                                    }
                                }
                            }
                        };
                        //生成利用率数据
                        var tempObj = _this.createCube(_this, cube);
                        rateCube.add(tempObj);
                    }

                    var sRCSkinOpacityAuxiliary = 1;
                    var sRCSkinColorAuxiliary = 0xffffff;
                    var sRCHeightAuxiliary = srch - sRCHeight - separate;
                    var cubeAuxiliary = {
                        show: true,
                        name: sRCName + '_Auxiliary',
                        shellname: sRCName + '_shell_Auxiliary',
                        uuid: _this.commonFunc.guid(),
                        rotation: _this.serverRotation, //基于坐标轴旋转,
                        objType: 'cube',
                        transparent: true,
                        length: 62,
                        width: 66,
                        height: sRCHeightAuxiliary,
                        thick: 2,
                        x: cabinetPositions.x || 0,
                        y: (i * srch) + (sRCHeight + srch) / 2 || 0,
                        z: cabinetPositions.z || 0,
                        style: {
                            skinColor: sRCSkinColorAuxiliary,
                            opacity: sRCSkinOpacityAuxiliary,
                            skin: {
                                skin_up: {
                                    skinColor: sRCSkinColorAuxiliary,
                                    opacity: sRCSkinOpacityAuxiliary,
                                },
                                skin_down: {
                                    skinColor: sRCSkinColorAuxiliary,
                                    opacity: sRCSkinOpacityAuxiliary,
                                },
                                skin_left: {
                                    skinColor: sRCSkinColorAuxiliary,
                                    opacity: sRCSkinOpacityAuxiliary,
                                },
                                skin_right: {
                                    skinColor: sRCSkinColorAuxiliary,
                                    opacity: sRCSkinOpacityAuxiliary,
                                },
                                skin_behind: {
                                    skinColor: sRCSkinColorAuxiliary,
                                    opacity: sRCSkinOpacityAuxiliary,
                                }
                            }
                        }
                    };
                    //生成利用率辅助数据                    
                    var tempObjAuxiliary = _this.createCube(_this, cubeAuxiliary);
                    rateCube.add(tempObjAuxiliary);
                    _this.serversRateCubeArr.push(rateCube);
                    _this.addObject(rateCube);
                    //创建对象辅助线
                    var bboxHelper = new THREE.BoxHelper(rateCube, 0x999999);
                    _this.serversRateCubeArr.push(bboxHelper);
                    _this.scene.add(bboxHelper);
                });
            }
        });
    },
    /**
     * 找到服务器利用率数据数据
     */
    findServerRateData: function () {
        var _this = z3DObj;
        var sr = new Array();
        sr = eCData;
        sr[0].children = serverData;
        sr[1].children = serverData;
        return sr;
    },
    /**
     * 找到机柜数据
     */
    findEmptyCabinetData: function () {
        var _this = z3DObj;
        return eCData;
    },
    /**
     * 屏幕中清除所有机柜数据
     */
    clearCabinetData: function () {
        var _this = z3DObj;
        //找到所有机柜
        var ecObjs = [];
        $.each(_this.objects, function (index, _obj) {
            if (_obj.type == "Object3D") {
                ecObjs.push(_obj);
            }
        });
        //删除所有机柜
        $.each(ecObjs, function (index, _obj) {
            if (_this.commonFunc.hasObj(_obj.children) && _obj.children.length > 0) {
                $.each(_obj.children, function (index, _c) {
                    if (_c.type == "Object3D") {
                        _this.commonFunc.removeInObject3D('uuid', _c.uuid);
                    } else {
                        _this.commonFunc.removeInObject('uuid', _c.uuid);
                    }
                    _this.scene.remove(_c);
                });
            }
            _this.commonFunc.removeInObject3D('uuid', _obj.uuid);
            _this.scene.remove(_obj);
        });
    },
    /**
     * 屏幕中清除所有设备数据
     */
    clearServerData: function () {
        var _this = z3DObj;
        //找到所有设备
        if (_this.serversRateCubeArr.length > 0) {
            //删除所有机柜
            $.each(_this.serversRateCubeArr, function (index, _obj) {
                if (_obj.type == "Object3D") {
                    _this.commonFunc.removeInObject3D('uuid', _obj.uuid);
                } else {
                    _this.commonFunc.removeInObject('uuid', _obj.uuid);
                }
                _this.scene.remove(_obj);
            });
        }
    }
};
/**
 * 机柜拖拽显示
 * @param {*} _obj 
 * @param {*} func 
 */
z3D.prototype.cabinetMoveView = {
    /**
     * 初始化移动事件
     */
    init: function () {
        var _this = z3DObj;
        //视角俯视事件
        _this.viewRecover("XZ"); //控制哪个页面
        //找到所有机柜
        var ecObjs = [];
        $.each(_this.objects, function (index, _obj) {
            if (_obj.type == "Object3D") {
                $.each(_obj.children, function (index, _o) {
                    ecObjs.push(_o);
                });
            }
        });
        //注册移动事件
        _this.initDragControl(ecObjs);
    }
};