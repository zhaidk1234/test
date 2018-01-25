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

    this.mouseClick = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.controls = null; //鼠标控制器
    this.transformControl = null; //变换控制器
    this.dragControl = null; //拖动控制器
    this.SELECTED = null; //选中物体
    this.INTERSECTED = null; //鼠标覆盖物体

    this.basedata = _basedata; //基础数据渲染 
    this.datajson = _datajson; //需添加数据

    this.editState = 0; //编辑状态，0为不可编辑，1为可编辑
    this.hiding = null; //拖动组件隐藏状态

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
    _this.initDragControl(); //拖动控制器
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
};

/**
 * 创建网格线
 */
z3D.prototype.initHelpGrid = function () {
    var _this = this;
    if (_this.option.showHelpGrid) {
        var helpGrid = new THREE.GridHelper(1600, 50);
        _this.scene.add(helpGrid);
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
    //_this.controls.addEventListener('change', _this.updateControls);
};
/**
 * 变换控制器
 */
z3D.prototype.initTransformControl = function () {
    var _this = this;
    _this.transformControl = new THREE.TransformControls(_this.camera, _this.renderer.domElement);
    //_this.transformControl.addEventListener('change', _this.animation);
    //_this.transformControl.axisoption = "XZ"; //自定义拖拽参考面
    _this.scene.add(_this.transformControl);
    //隐藏变换相关动作
    _this.transformControl.addEventListener('change', function (e) {
        _this.editState = _this.editState ? 0 : 1; //切换可编辑状态
        _this.commonFunc.cancelHideTransorm();
    });
    _this.transformControl.addEventListener('hoveroff', function (e) {
        _this.commonFunc.cancelHideTransorm();
    });
    _this.transformControl.addEventListener('mouseDown', function (e) {
        _this.commonFunc.cancelHideTransorm();
    });
    _this.transformControl.addEventListener('mouseUp', function (e) {
        _this.editState = 0;
        _this.commonFunc.delayHideTransform();
    });
    _this.transformControl.addEventListener('objectChange', function (e) {
        _this.commonFunc.updateSplineOutline();
    });
};
/**
 * 拖动控制器
 */
z3D.prototype.initDragControl = function () {
    var _this = this;
    _this.dragcontrols = new THREE.DragControls(_this.splineHelperObjects, _this.camera, _this.renderer.domElement); //
    _this.dragcontrols.enabled = false;
    _this.dragcontrols.addEventListener('hoveron', function (event) {
        if (_this.editState != 0) {
            _this.transformControl.attach(event.object);
        }
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
    var cubeGeometry = new THREE.CubeGeometry(_length, _height, _width, 0, 0, 1);

    //六面颜色
    for (var i = 0; i < cubeGeometry.faces.length; i += 2) {
        var hex = skinColor || Math.random() * 0x531844;
        cubeGeometry.faces[i].color.setHex(hex);
        cubeGeometry.faces[i + 1].color.setHex(hex);
    }
    //六面纹理
    var skin_up_obj = {
        vertexColors: THREE.FaceColors
    }
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
            console.log(skin_opacity);
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
                transparent: true
            };
        } else {
            if (_this.commonFunc.hasObj(_obj.skinColor)) {
                _cube.faces[_cubefacenub].color.setHex(_obj.skinColor);
                _cube.faces[_cubefacenub + 1].color.setHex(_obj.skinColor);
            }
            return {
                vertexColors: THREE.FaceColors
            };
        }
    } else {
        return {
            vertexColors: THREE.FaceColors
        };
    }
};
//创建皮肤
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
 */
z3D.prototype.viewRecover = function (_plan) {
    var _this = z3DObj;
    var mainCamera = _this.commonFunc.findObject("mainCamera"); //主摄像机
    var controls = _this.controls; //主控制器
    _this.editState = _this.editState == 0 ? 1 : 0; //更改可编辑状态
    if (_this.editState == 0) {
        _this.transformControl.dispose(); //取消拖拽
        _this.transformControl.detach();
        _this.dragcontrols.enabled = false; //取消控制
        _this.commonFunc.cancelEdit();        
    } else {
        _this.initTransformControl();
        _this.transformControl.axisoption = _plan;
        _this.dragcontrols.enabled = true; //取消控制
    }
    controls.enableRotate = true; //允许旋转
    //角度初始化
    var conTarget = new createjs.Tween(controls.target)
        .to(controls.target0, 1000, createjs.Ease.InOut);
    //位置初始化并镜头俯视
    var conPosition = new createjs.Tween(controls.object.position)
        .to(controls.position0, 1000, createjs.Ease.InOut);
    //根据编辑状态，更换视角
    if (_this.editState) {
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
    controls.enableRotate = _this.editState == 1 ? false : true; //不允许旋转
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
        if (_this.commonFunc.hasObj(_obj.material.emissive)) {
            _obj.material.emissive.setHex(_color);
        } else if (_this.commonFunc.hasObj(_obj.material)) {
            if (_obj.material.length > 0) {
                $.each(_obj.material, function (index, obj) {
                    obj.emissive.setHex(_color);
                });
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
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : {
            r: 0,
            g: 0,
            b: 0,
            a: 1.0
        };
        var message = parameters.hasOwnProperty("message") ? parameters["message"] : "helloz3D";
        var x = parameters.hasOwnProperty("position") ? parameters["position"].x : 0;
        var y = parameters.hasOwnProperty("position") ? parameters["position"].y : 0;
        var z = parameters.hasOwnProperty("position") ? parameters["position"].z : 0;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText(message);
        var textWidth = metrics.width;
        context.lineWidth = borderThickness;
        context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
        context.fillText(message, borderThickness, fontsize + borderThickness);
        var texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            useScreenCoordinates: false
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
     */
    addSplineObject: function (position) {
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
            object.position.y = 0;
            object.position.z = position.z;
        } else {
            object.position.x = Math.random() * 1000 - 500;
            object.position.y = Math.random() * 600;
            object.position.z = Math.random() * 800 - 400;
        }
        object.castShadow = true;
        object.receiveShadow = true;
        _this.scene.add(object);
        _this.splineHelperObjects.push(object);
        return object;
    },
    /**
     * 增加节点
     */
    addPoint: function (_point) {
        var _this = z3DObj;
        _this.splinePointsLength++;
        _this.positions.push(_this.commonFunc.addSplineObject(_point).position);
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
        }else{
            _this.scene.remove(_this.splineMesh);
        }
    },
    /**
     * 移除节点
     */
    cancelEdit: function () {
        var _this = z3DObj;
        console.log(_this.positions);
        
        if(_this.positions.length>0){
            for(var i=_this.positions.length;i>0;i--){
                _this.commonFunc.removePoint();
            }
        }

        // //初始化曲线参数
        // _this.splineOutline = null; //曲线输出线
        // _this.splineHelperObjects = []; //曲线辅助数组
        // _this.splineMesh = null; //曲线
        // _this.splines = {}; //曲线对象
        // _this.splinePointsLength = 4; //曲线初始化节点数量
        // _this.positions = []; //
    }
};

/**
 * 鼠标按下事件
 */
var dbclick = 0;
z3D.prototype.onDocumentMouseDown = function (event) {
    dbclick++;
    var _this = z3DObj;
    _this.mouseClick.x = (event.clientX / _this.width) * 2 - 1;
    _this.mouseClick.y = -(event.clientY / _this.height) * 2 + 1;
    setTimeout(function () {
        dbclick = 0;
    }, 500);
    event.preventDefault();
    //可编辑时
    if (_this.editState) {
        console.log(_this.mouseClick);
        var vector = new THREE.Vector3(); //三维坐标对象
        vector.set(_this.mouseClick.x, _this.mouseClick.y, 0.5);
        vector.unproject(_this.camera);
        var raycaster = new THREE.Raycaster(_this.camera.position, vector.sub(_this.camera.position).normalize());
        var intersects = raycaster.intersectObjects(_this.scene.children);
        if (intersects.length > 0) {
            var selected = intersects[0]; //取第一个物体
            _this.commonFunc.addPoint(selected.point);
        }
    }
    //双击时
    if (dbclick >= 2) {
        _this.raycaster.setFromCamera(_this.mouseClick, _this.camera);
        var intersects = _this.raycaster.intersectObjects(_this.objects); //射线和模型求交，选中一系列直线
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
            _this.INTERSECTED.currentHex = _this.INTERSECTED.material[0].emissive.getHex();
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