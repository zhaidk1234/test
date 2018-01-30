var canvasId = "canvas-frame"; //定义元素id
//初始化_option 参数 
var initOption = {
    antialias: true,
    showHelpGrid: true,
    clearCoolr: 0xFFFFFF
};
//基础画布内容
var baseObjects = [
    //地板
    {
        show: true,
        uuid: "00000000-0000-0000-0000-000000000000",
        name: 'floor',
        objType: 'floor',
        length: 2000,
        width: 1600,
        height: 10,
        rotation: [{
            direction: 'x',
            degree: 0
        }], //旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 
        x: 0,
        y: -5,
        z: 0,
        style: {
            skinColor: 0x8ac9e2,
            skin: {
                skin_up: {
                    skinColor: 0x98750f,
                    imgurl: "images/floor.jpg",
                    repeatx: true,
                    repeaty: true,
                    width: 128,
                    height: 128
                },
                skin_down: {
                    skinColor: 0x8ac9e2,
                },
                skin_fore: {
                    skinColor: 0x8ac9e2,
                }
            }
        }
    },
    //空调
    {
        show: true,
        uuid: "00000000-0000-0000-0000-000000000001",
        name: 'aircondition',
        objType: 'cube',
        length: 60,
        width: 80,
        height: 220,
        rotation: [{
            direction: 'y',
            degree: 0.3 * Math.PI
        }], //旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 
        x: -420,
        y: 110,
        z: 370,
        style: {
            skinColor: 0xfefefe,
            skin: {
                skin_fore: {
                    imgurl: "images/aircondition.jpg",
                },
            }
        }
    }
];
//墙体
var wallbasedata = 
    {
        show: true,
        uuid: "00000000-0000-0000-0000-000000000002",
        name: 'wall',
        objType: 'wall',
        thick: 20,
        length: 100,
        height: 240,
        wallData: [{ //wall1
                uuid: "",
                name: 'wall1',
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
                    x: -500,
                    y: 120,
                    z: -350
                },
                endDot: {
                    x: 500,
                    y: 120,
                    z: -350
                },
                rotation: [{
                    direction: 'x',
                    degree: 0
                }] //旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 
            },
            { //wall2
                uuid: "",
                name: 'wall2',
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
                        skinColor: 0xb0cee0,
                    },
                    skin_right: {
                        skinColor: 0xdeeeee,
                    }
                },
                startDot: {
                    x: -500,
                    y: 120,
                    z: 450
                },
                endDot: {
                    x: 500,
                    y: 120,
                    z: 450
                },
            },
            { //wall3
                uuid: "",
                name: 'wall3',
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
                        skinColor: 0xdeeeee,
                    },
                    skin_left: {
                        skinColor: 0xb0cee0,
                    },
                    skin_right: {
                        skinColor: 0xb0cee0,
                    }
                },
                startDot: {
                    x: 490,
                    y: 120,
                    z: -355
                },
                endDot: {
                    x: 490,
                    y: 120,
                    z: 455
                },
            },
            { //wall4
                uuid: "",
                name: 'wall4',
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
                        skinColor: 0xdeeeee,
                    },
                    skin_behind: {
                        skinColor: 0xb0cee0,
                    },
                    skin_left: {
                        skinColor: 0xb0cee0,
                    },
                    skin_right: {
                        skinColor: 0xb0cee0,
                    }
                },
                startDot: {
                    x: -490,
                    y: 120,
                    z: -355
                },
                endDot: {
                    x: -490,
                    y: 120,
                    z: 455
                },
            }
        ],
        style: {
            skinColor: 0x8ac9e2
        }

    };

//基础事件内容
var baseEvents = {
    dbclick: [],
    mouseDown: [],
    mouseUp: [],
    mouseMove: [{
        obj_name: "aircondition",
        obj_uuid: "",
        obj_event: function (_obj) {
            z3DObj.commonFunc.setSkinColor(_obj.name, 0xff0000);
        }
    }]
};

//左侧菜单按钮
var baseBtns = [{
        btnid: "btn_reset",
        btnTitle: "场景复位",
        btnimg: "images/icons/reset.png",
        event: function () {
            $('#' + canvasId).empty();
            zstation = null;
            z3DObj = null;
            zstation = new z3D();
            zstation.initz3D(canvasId, initOption, baseData);
            zstation.start();
        }
    },
    {
        btnid: "btn_connection",
        btnTitle: "编辑墙壁",
        btnimg: "images/icons/connection.png",
        event: function () {
            //视角俯视事件
            z3DObj.viewRecover("XZ"); //控制哪个页面
            z3DObj.createLinkLine(); //创建连接线
        }
    },
    {
        btnid: "btn_usage",
        btnTitle: "机柜利用率",
        btnimg: "images/icons/usage.png",
        event: function () {}
    },
    {
        btnid: "btn_edit",
        btnTitle: "拖拽机柜",
        btnimg: "images/icons/edit.png",
        event: function () {}
    }
];

//基础数据
var baseData = {
    objList: baseObjects,
    eventList: baseEvents,
    btns: baseBtns
};