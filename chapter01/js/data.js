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
            degree: -0.8 * Math.PI
        }], //旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 
        x: 520,
        y: 110,
        z: -380,
        style: {
            skinColor: 0xfefefe,
            skin: {
                skin_fore: {
                    imgurl: "images/aircondition.jpg",
                },
            }
        }
    },
    //墙体
    {
        show: true,
        uuid: "00000000-0000-0000-0000-000000000002",
        name: 'wall',
        objType: 'wall',
        thick: 20,
        length: 100,
        height: 240,
        wallData: [{ //wall1
                uuid: "00000000-0000-0000-0000-000000000003",
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
                    x: -600,
                    y: 120,
                    z: -450
                },
                endDot: {
                    x: 600,
                    y: 120,
                    z: -450
                },
                rotation: [{
                    direction: 'x',
                    degree: 0
                }] //旋转 表示x方向0度  arb表示任意参数值[x,y,z,angle] 

            },
            { //wall2
                uuid: "00000000-0000-0000-0000-000000000014",
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
                    x: -600,
                    y: 120,
                    z: 450
                },
                endDot: {
                    x: 600,
                    y: 120,
                    z: 450
                },
                childrens: [{
                        op: '-',
                        show: true,
                        uuid: "00000000-0000-0000-0000-000000000004",
                        name: 'doorhole',
                        objType: 'doorhole',
                        thick: 20,
                        height: 220,
                        startDot: {
                            x: -410,
                            y: 110,
                            z: 450
                        },
                        endDot: {
                            x: -190,
                            y: 110,
                            z: 450
                        },
                        skin: {
                            skin_up: {
                                skinColor: 0xffdddd,
                            },
                            skin_down: {
                                skinColor: 0xdddddd,
                            },
                            skin_fore: {
                                skinColor: 0xffdddd,
                            },
                            skin_behind: {
                                skinColor: 0xffdddd,
                            },
                            skin_left: {
                                skinColor: 0xffdddd,
                            },
                            skin_right: {
                                skinColor: 0xffdddd,
                            }
                        },
                    },
                    {
                        op: '-',
                        show: true,
                        uuid: "00000000-0000-0000-0000-000000000005",
                        name: 'windowHole',
                        objType: 'windowHole',
                        thick: 20,
                        height: 160,
                        startDot: {
                            x: -50,
                            y: 130,
                            z: 450
                        },
                        endDot: {
                            x: 450,
                            y: 130,
                            z: 450
                        }
                    },
                    {
                        show: true,
                        name: 'windowCaseBottom',
                        uuid: "00000000-0000-0000-0000-000000000006",
                        objType: 'cube',
                        thick: 30,
                        height: 10,
                        startDot: {
                            x: -50,
                            y: 50,
                            z: 450
                        },
                        endDot: {
                            x: 450,
                            y: 50,
                            z: 450
                        },
                        skin: {
                            skin_up: {
                                skinColor: 0xc0dee0,
                            },
                            skin_down: {
                                skinColor: 0xc0dee0,
                            },
                            skin_fore: {
                                skinColor: 0xc0dee0,
                            },
                            skin_behind: {
                                skinColor: 0xc0dee0,
                            },
                            skin_left: {
                                skinColor: 0xd0eef0,
                            },
                            skin_right: {
                                skinColor: 0xd0eef0,
                            }
                        },
                    },

                    {
                        show: true,
                        uuid: "00000000-0000-0000-0000-000000000007",
                        name: 'doorCaseRight',
                        objType: 'cube',
                        thick: 24,
                        height: 220,
                        startDot: {
                            x: -410,
                            y: 110,
                            z: 450
                        },
                        endDot: {
                            x: -405,
                            y: 110,
                            z: 450
                        },
                        skin: {
                            skin_up: {
                                skinColor: 0xc0dee0,
                            },
                            skin_down: {
                                skinColor: 0xc0dee0,
                            },
                            skin_fore: {
                                skinColor: 0xc0dee0,
                            },
                            skin_behind: {
                                skinColor: 0xc0dee0,
                            },
                            skin_left: {
                                skinColor: 0xd0eef0,
                            },
                            skin_right: {
                                skinColor: 0xd0eef0,
                            }
                        },
                    },
                    {
                        show: true,
                        name: 'doorCaseLeft',
                        uuid: "00000000-0000-0000-0000-000000000008",
                        objType: 'cube',
                        thick: 24,
                        height: 220,
                        startDot: {
                            x: -190,
                            y: 110,
                            z: 450
                        },
                        endDot: {
                            x: -195,
                            y: 110,
                            z: 450
                        },
                        skin: {
                            skin_up: {
                                skinColor: 0xc0dee0,
                            },
                            skin_down: {
                                skinColor: 0xc0dee0,
                            },
                            skin_fore: {
                                skinColor: 0xc0dee0,
                            },
                            skin_behind: {
                                skinColor: 0xc0dee0,
                            },
                            skin_left: {
                                skinColor: 0xd0eef0,
                            },
                            skin_right: {
                                skinColor: 0xd0eef0,
                            }
                        },
                    },
                    {
                        show: true,
                        name: 'doorCaseTop',
                        uuid: "00000000-0000-0000-0000-000000000009",
                        objType: 'cube',
                        thick: 24,
                        height: 5,
                        startDot: {
                            x: -190,
                            y: 220,
                            z: 450
                        },
                        endDot: {
                            x: -410,
                            y: 220,
                            z: 450
                        },
                        skin: {
                            skin_up: {
                                skinColor: 0xc0dee0,
                            },
                            skin_down: {
                                skinColor: 0xc0dee0,
                            },
                            skin_fore: {
                                skinColor: 0xc0dee0,
                            },
                            skin_behind: {
                                skinColor: 0xc0dee0,
                            },
                            skin_left: {
                                skinColor: 0xd0eef0,
                            },
                            skin_right: {
                                skinColor: 0xd0eef0,
                            }
                        },
                    },
                    {
                        show: true,
                        name: 'doorCaseBottom',
                        uuid: "00000000-0000-0000-0000-000000000010",
                        objType: 'cube',
                        thick: 24,
                        height: 5,
                        startDot: {
                            x: -190,
                            y: 5,
                            z: 450
                        },
                        endDot: {
                            x: -410,
                            y: 5,
                            z: 450
                        },
                        skin: {
                            skin_up: {
                                skinColor: 0xc0dee0,
                            },
                            skin_down: {
                                skinColor: 0xc0dee0,
                            },
                            skin_fore: {
                                skinColor: 0xc0dee0,
                            },
                            skin_behind: {
                                skinColor: 0xc0dee0,
                            },
                            skin_left: {
                                skinColor: 0xd0eef0,
                            },
                            skin_right: {
                                skinColor: 0xd0eef0,
                            }
                        },
                    },
                    {
                        show: true,
                        name: 'doorLeft',
                        uuid: "00000000-0000-0000-0000-000000000011",
                        objType: 'cube',
                        thick: 4,
                        height: 210,
                        startDot: {
                            x: -196,
                            y: 112,
                            z: 450
                        },
                        endDot: {
                            x: -300,
                            y: 112,
                            z: 450
                        },
                        skin: {
                            opacity: 0.1,
                            skin_up: {
                                skinColor: 0x51443e,
                            },
                            skin_down: {
                                skinColor: 0x51443e,
                            },
                            skin_fore: {
                                skinColor: 0x51443e,
                            },
                            skin_behind: {
                                skinColor: 0x51443e,
                            },
                            skin_left: {
                                skinColor: 0x51443e,
                                imgurl: "images/door_left.png",
                            },
                            skin_right: {
                                skinColor: 0x51443e,
                                imgurl: "images/door_right.png",
                            }
                        },
                    },
                    {
                        show: true,
                        name: 'doorRight',
                        uuid: "00000000-0000-0000-0000-000000000012",
                        objType: 'cube',
                        thick: 4,
                        height: 210,
                        startDot: {
                            x: -300,
                            y: 112,
                            z: 450
                        },
                        endDot: {
                            x: -404,
                            y: 112,
                            z: 450
                        },
                        skin: {
                            opacity: 0.1,
                            skin_up: {
                                skinColor: 0x51443e,
                            },
                            skin_down: {
                                skinColor: 0x51443e,
                            },
                            skin_fore: {
                                skinColor: 0x51443e,
                            },
                            skin_behind: {
                                skinColor: 0x51443e,
                            },
                            skin_left: {
                                skinColor: 0x51443e,
                                imgurl: "images/door_right.png",
                            },
                            skin_right: {
                                skinColor: 0x51443e,
                                imgurl: "images/door_left.png",
                            }
                        },
                    },
                    {
                        show: true,
                        name: 'doorControl',
                        uuid: "00000000-0000-0000-0000-000000000013",
                        objType: 'cube',
                        thick: 10,
                        height: 40,
                        startDot: {
                            x: -120,
                            y: 160,
                            z: 465
                        },
                        endDot: {
                            x: -160,
                            y: 160,
                            z: 465
                        },
                        skin: {
                            opacity: 0.1,
                            skin_up: {
                                skinColor: 0x333333,
                            },
                            skin_down: {
                                skinColor: 0x333333,
                            },
                            skin_fore: {
                                skinColor: 0x333333,
                            },
                            skin_behind: {
                                skinColor: 0x333333,
                            },
                            skin_left: {
                                skinColor: 0x333333,
                            },
                            skin_right: {
                                skinColor: 0x333333,
                                imgurl: "images/doorControl.jpg",
                            }
                        },
                    },
                ]
            },
            { //wall3
                uuid: "00000000-0000-0000-0000-000000000015",
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
                    x: 590,
                    y: 120,
                    z: -455
                },
                endDot: {
                    x: 590,
                    y: 120,
                    z: 455
                },
            },
            { //wall4
                uuid: "00000000-0000-0000-0000-000000000016",
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
                    x: -590,
                    y: 120,
                    z: -455
                },
                endDot: {
                    x: -590,
                    y: 120,
                    z: 455
                },
            }
        ],
        style: {
            skinColor: 0x8ac9e2
        }

    },
    //玻璃
    {
        show: true,
        name: 'windowGlass1',
        uuid: "00000000-0000-0000-0000-000000000017",
        objType: 'glasses',
        width: 500,
        height: 160,
        pic: "images/glass.png",
        transparent: true,
        opacity: 0.1,
        position: {
            x: 200,
            y: 130,
            z: 450
        },
        rotation: {
            x: 0,
            y: 0 * Math.PI,
            z: 0
        },
        blending: false,
    },
];
//机柜
var eCData = [
    //机柜1-1 --原型
    {
        name: 'cabinet1_1',
        shellname: 'cabinet1_1_shell',
        uuid: 'JG000000-0000-0000-0000-000000000001',
        position: {
            x: 300,
            z: -180
        },
    },
    //机柜1-2 --原型
    {
        name: 'cabinet1_2',
        shellname: 'cabinet1_2_shell',
        uuid: 'JG000000-0000-0000-0000-000000000002',
        position: {
            x: -300,
            z: -180
        },
    },
];

//服务器
var serverData = [ //主机1
    {
        uuid: "SV000000-0000-0000-0000-000000000001",
        name: 'equipment_card_1',
        serverType: "is_database",
        order: "1",
        rate: "60",
        alarmLevel: '1'
    },
    //主机2
    {
        uuid: "SV000000-0000-0000-0000-000000000002",
        name: 'equipment_card_2',
        serverType: "is_server",
        order: "2",
        rate: "30",
        alarmLevel: '2'
    },
    //主机3
    {
        uuid: "SV000000-0000-0000-0000-000000000003",
        name: 'equipment_card_3',
        serverType: "Type3",
        rate: "90",
        order: "3",
    },
];

//基础事件内容
var baseEvents = {
    dbclick: [{
            obj_name: "doorRight",
            obj_uuid: "",
            obj_event: function (_obj) {
                z3DObj.openRightDoor(_obj, function () {});
            }
        },
        {
            obj_name: "doorLeft",
            obj_uuid: "",
            obj_event: function (_obj) {
                z3DObj.openLeftDoor(_obj, function () {});
            }
        },
        {
            obj_name: "cabinetdoor3_1",
            obj_uuid: "",
            obj_event: function (_obj) {
                z3DObj.opcabinetdoor(_obj);
            }
        },
        {
            findObject: function (_objname) { //查找某一类符合名称的对象
                if (_objname.indexOf("cabinet") >= 0 && _objname.indexOf("door") >= 0) {
                    return true;
                } else {
                    return false;
                }
            },
            obj_uuid: "",
            obj_event: function (_obj) {
                z3DObj.opcabinetdoor(_obj, serverData);
            }
        },
        {
            findObject: function (_objname) { //查找某一类符合名称的对象
                if (_objname.indexOf("equipment") >= 0 && _objname.indexOf("card") >= 0) {
                    return true;
                } else {
                    return false;
                }
            },
            obj_uuid: "",
            obj_event: function (_obj) {
                z3DObj.openServer(_obj);
            }
        }
    ],
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
            threeRestart();
            //加载机柜数据
            z3DObj.createEmptyCabinetData(eCData);
        }
    },
    // {
    //     btnid: "btn_connection",
    //     btnTitle: "编辑墙壁",
    //     btnimg: "images/icons/connection.png",
    //     event: function () {
    //         threeRestart();
    //         if (moveState) {
    //             z3DObj.cabinetMoveView.init();
    //         }
    //         if (cabinetRateState) {
    //             z3DObj.cabinetRateView.initRate();
    //         }
    //         if (serverRateState) {
    //             z3DObj.serverRateView.initRate();
    //         }
    //         if (alarmState) {
    //             z3DObj.createAlarmTips([{
    //                     uuid: 'SV000000-0000-0000-0000-000000000001',
    //                     pid: 'JG000000-0000-0000-0000-000000000001',
    //                     level: '1'
    //                 },
    //                 {
    //                     uuid: 'SV000000-0000-0000-0000-000000000002',
    //                     pid: 'JG000000-0000-0000-0000-000000000002',
    //                     level: '2'
    //                 }
    //             ]);
    //         }
    //         //z3DObj.createLinkLine(); //创建连接线
    //     }
    // },
    {
        btnid: "btn_space",
        btnTitle: "服务器利用率",
        btnimg: "images/icons/space.png",
        event: function () {
            if (moveState) {
                z3DObj.cabinetMoveView.init();
            }
            if (cabinetRateState) {
                z3DObj.cabinetRateView.initRate();
            }
            if (alarmState) {
                z3DObj.createAlarmTips([{
                        uuid: 'SV000000-0000-0000-0000-000000000001',
                        pid: 'JG000000-0000-0000-0000-000000000001',
                        level: '1'
                    },
                    {
                        uuid: 'SV000000-0000-0000-0000-000000000002',
                        pid: 'JG000000-0000-0000-0000-000000000002',
                        level: '2'
                    }
                ]);
            }
            z3DObj.serverRateView.initRate();
        }
    },
    {
        btnid: "btn_usage",
        btnTitle: "机柜利用率",
        btnimg: "images/icons/usage.png",
        event: function () {
            if (moveState) {
                z3DObj.cabinetMoveView.init();
            }
            if (serverRateState) {
                z3DObj.serverRateView.initRate();
            }
            if (alarmState) {
                z3DObj.createAlarmTips([{
                        uuid: 'SV000000-0000-0000-0000-000000000001',
                        pid: 'JG000000-0000-0000-0000-000000000001',
                        level: '1'
                    },
                    {
                        uuid: 'SV000000-0000-0000-0000-000000000002',
                        pid: 'JG000000-0000-0000-0000-000000000002',
                        level: '2'
                    }
                ]);
            }
            z3DObj.cabinetRateView.initRate();
        }
    },
    {
        btnid: "btn_edit",
        btnTitle: "拖拽机柜",
        btnimg: "images/icons/edit.png",
        event: function () {
            if (cabinetRateState) {
                z3DObj.cabinetRateView.initRate();
            }
            if (serverRateState) {
                z3DObj.serverRateView.initRate();
            }
            if (alarmState) {
                z3DObj.createAlarmTips([{
                        uuid: 'SV000000-0000-0000-0000-000000000001',
                        pid: 'JG000000-0000-0000-0000-000000000001',
                        level: '1'
                    },
                    {
                        uuid: 'SV000000-0000-0000-0000-000000000002',
                        pid: 'JG000000-0000-0000-0000-000000000002',
                        level: '2'
                    }
                ]);
            }
            z3DObj.cabinetMoveView.init();
        }
    },
    {
        btnid: "btn_alarm",
        btnTitle: "告警信息",
        btnimg: "images/icons/alarm.png",
        event: function () {
            if (moveState) {
                z3DObj.cabinetMoveView.init();
            }
            if (cabinetRateState) {
                z3DObj.cabinetRateView.initRate();
            }
            if (serverRateState) {
                z3DObj.serverRateView.initRate();
            }
            z3DObj.createAlarmTips([{
                    uuid: 'SV000000-0000-0000-0000-000000000001',
                    pid: 'JG000000-0000-0000-0000-000000000001',
                    level: '1'
                },
                {
                    uuid: 'SV000000-0000-0000-0000-000000000002',
                    pid: 'JG000000-0000-0000-0000-000000000002',
                    level: '2'
                }
            ]);
        }
    }
];

//基础数据
var baseData = {
    objList: baseObjects,
    eventList: baseEvents,
    btns: baseBtns
};