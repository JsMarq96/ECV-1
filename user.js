
var IMG_DIRS = {
  'off-black': "imgs/tileset_off_black.png",
  'off-white': "imgs/tileset_off_white.png",
  'red-sun': "imgs/tileset_redsun.png",
  'blue-twingo': "imgs/tileset_blue_twingo.png"
};

var STYLE_COLORS = {
  'blue-twingo': '#2990C9',
  'red-sun': '#F23636',
  'off-white': '#BFBFBF',
  'off-black': '#252525'
};

var img_cache = {};
function get_image(url) {
  if (img_cache[url])
    return img_cache[url];

  var img = img_cache[url] = new Image();
  img.src = url;
  return img;
}

function LERP(a, min, max) {
  return  min + a * (max - min);
}

var obj_template = {
  position: {x: 0, y: 0},
  scale: {width: 0, height: 0},
  img: null,
  render: function(ctx, cam_scale) {
    const img = get_image(this.img);
    ctx.drawImage(img,
                  this.position.x,
                  this.position.y,
                  img.width * this.scale.x * cam_scale.x,
                  img.height * this.scale.y * cam_scale.y);
  }
};

var user_template = {
  position_x: 0,
  position_y: 0,
  speed_x: 0,
  speed_y:0,
  move_marker: 0,
  facing_left: false,
  scale: 1.0,
  img: null,
  tile_height: 1,
  tile_size_x: 0,
  tile_size_y: 0,
  tile_standby: 0,
  tile_walk: [],
  name: "",
  style: "",

  update: function(elapsed_time) {
    // Move the character towards the designated point, until is close enough
    if (Math.abs(this.position_x - this.move_marker) > DELTA) {
      this.speed_x = -Math.sign(this.position_x - this.move_marker) * MOVEMENT_SPEED;
      this.position_x += this.speed_x * elapsed_time;
    } else {
      this.speed_x = 0.0;
    }
  },

  move_towards_pos: function (position) {
    console.log(this.id);
    this.move_marker = position;
  },

  render: function(ctx, time, cam_scale) {
    const img = get_image(this.img);

    ctx.save();
    ctx.translate(this.position_x, this.position_y);

    if (this.speed_x > 0.0 || this.speed_x < 0.0) {
      // Invert based on direction
      this.facing_left = this.speed_x < 0.0;

      // The character is moving
      var frame = Math.floor(time * 0.001 * 10) % this.tile_walk.length;
      var x_tile = (frame * this.tile_size_x) % img.width;
      var y_tile = Math.floor(frame / (this.tile_size_x / img.width)) % this.tile_height;
     } else {
      // Stopped character
      var x_tile = (this.tile_standby * this.tile_size_x) % img.width;
      var y_tile = Math.floor(this.tile_standby / (this.tile_size_x / img.width));
    }

    // Render text before inverting
    ctx.textAlign = "center";
    ctx.font = "25px Roboto";
    ctx.fillStyle = STYLE_COLORS[this.style];

    // Invert based on direction
    if (this.facing_left) {
      ctx.fillText(this.name, -2.0 * this.tile_size_x + (this.tile_size_x * this.scale), -10.0);
      ctx.translate(this.tile_size_x, 0.0);
      ctx.scale(-1, 1);
    } else {
      ctx.fillText(this.name, (this.tile_size_x * this.scale) / 2.0, -10.0);
    }

    ctx.drawImage(img,
                  x_tile, y_tile,
                  this.tile_size_x, this.tile_size_y,
                  0.0, 0.0,
                  this.tile_size_x * this.scale, this.tile_size_y * this.scale);

    ctx.restore();
  }
};
