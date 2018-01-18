(function(canvasbox, _window){
	/* 基础 */
	var scene, camera, renderer, states, controls;
	var initCamera; // 初始化照相机
	// 太阳、水、金、地、火、木、土、土星环、天、天王星环、海王星
	var taiyang, shui, jin, di, huo, mu, tu, tu_huan, tian, tian_huan, hai;
	(function(){
		// 场景
		scene = new THREE.Scene();
		// 照相机
		initCamera = function(){
			camera = new THREE.PerspectiveCamera(60, canvasbox.clientWidth / canvasbox.clientHeight, 1, 1000);
		}
		initCamera();
		camera.position.set(250, 250, 250);
		camera.lookAt({
			x: 0,
			y: 0,
			z: 0
		});
		// 渲染器
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(canvasbox.clientWidth, canvasbox.clientHeight);
		renderer.clear(0xffffff);
		canvasbox.appendChild(renderer.domElement);
		// 监视器
		states = new Stats();
		document.body.appendChild(states.domElement);
		states.domElement.style.position = "absolute";
		states.domElement.style.left = 0;
		states.domElement.style.top = 0;
		//
		controls = new THREE.OrbitControls(camera);
	})();
	/* 光照 */
	(function(){
		var huanjing = new THREE.AmbientLight(0x8f8f8f);
		scene.add(huanjing);
	})();
	/* 宇宙背景 */
	(function(PIC2){
		var yuzhou_geometr = new THREE.PlaneGeometry(500, 500, 1, 1);
		var yuzhou_material = new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture("img/bg.jpg"),
			side: THREE.DoubleSide
		});
		var yuzhou = [];
		for(var i = 0; i < 6; i++){
			yuzhou.push(new THREE.Mesh(yuzhou_geometr, yuzhou_material));
			scene.add(yuzhou[i]);
		}
		// 正面
		yuzhou[0].position.set(0, 0, 250);
		// 反面
		yuzhou[1].position.set(0, 0, -250);
		// 左面
		yuzhou[2].position.set(-250, 0, 0);
		yuzhou[2].rotation.set(0, PIC2, 0);
		// 右面
		yuzhou[3].position.set(250, 0, 0);
		yuzhou[3].rotation.set(0, PIC2, 0);
		// 上面
		yuzhou[4].position.set(0, 250, 0);
		yuzhou[4].rotation.set(PIC2, 0, 0);
		// 下面
		yuzhou[5].position.set(0, -250, 0);
		yuzhou[5].rotation.set(PIC2, 0, 0);
	})(Math.PI / 2);
	/* 星球 */
	(function(){
		// 太阳
		(function(){
			var taiyang_geometry = new THREE.SphereGeometry(32, 100, 100);
			var taiyang_material = new THREE.MeshLambertMaterial({
				emissive: 0xe65f05,
				map: THREE.ImageUtils.loadTexture("img/taiyang2.jpg"),
				side: THREE.DoubleSide,
				color: 0xffffff
			});
			taiyang = new THREE.Mesh(taiyang_geometry, taiyang_material);
			scene.add(taiyang);
			taiyang.position.set(0, 0, 0);
			var taiyang_light = new THREE.PointLight(0xffffff, 1, 350);
			taiyang_light.position.set(0, 0, 0);
			scene.add(taiyang_light);
		})();
		// 水星
		(function(){
			var shui_geometry = new THREE.SphereGeometry(1, 100, 100);
			var shui_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/shui.jpg"),
				side: THREE.DoubleSide,
			});
			shui = new THREE.Mesh(shui_geometry, shui_material);
			scene.add(shui);
			shui.position.set(0, 0, 35);
		})();
		// 金星
		(function(){
			var jin_geometry = new THREE.SphereGeometry(2, 100, 100);
			var jin_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/jin.jpg"),
				side: THREE.DoubleSide,
			});
			jin = new THREE.Mesh(jin_geometry, jin_material);
			scene.add(jin);
			jin.position.set(0, 0, 42);
		})();
		// 地球
		(function(){
			var di_geometry = new THREE.SphereGeometry(4, 100, 100);
			var di_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/di.jpg"),
				side: THREE.DoubleSide,
			});
			di = new THREE.Mesh(di_geometry, di_material);
			scene.add(di);
			di.position.set(0, 0, 55);
		})();
		// 火星
		(function(){
			var huo_geometry = new THREE.SphereGeometry(5, 100, 100);
			var huo_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/huo.jpg"),
				side: THREE.DoubleSide,
			});
			huo = new THREE.Mesh(huo_geometry, huo_material);
			scene.add(huo);
			huo.position.set(0, 0, 70);
		})();
		// 木星
		(function(){
			var mu_geometry = new THREE.SphereGeometry(17, 100, 100);
			var mu_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/mu.jpg"),
				side: THREE.DoubleSide,
			});
			mu = new THREE.Mesh(mu_geometry, mu_material);
			scene.add(mu);
			mu.position.set(0, 0, 100);
			mu.rotation.set(0, 20, 0);
		})();
		// 土星
		(function(){
			var tu_geometry = new THREE.SphereGeometry(11, 100, 100);
			var tu_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/tu.jpg"),
				side: THREE.DoubleSide,
			});
			tu = new THREE.Mesh(tu_geometry, tu_material);
			scene.add(tu);
			tu.position.set(0, 0, 140);
			tu.rotation.set(0.5, 0, 0);
			// 土星环
			var tu_huan_geometry = new THREE.CylinderGeometry(14, 22, 0, 100, 100, true);
			var tu_huan_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/tu_huan.jpg"),
				side: THREE.DoubleSide,
			});
			tu_huan = new THREE.Mesh(tu_huan_geometry, tu_huan_material);
			scene.add(tu_huan);
			tu_huan.position.set(0, 0, 140);
			tu_huan.rotation.set(0.5, 0, 0);
		})();
		// 天王星
		(function(){
			var tian_geometry = new THREE.SphereGeometry(9, 100, 100);
			var tian_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/tian.jpg"),
				side: THREE.DoubleSide,
			});
			tian = new THREE.Mesh(tian_geometry, tian_material);
			scene.add(tian);
			tian.position.set(0, 0, 170);
			tian.rotation.set(0, 0, 0.3);
			// 天王星环
			var tian_huan_geometry = new THREE.CylinderGeometry(10, 12, 0, 100, 100, true);
			var tian_huan_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/tian_huan.jpg"),
				side: THREE.DoubleSide,
			});
			tian_huan = new THREE.Mesh(tian_huan_geometry, tian_huan_material);
			scene.add(tian_huan);
			tian_huan.position.set(0, 0, 170);
			tian_huan.rotation.set(0, 0, 0.3);
		})();
		// 海王星
		(function(){
			var hai_geometry = new THREE.SphereGeometry(6, 100, 100);
			var hai_material = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture("img/hai.jpg"),
				side: THREE.DoubleSide,
			});
			hai = new THREE.Mesh(hai_geometry, hai_material);
			scene.add(hai);
			hai.position.set(0, 0, 192);
		})();
	})();
	/*坐标系
	// 画线x
	(function(){
		var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial( { vertexColors: true } );
        var color = new THREE.Color( 0xffffff );
        // 线的材质可以由2点的颜色决定
        var p1 = new THREE.Vector3(200, 0, 0);
        var p2 = new THREE.Vector3(0, 0, 0);
        geometry.vertices.push(p1);
        geometry.vertices.push(p2);
        geometry.colors.push(color, color);
        var line = new THREE.Line( geometry, material, THREE.LinePieces );
        scene.add(line);
	})();
	// 画线y
	(function(){
		var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial( { vertexColors: true } );
        var color = new THREE.Color( 0x7cfc00 );
        // 线的材质可以由2点的颜色决定
        var p1 = new THREE.Vector3(0, 200, 0);
        var p2 = new THREE.Vector3(0, 0, 0);
        geometry.vertices.push(p1);
        geometry.vertices.push(p2);
        geometry.colors.push(color, color);
        var line = new THREE.Line( geometry, material, THREE.LinePieces );
        scene.add(line);
	})();
	// 画线z
	(function(){
		var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial( { vertexColors: true } );
        var color = new THREE.Color( 0x00ffff );
        // 线的材质可以由2点的颜色决定
        var p1 = new THREE.Vector3(0, 0, 200);
        var p2 = new THREE.Vector3(0, 0, 0);
        geometry.vertices.push(p1);
        geometry.vertices.push(p2);
        geometry.colors.push(color, color);
        var line = new THREE.Line( geometry, material, THREE.LinePieces );
        scene.add(line);
	})();
	*/
	/* 初始化 */
	(function(){
		var PI2 = 2 * Math.PI; // 弧度的最大值
		var zuobiaoxi = [ // 显示坐标系的信息
			document.getElementById("zuobiao-x"), // X
			document.getElementById("zuobiao-y"), // Y
			document.getElementById("zuobiao-z")  // Z
		];
		// 自转
		function zizhuan(){
			taiyang.rotation.y = taiyang.rotation.y + 0.01 >= 2 * PI2 ? 0 : taiyang.rotation.y + 0.01; // 太阳自转
			shui.rotation.y = shui.rotation.y + 0.1 >= 2 * PI2 ? 0 : shui.rotation.y + 0.1;            // 水星自转
			jin.rotation.y = jin.rotation.y + 0.05 >= 2 * PI2 ? 0 : jin.rotation.y + 0.05;             // 金星自转
			di.rotation.y = di.rotation.y + 0.05 >= 2 * PI2 ? 0 : di.rotation.y + 0.05;                // 地球自转
			huo.rotation.y = huo.rotation.y + 0.03 >= 2 * PI2 ? 0 : huo.rotation.y + 0.03;             // 火星自转
			mu.rotation.y = mu.rotation.y + 0.003 >= 2 * PI2 ? 0 : mu.rotation.y + 0.003;              // 木星自转
			tu.rotation.y = tu.rotation.y + 0.01 >= 2 * PI2 ? 0 : tu.rotation.y + 0.01;                // 土星自转
			tian.rotation.y = tian.rotation.y + 0.005 >= 2 * PI2 ? 0 : tian.rotation.y + 0.005;        // 天王自转
			hai.rotation.y = hai.rotation.y + 0.003 >= 2 * PI2 ? 0 : hai.rotation.y + 0.003;           // 海王星自转
		}
		// 定义角度
		var shui_deg, jin_deg, di_deg, huo_deg, mu_deg, tu_deg, tian_deg, hai_deg;
		shui_deg = jin_deg = di_deg = huo_deg = mu_deg = tu_deg = tian_deg = hai_deg = 0;
		// 公转
		function gongzhuan(){
			// 水星
			shui_deg = shui_deg + 0.1 >= PI2 ? 0 : shui_deg + 0.1;
			shui.position.set(35 * Math.sin(shui_deg), 0, 35 * Math.cos(shui_deg));
			// 金星
			jin_deg = jin_deg + 0.07 >= PI2 ? 0 : jin_deg + 0.07;
			jin.position.set(42 * Math.sin(jin_deg), 0, 42 * Math.cos(jin_deg));
			// 地球
			di_deg = di_deg + 0.03 >= PI2 ? 0 : di_deg + 0.03;
			di.position.set(55 * Math.sin(di_deg), 0, 55 * Math.cos(di_deg));
			// 火星
			huo_deg = huo_deg + 0.01 >= PI2 ? 0 : huo_deg + 0.01;
			huo.position.set(70 * Math.sin(huo_deg), 0, 70 * Math.cos(huo_deg));
			// 木星
			mu_deg = mu_deg + 0.002 >= PI2 ? 0 : mu_deg + 0.002;
			mu.position.set(100 * Math.sin(mu_deg), 0, 100 * Math.cos(mu_deg));
			// 土星
			tu_deg = tu_deg + 0.0009 >= PI2 ? 0 : tu_deg + 0.0009;
			tu.position.set(140 * Math.sin(tu_deg), 0, 140 * Math.cos(tu_deg));
			tu_huan.position.set(140 * Math.sin(tu_deg), 0, 140 * Math.cos(tu_deg));
			// 天王星
			tian_deg = tian_deg + 0.0005 >= PI2 ? 0 : tian_deg + 0.0005;
			tian.position.set(170 * Math.sin(tian_deg), 0, 170 * Math.cos(tian_deg));
			tian_huan.position.set(170 * Math.sin(tian_deg), 0, 170 * Math.cos(tian_deg));
			// 海王星
			hai_deg = hai_deg + 0.0003 >= PI2 ? 0 : hai_deg + 0.0003;
			hai.position.set(192 * Math.sin(hai_deg), 0, 192 * Math.cos(hai_deg));
		}
		// 显示信息
		function displayXYZ(){
			zuobiaoxi[0].innerHTML = parseInt(camera.position.x);  // 摄像机X
			zuobiaoxi[1].innerHTML = parseInt(camera.position.y);  // 摄像机Y
			zuobiaoxi[2].innerHTML = parseInt(camera.position.z);  // 摄像机Z
		}
		// 窗口改变事件
		function windowChange(){
			var x = camera.position.x,
				y = camera.position.y,
				z = camera.position.z;
			initCamera();
			controls = new THREE.OrbitControls(camera);
			camera.position.set(x, y, z);
			camera.lookAt({
				x: 0,
				y: 0,
				z: 0
			});
			renderer.setSize(canvasbox.clientWidth, canvasbox.clientHeight);
			displayXYZ();
		}
		// 动画
		function animate(){
			states.begin();
			zizhuan();
			gongzhuan();
			renderer.clear();
			renderer.render(scene, camera);
			states.end();
			requestAnimationFrame(animate);
		}
		// 初始化
		function init(){
			displayXYZ();
			_window.addEventListener("resize", windowChange, false);
			controls.addEventListener("change", displayXYZ, false);
			requestAnimationFrame(animate);
		}
		init();
	})();
})(document.getElementById("canvasbox"), window);
