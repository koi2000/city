<template>
  <div class="box4"></div>
</template>

<script>
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export default{
  name:"MainPage",
  data(){
    return{
      scene:null,
      camera:null,
      renderer:null,
      stats:null,
      pointLight:null,
      pos:0,
      curve:null,
      sphereLightMesh:null,
    }
  },
  methods:{
    init(){
      this.scene=new THREE.Scene();//创建场景
      this.camera=new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,1,1000);//创建相机
      this.camera.position.set(0,70,70);//设置相机位置
      this.camera.lookAt(new THREE.Vector3(0,0,0));//设置相机关注点

      this.scene.add(new THREE.AxesHelper(20));//添加辅助函数
      this.pointLight=new THREE.PointLight(0xffffff);
      this.pointLight.position.set(0,5,5);
      this.pointLight.name="pointLight";//给灯光命名，用于后期获取灯光对象
      this.scene.add(this.pointLight);
      //创建灯
      let sphereLight=new THREE.SphereGeometry(0.5,50,50);
      let spLightMaterial=new THREE.MeshLambertMaterial({
        color:0xffffff,
        emissive:0xffffff
      })
      this.sphereLightMesh=new THREE.Mesh(sphereLight,spLightMaterial);
      this.sphereLightMesh.position.copy(this.pointLight.position);
      this.scene.add(this.sphereLightMesh);
      //创建物体
      let spheregeo=new THREE.SphereGeometry(5,100,100);
      let sphereMaterial=new THREE.MeshLambertMaterial({
        color:new THREE.Color().setHSL(Math.random(),0.5,0.5),
      })
      this.scene.add(new THREE.Mesh(spheregeo,sphereMaterial));
      this.curve = new THREE.CatmullRomCurve3( [
            //起点
            new THREE.Vector3(-10, 0, 10),
            //中间节点
            new THREE.Vector3(-5,10,-10),
            new THREE.Vector3(2, 5, -5),
            //终点
            new THREE.Vector3(10, 0, 10),
          ],
          true,
      );
      console.log(this.curve.getPoint( 0.1 ));
      // 绘制曲线
      let geometry = new THREE.BufferGeometry();
      // 初始化曲线的顶点(放样点，数值越大弯曲更光滑)
      geometry.vertices = this.curve.getSpacedPoints(1000);
      let material = new THREE.LineBasicMaterial({ color:new THREE.Color().setHSL(Math.random(),0.5,0.5) });
      let curveObject = new THREE.Line(geometry, material);
      this.scene.add(curveObject);


      this.renderer=new THREE.WebGLRenderer({antialias:true});//创建渲染器,并打开反锯齿
      this.renderer.setSize(window.innerWidth,window.innerHeight);//设置渲染的尺寸
      this.renderer.setClearColor(0x000000);//设置颜色
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.stats=new Stats();
      let control=new OrbitControls(this.camera,this.renderer.domElement);

      //挂载
      document.getElementsByClassName("box4")[0].appendChild(this.stats.domElement);
      document.getElementsByClassName("box4")[0].appendChild(this.renderer.domElement);
      window.addEventListener("resize",this.onSize,false);//添加监听事件
    },
    run(){
      requestAnimationFrame(this.run);

      let pointLight=this.scene.getObjectByName("pointLight");
      if(this.pos<1){
        pointLight.position=this.curve.getPointAt(this.pos);//光移动
        this.sphereLightMesh.position.copy(pointLight.position);//物体跟着光移动
        this.pos+=0.001;
      }else{
        this.pos=0;
      }

      this.renderer.render(this.scene,this.camera);
      this.stats.update();
    },
    onSize(){
      this.camera.aspect=window.innerWidth/window.innerHeight;
      this.renderer.setSize(window.innerWidth,window.innerHeight);
      this.camera.updateProjectionMatrix();
    }
  },
  mounted() {
    this.init();
    this.run();
  }
}
</script>

<style>
</style>

