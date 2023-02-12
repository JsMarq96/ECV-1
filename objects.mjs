import { get_image, LERP } from './utils.mjs'

var MOVEMENT_SPEED = 40.0;
var DELTA = 5;

var obj_template = {
  position: {x: 0, y: 0},
  scale: {width: 0, height: 0},
  img: null,
  render(ctx, cam_scale) {
    const img = get_image(this.img);
    ctx.drawImage(img,
                  this.position.x,
                  this.position.y,
                  img.width * this.scale.x * cam_scale.x,
                  img.height * this.scale.y * cam_scale.y);
  }
};

var user_template = {
  position: {x: 0, y: 0},
  speed: {x: 0, y:0},
  move_towards: 0,
  facing_left: false,
  scale: 1.0,
  img: null,
  tileset_height: 1,
  tileset_width: 1,
  tile_size_x: 0,
  tile_size_y: 0,
  tile_standby: 0,
  tile_walk: [],

  update(elapsed_time) {
    // Move the character towards the designated point, until is close enough
    if (Math.abs(this.position.x - this.move_towards) > DELTA) {
      this.speed.x = -Math.sign(this.position.x - this.move_towards);
      this.position.x = this.speed.x * elapsed_time * MOVEMENT_SPEED;
    } else {
      this.speed.x = 0.0;
    }
  },

  move_towards(position) {
    this.move_towards = position;
  },

  render(ctx, time, cam_scale) {
    const img = get_image(this.img);

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    if (this.speed.x > 0.0 || this.speed.x < 0.0) {
      // Invert the spirite based on movement direction
      this.facing_left = this.speed.x < 0.0;

      // The character is moving
      var frame = Math.floor(time * 0.001 * 10) % this.tileset_width;
      var x_tile = (frame * this.tile_size_x) % img.width;
      var y_tile = Math.floor(frame / (this.tile_size_x / img.width)) % this.tileset_height;
     } else {
      // Stopped character
      var x_tile = (this.tile_standby * this.tile_size_x) % img.width;
      var y_tile = Math.floor(this.tile_standby / (this.tile_size_x / img.width));
    }
    // Invert based on direction
    if (this.facing_left) {
        ctx.translate(4.0 * this.tile_size_x, 0.0);
        ctx.scale(-1, 1);
      }


    ctx.drawImage(img,
                  x_tile, y_tile,
                  this.tile_size_x, this.tile_size_y,
                  0.0, 0.0,
                  this.tile_size_x * this.scale, this.tile_size_y * this.scale);
    ctx.restore();
  }
};

export {user_template};
