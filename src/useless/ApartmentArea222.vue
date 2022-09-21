<template>
  <el-container
      class="apartment"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0,0,0,0.8)"
  >
    <div v-if="Number(status)===1">
      <el-aside width="180" style="height: 100%">
        <el-menu
            default-active="0"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            @select="handleSelect"
        >
          <div>
            <el-menu-item
                v-for="(item,index) in menuList"
                :key="item.text"
                :index="index.toString()"
            >
              <i class="item:icon"></i>
              <span>{{ item.text }}}</span>
            </el-menu-item>
          </div>
        </el-menu>
      </el-aside>
    </div>

    <div v-else>
      <el-aside width="180" style="height: 100%">
        <el-menu
            default-active="0"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            @select="userhanleSelect"
        >
          <el-menu-item
              v-for="(item, index) in userMenulist"
              :key="item.text"
              :index="index.toString()"
          >
            <i :class="item.icon"></i>
            <span>{{ item.text }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
    </div>

    <el-main>
      <div id="container" class="container_box"></div>
      <el-card style="width: 300px" class="label">
        <div v-for="(info,index) in dataInfo" :key="index">
          <span>{{ info.key }}}</span>
          <span style="display: inline-block; margin-left: 50px">
            info.value
          </span>
          <el-divider/>
        </div>
      </el-card>
      <div id="chart1" class="chart chartLayout"></div>
      <div id="chart2" class="chart chartLayout"></div>
    </el-main>
  </el-container>
</template>

<script>
import * as THREE from "three";
import * as echarts from "echarts";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import {GUI} from "three/examples/jsm/libs/lil-gui.module.min.js";
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import Stats from "../../public/static/js/stats";
import {
  citylist,
  raychartlist,
  barchartlist,
  carPark,
  buildstatus,
} from "@/requestApi/city";
import {clickPick} from "../../public/static/js/clickPick";
import {Sky} from "../../public/static/js/Sky";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {CopyShader} from "three/examples/jsm/shaders/CopyShader";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";
import {
  initPark,
  // initFirestation,
  // initFirecar,
  initAmbulance,
  initUfo,
  // initFly,
  initBank,
  initSchool,
  initModernBuilding,
  initCinema,
  // initPeople,
} from "@/utils/modelList";
import {initEchartOption1, initEchartOption2} from "@/utils/echarts";
import {initRenderer, initControls} from "@/utils/baseElement";

export default {
  name: "ApartmentArea",
  data() {
    return {
      menuList: [
        {text: "Manage", icon: "el-icon-s-home"},
        {text: "Car Time", icon: "el-icon-collection-tag"},
        {text: "ECharts Page", icon: "el-icon-s-data"},
        {text: "Camera", icon: "el-icon-magic-stick"},
        {text: "Scout Mode", icon: "el-icon-eleme"},
        {text: "Drive Mode", icon: "el-icon-place"},
        {text: "Init Viewport", icon: "el-icon-loading"},
        {text: "Tour City", icon: "el-icon-video-camera-solid"},
      ],
      useMenulist: [
        // { text: "Car Time", icon: "el-icon-collection-tag" },
        {text: "Init Viewport", icon: "el-icon-loading"},
        {text: "Fog Weather", icon: "el-icon-light-rain"},
        // { text: "Verctor Canvas", icon: "el-icon-postcard" },
        {text: "Drive Mode", icon: "el-icon-place"},
        {text: "tour City", icon: "el-icon-video-camera-solid"},
      ],
      groupIndex: 0,
      progress: 0,
      css2dLabelArray: [],
      spriteLabelArray: [],
      effectController: {
        A: "",
      },
      username: "",
      status: 0,
      dataInfo: [],
      canvas: null,
      dynamicSprite: null,
      timer: null,
      curve: null,
      curve2: null,
      truck: null,
      car: null,
      followTruck: false,
      move_rate: 0.0005,
      t: 0,
      loading: true,
      car_staytime: [],
      // 城市空气质量雷达图
      cityAQI: {
        title: "",
        mor_lst: [],
        noon_lst: [],
        even_lst: [],
      },
      // 家庭支出统计图
      consumetable: {
        title: "",
        date_lst: [],
        forecast_lst: [],
        real_lst: [],
      },
      // 卡车信息
      trucklist: {},
      // 汽车信息
      carlist: {},
      // 建筑信息
      buildinglist: {},
      // 球场信息
      basketballList: {},
      // 公交车信息
      buslist: {},
      // 树木信息
      treelist: {},
      // 停车场信息
      parkinglist: {},
      // 包围盒
      containBoxArray: [],
      // 火焰信息
      fireArray: [],
      // 正常视角
      normalView: true,
      // 是否展示扫描
      isShowScan: false,
      // 建筑状态
      buildingStatus: [],
      sky: null,
      Controller: {},
      sun: null,
      tagArray: [],
      click: false,
    };
  },
  mounted() {
    // TODO:此处待完善后端
    this.username = "koi"
    this.satue = 1;
    this.animationID = 0;
    this.scene = null;
    this.gui = null;
    this.stats = null;
    this.camera = null;
    this.axes = null;
    this.helper = null;
    this.cubeMap = null;
    this.renderer = null;
    this.fog = null;
    this.controls = null;
    this.lockControls = null;
    this.outlinePass = null;
    this.css2dRender = null;
    this.effectComposer = null;
    this.rollTexture = null;
    this.objList = null;
    this.mixer = null;
    this.texture = null;
    this.mesh2 = null;
    this.ambient = null;
    this.velocity = new THREE.Vector3(); //
    this.direction = new THREE.Vector3(); //第一人称运动的方向
    this.prevTime = performance.now(); //上一次render的时间
    this.moveForward = false; //是否向前运行
    this.moveBackward = false; //是否向后运行
    this.moveLeft = false; //是否向左运行
    this.moveRight = false; //是否向右运行
    this.canJump = false; //是否可以跳
    this.lockcontrols = null;
    this.isShowFire = false;
    this.clock = new THREE.Clock();
    this.container = document.querySelector("#container");
    this.citylistMed();
    this.raychartlistMed();
    this.barchartlistMed();
    this.buildstatusMed();
    this.init();
    clearInterval(this.timer);
  },
  beforeDestroy() {
    this.scene.clear();
    this.stats = null;
    this.camera = null;
    this.gui.doElement.style.cssText = "display:none";
    cancelAnimationFrame(this.animationID);
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    this.renderer.content = null;
    const gl = this.renderer.domElement.getContext("webgl");
    gl && gl.getExtension("WEBGL_lose_context").loseContext();
    this.controls = null;
    this.outlinePass = null;
    this.css2dRender = null;
  },
  methods: {
    handleSelect(index) {
      switch (index) {
        case "0":
          this.$router.replace("/backstageManage/userList");
          break;
        case "1":
          this.addCssLabel();
          break;
        case "2":
          this.initCharts();
          break;
        case "3":
          this.addCamera();
          break;
        case "4":
          this.changeMode();
          break;
        case "5":
          this.followTruck = true;
          break;
        case "6":
          this.initViewpoint();
          break;
        case "7":
          this.tourCity();
          break;
      }
    }
  },
  userhandleSelect(index) {
    switch (index) {
      case "0":
        this.initViewpoint();
        break;
      case "1":
        this.addFog();
        break;
      case "2":
        this.followTruck = true;
        break;
      case "3":
        this.tourCity();
        break;
    }
  },
  tourCity() {
    this.normalView = false
    this.camera.position.y = 100;
    this.camera.lookAt(0, 100, 0);
    this.lockControls.getObject().position.x = 0;
    this.lockControls.getObject().position.y = 0;
    this.lockControls.getObject().position.z = 580;
    this.lockControls.lock();
  },
  // 初始化方法
  init() {
    // 初始化场景
    this.initSceneMed();
    // 初始化相机
    this.initCamera();
    // 初始化灯光
    this.initStats();
    // 初始化渲染器
    this.initRendererMed();
    // 初始化控制器
    this.initControlsMed();
    // 初始化背景
    this.initSkyBox();
    // 初始化指针锁定控制器
    this.initPointLockControl();
    this.initComposerMed();
    this.carParkMed();
    this.AsyncInitModel();

    window.addEventListener("resize", this.onWindowResize, false);
  },
  // 初始化场景
  initSceneMed() {
    this.scene = new THREE.Scene();
  },
  // 初始化相机
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
        45,
        this.container.clientWidth / this.container.clientHeight,
        10,
        10000
    );
    this.camera.position.set(1000, 1500, 3500);
  },
  // 初始化灯光
  initLight() {
    // 点光源
    const PointLight = new THREE.PointLight(0xffffff, 0.6)
    this.scene.add(PointLight);
    // 环境光
    this.ambient = new THREE.AmbientLightProbe(0xffffff, 1);
    this.scene.add(this.ambient);
    this.camera.add(PointLight);
  },
  // 初始化渲染器
  initRendererMed() {
    // css2d渲染器
    this.css2dRender = new CSS2DRenderer();
    // 场景渲染器
    this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: true
        }
    );
    initRenderer(this.css2dRender, this.container, this.renderer);
  },
  // 初始化控制器
  initControlsMed() {
    // 轨道控制器
    this.container = new OrbitControls(this.camera, this.renderer.domElement);
    initControls(this.controls);
  },
  // 初始化模型
  initModelMed() {
    return new Promise((resolve, reject) => {
      new MTLLoader().setPath("/static/obj/")
          .load(`${url}.obj`, () => {
            if (obj) {
              this.objList = obj;
              this.loading = false;
              obj.children.forEach((child) => {
                if (child.name === "ground") {
                  child.material.forEach((res) => {
                    if (res.name === "Grass") {
                      (res.color.r = 0.52)
                      (res.color.g = 0.62)
                      (res.color.b = 0.52)
                    }
                  })
                }
              })
              obj.children.forEach((child) => {
                child.geometry.computeBoundingBox();
                var centroid = new THREE.Vector3();
                centroid.addVectors(
                    child.geometry.boundingBox.min,
                    child.geometry.boundingBox.max
                );
                centroid.multiplyScalar(0.5);
                centroid.applyMatrix4(child.matrixWorld);
                child.geometry.center(centroid.x, centroid.y, centroid.z);
                child.position.set(centroid.x, centroid.y, centroid.z);
              })
              this.scene.add(obj)
              resolve(obj)
            } else {
              reject("error");
            }
          });
    });
  },
  // 克隆出多个建筑
  cloneBuilding(object) {
    object.children.forEach((res) => {
      if (res.name === "http") {
        res.name = "parking";
        res.scale.set(0.8, 0.8, 0.8);
        res.position.set(200, 100, 1400);
        res.rotateY(-Math.PI / 2);
        this.scene.add(res);
      }
      if (res.name === "dep8") {
        res.name = "developmentDep";
        res.position.set(1150, 250, 0);
        res.rotateY(Math.PI)
        this.scene.add(
            res,
            res.clone().translateZ(550),
            res.clone().translateZ(1100),
            res.clone().translateX(-500).rotateY(Math.PI),
            res.clone().translateX(-500).translateZ(550).rotateY(Math.PI),
            res.clone().translateX(-500).translateZ(1100).rotateY(Math.PI)
        );
      }
      if (res.name == "ground") {
        res.position.set(-400, 55, -3500);
        res.scale.set(0.4, 0.4, 1);
        res.rotateY(-Math.PI / 2);
        this.scene.add(res);
      }
    })
  },
  // 加载器其他模型
  initOtherModel() {
    // 加载警察局
    // initPolice(this.scene);
    // 加载银行
    initBank(this.scene);
    // 加载公园
    initPark(this.scene);
    // 加载医院
    // initHosiptal(this.scene);
    // 加载消防局
    // initFirestation(this.scene);
    // 加载消防车
    // initFirecar(this.scene);
    // 初始化救护车
    initAmbulance(this.scene);
    // 初始化无人机
    // initFly(this.scene, this.mixer);
    // 初始化学校
    initSchool(this.scene);
    // 加载建筑
    initModernBuilding(this.scene);
    // 加载电影院
    initCinema(this.scene);
    // 加载ufo
    initUfo(this.scene);
    // 加载人物
    // initPeople(this.scene);
  },
  // 初始化stats
  initStats() {
    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.top = "0px";
    this.stats.domElement.style.left = "180px";
    document.body.appendChild(this.stats.domElement);
    return this.stats;
  },
  // 初始化控制板
  initGui(status) {
    if (Number(status) === 1) {
      this.gui = new GUI();
      this.gui.domElement.classList.add()
      this.gui.domElement.style.cssText =
          "position:absolute;top:0;right:0px";
      const options = {
        Helper: false,
        Fog: false,
        Verctor: false,
      };
      this.gui.add(this.effectController, "A")
    }
  },
  guiChanged() {
    const uniforms = this.sky.material.uniforms;
    uniforms["rayleigh"].value = this.Controller.rayleigh;
    uniforms["turbidity"].value = this.Controller.turbidity;
    uniforms["mieCoefficient"].value = this.Controller.mieCoefficient;
    uniforms["mieDirectionalG"].value = this.Controller.mieDirectionalG;
    const phi = THREE.MathUtils.degToRad(90 - this.Controller.elevation);
    const theta = THREE.MathUtils.degToRad(this.Controller.azimuth);
    this.sun.setFromSphericalCoords(1, phi, theta);
    uniforms["sunPosition"].value.copy(this.sun);
  },
  // 初始化背景
  initSkyBox() {
    this.sky = new Sky();
    this.sky.scale.setScaling(450000);
    this.scene.add(this.sky)
    this.Controller = {
      rayleigh: 0.5, //夜空亮度单位
      elevation: 2.6, // 高度
      azimuth: 180, // 方位角
      turbidity: 1.8, // 浑浊度
      mieCoefficient: 0.1, // 系数
      mieDirectionalG: 0.226, // 方向
    };
    this.sun = new THREE.Vector3();
    this.guiChanged();
  },
  // 改变背景
  changeSkyBox(type) {
    const starUrls = [
      require("../../public/static/images/skybox/dark-s_px.jpg"), // right
      require("../../public/static/images/skybox/dark-s_nx.jpg"), // left
      require("../../public/static/images/skybox/dark-s_py.jpg"), // top
      require("../../public/static/images/skybox/dark-s_ny.jpg"), // bottom
      require("../../public/static/images/skybox/dark-s_pz.jpg"), // back
      require("../../public/static/images/skybox/dark-s_nz.jpg"), // front
    ];
    const parkUrls = [
      require("../../public/static/images/Park2/posx.jpg"), // 右
      require("../../public/static/images/Park2/negx.jpg"), // 左
      require("../../public/static/images/Park2/posy.jpg"), // 顶
      require("../../public/static/images/Park2/negy.jpg"), // 底
      require("../../public/static/images/Park2/posz.jpg"), // 后
      require("../../public/static/images/Park2/negz.jpg"), // 前
    ];
    if (type === "Star") {
      this.scene.background = new THREE.CubeTextureLoader().load(starUrls)
    } else {
      this.scene.background = new THREE.CubeTextureLoader().load(parkUrls);
    }
  },
  // 初始化图表
  initCharts() {
    //for ()
  },
  // 初始化视角
  initViewPoint() {
    this.followTruck = false;
    this.controls.position0.set(2000, 2000, 2000);
    this.normalView = true;
    this.controls.reset();
  },
  // 初始化汽车路线
  initCurve(obj) {
    this.curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(500, 20, -1200),
          new THREE.Vector3(500, 20, -800),
          new THREE.Vector3(500, 20, -600),
          new THREE.Vector3(500, 20, 400),
          new THREE.Vector3(-400, 20, 400),
          new THREE.Vector3(-400, 20, -600),
          new THREE.Vector3(-400, 20, -1300),
        ],
        true
    );
    const vertices = this.curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const lineMaterial = new THREE.LineBasicMaterial({
      transparent: this,
      opacity: 0,
    });
    const curveMesh = new THREE.Line(geometry, lineMaterial);
    this.scene.add(curveMesh);
    this.truck = obj.getObjectByName("trunk4");
  },
  // 初始化卡车2的移动路线
  initTruckCurve(obj) {
    this.curve2 = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-400, 20, 450),
          new THREE.Vector3(-400, 20, -600),
          new THREE.Vector3(-400, 20, -1300),
          new THREE.Vector3(-1000, 20, -1200),
          new THREE.Vector3(-1100, 20, -600),
          new THREE.Vector3(-1100, 20, -800),
          new THREE.Vector3(-1100, 20, 500),
        ],
        true
    );
    const vertices = this.curve2.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const lineMaterial = new THREE.LineBasicMaterial({
      transparent: this,
      opacity: 0,
    });
    const curveMesh2 = new THREE.Line(geometry, lineMaterial);
    this.scene.add(curveMesh2);
    this.car = obj.getObjectByName("car4");
  },
  // 汽车运动
  truckMove(curve, truck) {
    this.progress += this.move_rate;
    if (curve) {
      const point = curve.getPoint(this.progress);
      // 下一个要走的点的位置
      const point_next = curve.getPoint(this.progress + this.move_rate);
      if (point && point.x) {
        truck.position.set(point.x, point.y, point.z);
        // 向下一个要走的点方向看齐
        truck.lookAt(point_next.x, point_next.y, point_next.z);
        if (this.followTruck) {
          this.camera.position.set(point.x, point.y + 45, point.z);
          this.camera.lookAt(point_next.x, point_next.y + 45, point_next.z);
          this.controls.position0.set(point.x, point.y + 45, point.z);
          // 将控制器看齐下一个点的位置(摆正车头的位置)
          this.controls.target.set(
              point_next.x,
              point_next.y + 45,
              point_next.z
          );
        }
      }
    }
    // 将canvas车速标签跟随汽车移动显示
    if (this.dynamicSprite) {
      this.dynamicSprite.position.set(
          truck.position.x,
          truck.position.y,
          truck.position.z
      );
      this.dynamicSprite.translateY(100);
    }
  },
  // 初始化效果器
  initComposerMed() {
    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.renderTarget1.stencilBuffer = true;
    this.effectComposer.renderTarget2.stencilBuffer = true;
    // 创建shaderPass 可以在shaderpass里面添加各种着色器达到不同的效果
    const effectCopy = new ShaderPass(CopyShader);
    // 让effectcopy渲染到屏幕上
    effectCopy.renderToScreen = true;
    // 添加renderPass通道,这个通道会渲染场景,但不会将渲染结果输出到屏幕上
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effectComposer.addPass(renderPass);
    this.effectComposer.addPass(effectCopy);
    // outlinePass给对象添加轮廓线
    this.outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        this.scene,
        this.camera
    );
    this.outlinePass.edgeStrength = 5; //包围线浓度
    this.outlinePass.visibleEdgeColor.set(0x00ffff); //包围线颜色
    this.effectComposer.addPass(this.outlinePass);
    // FXAAShader主要解决锯齿问题
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms["resolution"].value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
    );
    effectFXAA.renderToScreen = true;
    this.effectComposer.addPass(effectFXAA);
    clickPick(this);
  },
  // 添加点击效果
  // initClickPick() {
  //   clickPick(this);
  // },
  // 初始化指针锁定控制器和监听键盘事件
  initPointLockControl() {
    this.lockcontrols = new PointerLockControls(this.camera, document.body);
    const onKeyDown = (event) => {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          this.moveForward = true;
          break;
        case 37: // left
        case 65: // a
          this.moveLeft = true;
          break;
        case 40: // down
        case 83: // s
          this.moveBackward = true;
          break;
        case 39: // right
        case 68: // d
          this.moveRight = true;
          break;
        case 32: // space
          if (this.canJump === true) this.velocity.y += 350;
          this.canJump = false;
          break;
      }
    };
    const onKeyUp = (event) => {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          this.moveForward = false;
          break;
        case 37: // left
        case 65: // a
          this.moveLeft = false;
          break;
        case 40: // down
        case 83: // s
          this.moveBackward = false;
          break;
        case 39: // right
        case 68: // d
          this.moveRight = false;
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
  },
  // 第一人称移动 需要在render()里面实时更新位置
  firstPersonMove() {
    // if (this.lockcontrols.isLocked) {
    // 每次都获取上一次的间隔时间 因为根据性能不同每次调用循环函数的时间都是不一样的
    const time = performance.now();
    // 为了不让性能影响操作的速度 我们将他设置为一个因数 所谓性能高那么间隔时间就短
    const delta = (time - this.prevTime) / 1000;
    // 减速因子 设置一下（10）减速因子 他越快整个过程中速度就会越慢 减速的过程就会越快
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    // 方向矢量 鼠标操作的时候控制方向 的变量
    // 如果正数就是往前 负数就是往后
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
    this.direction.normalize(); // 确保了各个方向的一致运动
    // 有一个缓冲作用 避免快速启动 更贴切现实操作 为了保证鼠标抬起后，场景不直接暂停，而是有一个简短的过渡效果
    if (this.moveForward || this.moveBackward)
      this.velocity.z -= this.direction.z * 2000.0 * delta;
    if (this.moveLeft || this.moveRight)
      this.velocity.x -= this.direction.x * 2000.0 * delta;
    // 通过getObject()获取到控制对象 translate改变位置会根据视角调整 更符合现实一点
    this.lockcontrols.getObject().translateX(this.velocity.x * delta);
    this.lockcontrols.getObject().position.y += this.velocity.y * delta; // new behavior
    this.lockcontrols.getObject().translateZ(this.velocity.z * delta);
    // 保证高于地面的距离
    if (this.lockcontrols.getObject().position.y < 100) {
      this.velocity.y = 0;
      this.lockcontrols.getObject().position.y = 100;
      this.canJump = true;
    }
    this.prevTime = time;
    // }
  },
  // 火焰动画
  updateLoop(num) {
    this.t += 0.1; //调节火焰切换速度
    if (this.t > num) this.t = 0;
    //  Math.floor(t)取整 保证一帧一帧切换
    this.texture.offset.x = Math.floor(this.t) / num; // 动态更新纹理偏移 播放关键帧动画 产生火焰然后效果
  },
  render() {
    this.animationID = requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    if (this.lockcontrols.isLocked) {
      this.firstPersonMove();
    }
    this.stats.update();
    // 刷新动画
    TWEEN.update();
    const delta = this.clock.getDelta();
    // effectComposer里面是对renderer渲染器进行后期处理,则可以在他身上进行render()
    if (this.click) {
      this.effectComposer.render(delta);
    }
    this.css2dRender.render(this.scene, this.camera);
    // 汽车移动方法
    this.truckMove(this.curve2, this.car);
    this.truckMove(this.curve, this.truck);
    // 扫描效果
    if (this.isShowScan) {
      this.mesh2.rotateZ(0.03);
    }
    if (this.isShowFire) {
      this.updateLoop(15);
    }
    // 轨道控制器和指针锁定控制器会有冲突 不能同时存在
    if (this.normalView) {
      this.controls.update();
    }
    if (this.mixer !== null) {
      // clock.getDelta()方法获得两帧的时间间隔
      this.mixer.update(delta);
    }
  },
  showLabel() {
    this.test("policeStation", "警察局", 12);
    this.test("hospital", "医院", 3);
    this.test("cinema", "电影院", 6);
    this.test("modern_building", "现代建筑", 10);
    this.test("fireStation", "消防局", 7);
  },
  test(obj, content, height) {
    if (this.tagArray.length >= 5) {
      for (const label of this.tagArray) {
        label.parent.remove(label);
      }
      this.tagArray.splice(0);
    } else {
      const object = this.scene.children.filter((item) =>
          item.name.includes(obj)
      );
      object.forEach((ele) => {
        const label = this.tag(content);
        label.position.y = height;
        ele.add(label);
        this.tagArray.push(label);
      });
    }
  },
  // 切换查看模式
  changeMode() {
    if (this.fireArray.length > 0) {
      for (const label of this.fireArray) {
        label.parent.remove(label);
      }
      this.fireArray.splice(0);
      this.isShowFire = false;
    } else {
      const depObj = this.scene.children[this.groupIndex].children.filter(
          (item) => item.name.includes("dep")
      );
      depObj.forEach((ele) => {
        this.buildingStatus.forEach((res) => {
          if (res.name == ele.name && res.type == 1) {
            const label = this.tag(`${ele.name}失火了！！！`);
            label.position.y = ele.position.y * 3;
            const fire = this.createFlame(
                8,
                ele.position.x,
                ele.position.y,
                ele.position.z
            );
            this.isShowFire = true;
            this.fireArray.push(label, fire);
            ele.add(label, fire);
          } else if (res.name == ele.name && res.type == 2) {
            const label = this.tag(`${ele.name}有紧急需求！！！`);
            label.position.y = ele.position.y * 3;
            this.fireArray.push(label);
            ele.add(label);
          } else if (res.name == ele.name && res.type == 3) {
            const label = this.tag(`${ele.name}有危险发生！！！`);
            label.position.y = ele.position.y * 2;
            this.fireArray.push(label);
            ele.add(label);
          }
        });
      });
      const scanEffect = this.createScanEffect();
      this.isShowScan = true;
      this.fireArray.push(scanEffect);
      this.scene.add(scanEffect);
    }
  },
  // 创建一个HTML标签
  tag(name) {
    // 创建div元素(作为标签)
    let div = document.createElement("div");
    div.innerHTML = name;
    div.classList.add("tag");
    //div元素包装为CSS2模型对象CSS2DObject
    let label = new CSS2DObject(div);
    label.name = "firelabel";
    div.style.pointerEvents = "none"; //避免HTML标签遮挡三维场景的鼠标事件
    // 设置HTML元素标签在three.js世界坐标中位置
    // label.position.set(x, y, z);
    return label; //返回CSS2模型标签
  },
  // 创建一个火焰动画
  createFlame(size, x, y, z) {
    let w = size;
    let h = 1.6 * w;
    const geometry = new THREE.PlaneGeometry(w, h);
    geometry.translate(0, h / 2, 0);
    const textureLoader = new THREE.TextureLoader();
    this.texture = textureLoader.setPath("/static/images/").load("fire.png");
    const num = 15; //火焰多少帧图
    // .repeat方法设置uv两个方向纹理重复数量
    this.texture.repeat.set(1 / num, 1); // 1/num：从图像上截图一帧火焰
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.4, //整体调节透明度 和三维场景相融合
      side: THREE.DoubleSide, //双面可见
      depthWrite: false, //是否对深度缓冲区有任何的影响
    });
    const fire = new THREE.Mesh(geometry, material); // 火焰网格模型
    const group = new THREE.Group();
    fire.name = "fire";
    fire.scale.set(50, 50, 50);
    fire.position.set(x / 100, y / 2, z / 100);
    group.add(
        fire,
        fire.clone().rotateY(Math.PI / 2),
        fire.clone().rotateY(Math.PI / 4)
    );
    return group;
  },
  // 创建扫描雷达
  createScanEffect() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const scan_material = new THREE.MeshBasicMaterial({
      color: "orange",
      map: new THREE.TextureLoader()
          .setPath("/static/images/")
          .load("scan.png"),
      side: THREE.DoubleSide, //两面可见
      transparent: true, //需要开启透明度计算，否则着色器透明度设置无效
      // opacity: 0.5,//整体改变透明度
      depthTest: false,
    });
    this.mesh2 = new THREE.Mesh(geometry, scan_material);
    this.mesh2.position.set(0, 0, 0);
    this.mesh2.rotateX(-Math.PI / 2);
    this.mesh2.scale.set(40, 40, 40);
    return this.mesh2;
  },
  // 添加css2d标签
  addCssLabel() {
    if (this.css2dLabelArray.length > 0) {
      for (const label of this.css2dLabelArray) {
        label.parent.remove(label);
      }
      this.css2dLabelArray.splice(0);
    } else {
      const labelObj = this.scene.children[this.groupIndex].children.filter(
          (item) => item.name.includes("car")
      );
      let i = 0;
      labelObj.forEach((ele) => {
        const css2dLabel = document.createElement("div");
        css2dLabel.innerHTML = `<div style="text-align: center">${ele.name}</div><div class=".labelText">已停放${this.car_staytime[i].staytime}时</div>`;
        const label = new CSS2DObject(css2dLabel);
        label.name = `${ele.name}csslabel`;
        css2dLabel.classList.add("css2dLabel");
        this.css2dLabelArray.push(label);
        ele.add(label);
        i += 1;
      });
    }
  },
  // 添加摄像头标签
  addCamera() {
    const trr = ["trafficLight1", "trafficLight5", "trafficLight3"];
    const imgUrl = require("../../public/static/images/video.png");
    if (this.spriteLabelArray.length) {
      for (const label of this.spriteLabelArray) {
        label.parent.remove(label);
      }
      this.spriteLabelArray.splice(0);
    } else {
      trr.forEach((item) => {
        const obj = this.scene.getObjectByName(item);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: new THREE.TextureLoader().load(imgUrl),
          transparent: true,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.name = "spriteCamera";
        sprite.scale.set(150, 150, 150);
        sprite.position.set(obj.position.x, obj.position.y, obj.position.z);
        sprite.translateY(obj.position.y + 100);
        sprite.matrixWorldNeedsUpdate = true;
        this.spriteLabelArray.push(sprite);
        this.scene.add(sprite);
      });
    }
  },
  // canvas封装
  canvasMed(canvas, param, content) {
    const ctl = canvas.getContext("2d");
    ctl.fillStyle = "rgba(102, 255, 153, 1)";
    ctl.fillRect(0, 0, param.width, param.height);
    ctl.textAlign = "center";
    ctl.textBaseline = "middle";
    ctl.font = "bold 20px Arial";
    ctl.lineWidth = 32;
    ctl.fillStyle = "rgba(25, 25, 25, 1.0)";
    ctl.fillText(content, param.x, param.y);
  },
  // 添加移动车的速度标签
  addSpriteCanvas() {
    const param = {
      width: 60,
      height: 40,
      text: "10M/s",
      name: "dynamicLabel",
      x: 30,
      y: 20,
      z: 20,
    };
    const dynamicLabel = this.scene.getObjectByName("dynamicLabel");
    if (dynamicLabel) {
      this.scene.remove(dynamicLabel);
    } else {
      const obj = this.scene.getObjectByName("truck4", param);
      const canvas = document.createElement("canvas");
      canvas.height = param.height;
      canvas.width = param.width;
      this.canvasMed(canvas, param, param.text);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(
          obj.position.x + param.x,
          obj.position.y + param.y,
          obj.position.z + param.z
      );
      sprite.translateY(100);
      sprite.name = param.name;
      sprite.scale.set(100, 100, 100);
      this.scene.add(sprite);
      this.canvas = canvas;
      this.dynamicSprite = sprite;
      this.timer = setInterval(() => {
        const canvas = this.canvas;
        this.canvasMed(canvas, param, `${Math.round(Math.random() * 20)}M/s`);
        this.dynamicSprite.material.map.needsUpdate = true;
      }, 1000);
    }
  },
  // 屏幕自适应
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
    );
    this.css2dRender.setSize(
        this.container.clientWidth,
        this.container.clientHeight
    );
  },
  // 各种建筑信息接口
  citylistMed() {
    citylist().then((res) => {
      this.trucklist = res.data.objectlist[0].Trucks;
      this.carlist = res.data.objectlist[0].Cars;
      this.buildinglist = res.data.objectlist[0].Buildings;
      this.buslist = res.data.objectlist[0].Buses;
      this.basketballList = res.data.objectlist[0].Basketballgrounds;
      this.treelist = res.data.objectlist[0].Trees;
      this.parkinglist = res.data.objectlist[0].Parkings;
    });
  },
  // 雷达图接口
  raychartlistMed() {
    raychartlist().then((res) => {
      const morList = [];
      const noonList = [];
      const evenList = [];
      this.cityAQI.title = res.data.ray[0].title;
      morList.push(
          res.data.ray[0].aqi,
          res.data.ray[0].pm2,
          res.data.ray[0].pm10,
          res.data.ray[0].co,
          res.data.ray[0].no2,
          res.data.ray[0].so2
      );
      this.cityAQI.mor_lst.push(morList);
      noonList.push(
          res.data.ray[1].aqi,
          res.data.ray[1].pm2,
          res.data.ray[1].pm10,
          res.data.ray[1].co,
          res.data.ray[1].no2,
          res.data.ray[1].so2
      );
      this.cityAQI.noon_lst.push(noonList);
      evenList.push(
          res.data.ray[2].aqi,
          res.data.ray[2].pm2,
          res.data.ray[2].pm10,
          res.data.ray[2].co,
          res.data.ray[2].no2,
          res.data.ray[2].so2
      );
      this.cityAQI.even_lst.push(evenList);
    });
  },
  // 柱状图接口
  barchartlistMed() {
    barchartlist().then((res) => {
      const bardata = res.data.bar;
      bardata.forEach((element) => {
        this.consumetable.date_lst.push(element.date);
        this.consumetable.forecast_lst.push(element.forecastcount);
        this.consumetable.real_lst.push(element.realcount);
      });
    });
  },
  // 汽车停留时间接口
  carParkMed() {
    carPark().then((res) => {
      res.data.park.forEach((item) => {
        const {name, staytime} = item;
        this.car_staytime.push({name, staytime});
      });
    });
  },
  // 建筑状态接口
  buildstatusMed() {
    buildstatus().then((res) => {
      const statusArr = res.data.status;
      statusArr.forEach((ele) => {
        const {id, name, type} = ele;
        this.buildingStatus.push({id, name, type});
      });
    });
  },
}
</script>

<style scoped>

</style>