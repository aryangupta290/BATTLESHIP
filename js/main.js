const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var which = 0;
// 0 is third person

var score = 0;
var health = 100;
var points = 0;
var dec_on_collision = 20;
var enemies = [];
var treasures = [];
var player_balls = [];
var enemy_bullet = [];

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x00ffff);
var game_timer = new THREE.Clock();

const environment = new Environment(scene, renderer);
environment.updateSun(scene);
var camera1 = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
var camera2 = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

clock = new THREE.Clock();
var time_enemy = 9;
var time_treasure = 5;

var enemy_hit = 7;
// time elaped since creaion of a new enemy

enemy_create_clock = new THREE.Clock();
treasure_create_clock = new THREE.Clock();
player_cannon_time = new THREE.Clock();

var time_after_player_hit = 1;

class Player {
  constructor(scene) {
    this.scene = scene;
    this.velocity = 1;
    this.rotation = 0.02;
    this.time = 0;

    const loader = new THREE.GLTFLoader();
    loader.load("/models/player.gltf", (gltf) => {
      this.player = gltf.scene;
      this.player.scale.set(0.1, 0.1, 0.1);
      this.player.position.set(0, 0, -5);
      // this.player.add(camera1);
      scene.add(this.player);
    });
  }
  //  async load(scene) {}
}

class Enemy {
  constructor(scene, x, y, z, pass) {
    this.scene = scene;
    this.velocity = 1;
    this.time = new THREE.Clock();
    const loader = new THREE.GLTFLoader();

    loader.load("/models/enemy.glb", (gltf) => {
      this.enemy = gltf.scene;
      this.enemy.scale.set(20, 20, 20);
      this.enemy.position.x = x;
      this.enemy.bullet = [];
      this.enemy.alive = 1;

      this.enemy.position.y = 0;
      this.enemy.position.z = z;
      this.enemy.lookAt(pass.x - x, pass.y - y, pass.z - z);
      scene.add(this.enemy);
      console.log(this.enemy.position);
    });
  }
}

class Treasure {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.velocity = 1;
    const loader = new THREE.GLTFLoader();
    loader.load("/models/treasure_chest.glb", (gltf) => {
      this.treasure = gltf.scene;
      this.treasure.scale.set(5, 5, 5);
      this.treasure.position.set(x, 0, z);
      console.log(this.treasure.position);
      scene.add(this.treasure);
    });
  }
}
class Cannon {
  constructor(scene, x, y, z, pass, original) {
    this.scene = scene;
    this.velocity = 8;
    const loader = new THREE.GLTFLoader();
    loader.load("/models/bullet.glb", (gltf) => {
      this.cannon = gltf.scene;
      this.cannon.scale.set(5, 5, 5);
      this.cannon.position.set(x, 0, z);
      this.cannon.rotation.set(pass.x, pass.y, pass.z);
      this.cannon.original = original;
      console.log(this.cannon.position);
      scene.add(this.cannon);
    });
  }
}

function player_cannon_hit() {
  if (player_cannon_time.getElapsedTime() > time_after_player_hit) {
    player_cannon_time.start();
    player_balls.push(
      new Cannon(
        scene,
        player.player.position.x,
        player.player.position.y,
        player.player.position.z,
        player.player.rotation,
        player.player.position
      )
    );
  }
}

function enemy_create() {
  if (enemy_create_clock.getElapsedTime() > time_enemy) {
    enemy_create_clock.start();
    var x, y, z;
    while (true) {
      var dist = randomInteger(500, 1000);
      var angle = randomInteger(0, 360);
      x = dist * Math.cos(angle);
      z = dist * Math.sin(angle);
      y = -5;
      var match = 0;
      for (var i = 0; i < enemies.length; i++) {
        if (
          x == enemies[i].enemy.position.x &&
          z == enemies[i].enemy.position.z
        ) {
          match = 1;
          break;
        }
      }
      if (match == 0) {
        break;
      }
    }

    var pass = player.scene.position;
    enemies.push(new Enemy(scene, x, y, z, pass));
  }
}

function treasure_create() {
  if (treasure_create_clock.getElapsedTime() > time_treasure) {
    treasure_create_clock.start();
    var dist = randomInteger(300, 800);
    var angle = randomInteger(0, 360);
    var x = dist * Math.cos(angle);
    var z = dist * Math.sin(angle);
    var y = 0;
    treasures.push(new Treasure(scene, x, y, z));
  }
}

function create_enemy_bullet() {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].enemy !== undefined) {
      var store = [];
      store = enemies[i].enemy.bullet;
      if (Math.random() > 0.5) {
        continue;
      }
      if (enemies[i].time.getElapsedTime() > enemy_hit) {
        enemies[i].time.start();
        store.push(
          new Cannon(
            scene,
            enemies[i].enemy.position.x,
            enemies[i].enemy.position.y,
            enemies[i].enemy.position.z,
            enemies[i].enemy.rotation,
            enemies[i].enemy.position
          )
        );
      }
      enemies[i].enemy.bullet = store;
    }
  }
}
function enemy_movement() {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].enemy === undefined ) {
      continue;
    }
    enemies[i].enemy.lookAt(player.player.position);
    enemies[i].enemy.translateZ(0.1);
  }
}

function move_player_cannon() {
  var new_player_balls = [];
  for (var i = 0; i < player_balls.length; i++) {
    if (player_balls[i].cannon === undefined) {
      new_player_balls.push(player_balls[i]);
      continue;
    }

    player_balls[i].cannon.translateZ(-player_balls[i].velocity);
    if (
      player_balls[i].cannon.position.distanceTo(
        player_balls[i].cannon.original
      ) > 1000
    ) {
      scene.remove(player_balls[i].cannon);
    } else {
      new_player_balls.push(player_balls[i]);
    }
  }
  player_balls = new_player_balls;
}
function move_enemy_bullet() {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].enemy !== undefined) {
      var temp = [];
      for (var j = 0; j < enemies[i].enemy.bullet.length; j++) {
        if (enemies[i].enemy.bullet[j].cannon !== undefined) {
          enemies[i].enemy.bullet[j].cannon.translateZ(
            enemies[i].enemy.bullet[j].velocity / 2
          );
          if (
            enemies[i].enemy.bullet[j].cannon.position.distanceTo(
              enemies[i].enemy.bullet[j].cannon.original
            ) > 1000
          ) {
            scene.remove(enemies[i].enemy.bullet[j].cannon);
          } else {
            temp.push(enemies[i].enemy.bullet[j]);
          }
        } else {
          temp.push(enemies[i].enemy.bullet[j]);
        }
      }
    }
  }
}

// range of projectile
var def_y = 60;
camera1.position.z = 150;
camera1.position.y = def_y;

// camera2.position.y = 600;
// camera2.position.z = -5;
// camera2.position.x = 0;

const light = new THREE.DirectionalLight(0xffffff, 1);
const player = new Player(scene);
//console.log(player.player.position);
scene.add(light);

// windor resize
window.addEventListener("resize", function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();
});
var keyMap = [];
window.addEventListener("keydown", KeyDown, true);
window.addEventListener("keyup", KeyUp, true);

function check_collision_treasure() {
  var new_treasures = [];
  for (var i = 0; i < treasures.length; i++) {
    if (treasures[i].treasure !== undefined) {
      var dist = player.player.position.distanceTo(
        treasures[i].treasure.position
      );
      //  console.log(dist);
      if (dist < 10) {
        //  console.log(12);
        scene.remove(treasures[i].treasure);
        points = points + 10;
      } else {
        new_treasures.push(treasures[i]);
      }
    } else {
      new_treasures.push(treasures[i]);
    }
  }
  treasures = new_treasures;
}

function check_collision_enemy() {
  var new_enemeis = [];
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].enemy) {
      var dist = player.player.position.distanceTo(enemies[i].enemy.position);
      if (dist < 50) {
        health = health - dec_on_collision;
        scene.remove(enemies[i].enemy);
        enemies[i].enemy.alive = 0;
        new_enemeis.push(enemies[i]);
      } else {
        new_enemeis.push(enemies[i]);
      }
    } else {
      new_enemeis.push(enemies[i]);
    }
  }
  enemies = new_enemeis;
}
function bullet_with_enemy() {
  var new_player_balls = [];

  for (var i = 0; i < player_balls.length; i++) {
    if (player_balls[i].cannon !== undefined) {
      var is_collision = 0;
      var new_enemies = [];
      for (var j = 0; j < enemies.length; j++) {
        if (is_collision == 1) {
          new_enemies.push(enemies[j]);
          continue;
        }
        if (enemies[j].enemy !== undefined) {
          var dist = player_balls[i].cannon.position.distanceTo(
            enemies[j].enemy.position
          );
          if (dist < 30) {
            is_collision = 1;
            score = score + 20;
            scene.remove(enemies[j].enemy);
            enemies[j].enemy.alive = 0;
            new_enemies.push(enemies[j]);

          } else {
            new_enemies.push(enemies[j]);
          }
        } else {
          new_enemies.push(enemies[j]);
        }
      }
      if (is_collision) {
        scene.remove(player_balls[i].cannon);
      } else {
        new_player_balls.push(player_balls[i]);
      }

      enemies = new_enemies;
    } else {
      new_player_balls.push(player_balls[i]);
    }
  }
  player_balls = new_player_balls;
}
function enemy_with_player() {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].enemy === undefined) {
      continue;
    }

    var new_bullets = [];
    for (var j = 0; j < enemies[i].enemy.bullet.length; j++) {
      if (enemies[i].enemy.bullet[j].cannon === undefined) {
        new_bullets.push(enemies[i].enemy.bullet[j]);
        continue;
      }
      var dist = enemies[i].enemy.bullet[j].cannon.position.distanceTo(
        player.player.position
      );
      if (dist < 20) {
        health = health - 10;
        scene.remove(enemies[i].enemy.bullet[j].cannon);
      } else {
        new_bullets.push(enemies[i].enemy.bullet[j]);
      }
    }
    enemies[i].enemy.bullet = new_bullets;
  }
}
function KeyDown(event) {
  var keyCode = event.keyCode;
  keyMap[keyCode] = true;
  if (event.which == 81) {
    which = which ^ 1;
  }
}
function KeyUp(event) {
  var keyCode = event.keyCode;
  keyMap[keyCode] = false;
}

var complete = 0;

function player_movement() {
  if (keyMap[87] == true) {
    //
    var v1 = new THREE.Vector3();
    v1.x = player.player.position.x;
    v1.y = camera1.position.y;
    v1.z = player.player.position.z;
    v1.sub(camera1.position);
    console.log(v1);
    var dist = v1.length();
    v1.normalize();
    // move camera along v1
    camera1.position.add(v1.multiplyScalar(player.velocity));

    player.player.translateZ(-player.velocity);
  }
  if (keyMap[83] == true) {
    var v1 = new THREE.Vector3();
    v1.x = player.player.position.x;
    v1.y = camera1.position.y;
    v1.z = player.player.position.z;
    v1.sub(camera1.position);
    console.log(v1);
    var dist = v1.length();
    v1.normalize();
    // move camera along v1
    camera1.position.add(v1.multiplyScalar(-player.velocity));

    player.player.translateZ(player.velocity);
  }
  if (keyMap[65] == true) {
    var earlier = camera1.position.y;
    camera1.position.y = player.player.position.y;
    var temp = new THREE.Vector3(
      player.player.position.x - camera1.position.x,
      0,
      player.player.position.z - camera1.position.z
    );
    temp.normalize();
    var d = camera1.position.distanceTo(player.player.position);
    camera1.translateZ(-d);
    camera1.rotateY(0.01);
    player.player.rotateY(0.01);
    camera1.translateZ(d);
    camera1.position.y = earlier;
  }
  if (keyMap[68] == true) {
    var earlier = camera1.position.y;
    camera1.position.y = player.player.position.y;
    var temp = new THREE.Vector3(
      player.player.position.x - camera1.position.x,
      0,
      player.player.position.z - camera1.position.z
    );
    temp.normalize();
    var d = camera1.position.distanceTo(player.player.position);
    camera1.translateZ(-d);
    camera1.rotateY(-0.01);
    player.player.rotateY(-0.01);
    camera1.translateZ(d);
    camera1.position.y = earlier;
  }
  if (keyMap[32] == true) {
    player_cannon_hit();
  }
}
var f;
function show() {
  var h = document.getElementById("health");
  h.innerHTML = "Health: " + health;
  var s = document.getElementById("score");
  s.innerHTML = "Score: " + score;
  var tr = document.getElementById("treasure");
  tr.innerHTML = "Treasure: " + points;
  var t = document.getElementById("time");

  if (!complete) {
    f = Math.floor(game_timer.getElapsedTime());
    if (f >= 60) {
      f = 60;
    }
  }
  t.innerHTML = "Time: " + (60 - f);
}

function update() {
  show();
  if (player.player === undefined) {
    return;
  }
  if (health <= 0) {
    health = 0;
    var t = document.getElementById("over");
    t.innerHTML = "Game Lost";
    complete = 1;

    return;
  }
  if (game_timer.getElapsedTime() > 60) {
    var t = document.getElementById("over");
    t.innerHTML = "Game Won";
    return;
  }
  camera1.lookAt(player.player.position);
  environment.waterObj.material.uniforms["time"].value += 1.0 / 200.0;
  if (which == 0) {
    camera1.position.y = def_y;
    renderer.render(scene, camera1);
  } else {
    camera1.position.y = 800;

    renderer.render(scene, camera1);
  }
  enemy_create();
  create_enemy_bullet();
  treasure_create();
  player_movement();
  move_enemy_bullet();
  enemy_movement();
  move_player_cannon();
  check_collision_treasure();
  check_collision_enemy();
  bullet_with_enemy();
  enemy_with_player();
}
function game() {
  update();
  requestAnimationFrame(game);
}

game();

// bullet remains in scene
// but not in player cannon
