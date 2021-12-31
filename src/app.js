import { 
  Engine, 
  Vector3, 
  Scene,
  WebXRHitTest,
  MeshBuilder,
  StandardMaterial,
  Color3,
  HemisphericLight
 } from 'babylonjs';

 const boxSize = 0.1;

class App {
  constructor() {
    const canvas = document.getElementById('canvas');
    const engine = new Engine(canvas, true);
    this.scene = new Scene(engine);

    this.initXR();
    this.createScene();

    engine.runRenderLoop(() => {
     if (this.scene) {
       this.scene.render();
     }
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });
  }

  async initXR() {
    const sessionMode = 'immersive-ar';
    const xr = await this.scene.createDefaultXRExperienceAsync({ uiOptions: { sessionMode }});
    const isSupported = await xr.baseExperience.sessionManager.isSessionSupportedAsync(sessionMode);
    if (!isSupported) {
      alert('WebXR is not supported')
    } else {
      const hitTest = xr.baseExperience.featuresManager.enableFeature(WebXRHitTest, 'latest', { entityTypes: ['plane'] }, true, true);
      hitTest.onHitTestResultObservable.add(results => {
        if (results.length) {
          this.hitTestResult = results[0];
          this.hitTestResult.transformationMatrix.decompose(undefined, this.reticle.rotationQuaternion, this.reticle.position);
          this.reticle.isVisible = true;
        } else {
          this.reticle.isVisible = false;
          this.hitTestResult = null;
        }
      });

      this.scene.onPointerDown = () => {
        if (this.hitTestResult) {
          this.hitTestResult.transformationMatrix.decompose(undefined, this.box.rotationQuaternion, this.box.position);
          this.box.position.y += boxSize / 2;
          this.box.isVisible = true;
        }
      }
    }
  }

  createScene() {
    // Reticle
    this.reticle = MeshBuilder.CreateDisc('reticle', { radius: 0.05 }, this.scene);
    const reticleMaterial = new StandardMaterial('reticleMaterial', this.scene);
    reticleMaterial.diffuseColor = Color3.FromHexString('#FFFFFF');
    reticleMaterial.roughness = 1;
    this.reticle.material = reticleMaterial;
    this.reticle.isVisible = false;

    // Box
    this.box = MeshBuilder.CreateBox('box', { size: boxSize }, this.scene);
    const boxMaterial = new StandardMaterial('boxMaterial', this.scene);
    boxMaterial.diffuseColor = Color3.FromHexString('#5853e6');
    this.box.material = boxMaterial;
    this.box.isVisible = false;

    // Light
    const light = new HemisphericLight('light', new Vector3(-0.5, -1, -0.25), this.scene);
    light.diffuse = Color3.FromHexString('#ffffff');
    light.groundColor = Color3.FromHexString('#bbbbff');
    light.intensity = 1;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});