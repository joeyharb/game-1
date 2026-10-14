// Only the Three.js pieces the game uses. esbuild tree-shakes the rest.
export {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog,
  HemisphereLight, DirectionalLight, AmbientLight,
  Mesh, InstancedMesh, Group, Object3D,
  BoxGeometry, CylinderGeometry, ConeGeometry, SphereGeometry, IcosahedronGeometry,
  PlaneGeometry, CircleGeometry, TorusGeometry, RingGeometry, DodecahedronGeometry,
  BufferGeometry, BufferAttribute, Float32BufferAttribute,
  MeshLambertMaterial, MeshBasicMaterial,
  Vector2, Vector3, Matrix4, Quaternion, Euler, Raycaster, MathUtils,
  SRGBColorSpace, PCFSoftShadowMap, DoubleSide
} from 'three';
export { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
