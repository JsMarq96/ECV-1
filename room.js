var canvas = document.getElementById("main_canvas");

var img_cache = {};
function get_image(url) {
  if (img_cache[url])
    return img_cache[url];

  var img = img_cache[url] = new Image();
  img.src = url;
  return img;
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
  position: {x: 0, y: 0},
  speed: {x: 0, y:0},
  facing_left: false,
  scale: 1.0,
  img: null,
  tile_height: 1,
  tile_size_x: 0,
  tile_size_y: 0,
  tile_standby: 0,
  tile_walk: [],

  render: function(ctx, time, cam_scale) {
    const img = get_image(this.img);

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    if (this.speed.x > 0.0 || this.speed.x < 0.0) {
      // Invert based on direction
      this.facing_left = this.speed.x < 0.0;

      // The character is moving
      var frame = Math.floor(time * 0.001 * 10) % this.tile_walk.length;
      var x_tile = (frame * this.tile_size_x) % img.width;
      var y_tile = Math.floor(frame / (this.tile_size_x / img.width)) % this.tile_height;
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


var World = {
  current_user: null,
  camera_pos: {x: 0, y: 0},
  camera_scale: {width: 0, height: 0},
  current_room: "",
  objects: {},
  room_backgrounds: {},
  last_time: performance.now(),

  render_frame: function() {
    var ctx = canvas.getContext('2d');

    // Canvas scale & aspect ratio
    var parent = canvas.parentNode;
    var rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height= rect.height;

    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = "high";

    // Clear pass
    ctx.fillStyle = "#000000"; // Black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set coordinate center on the center of teh scree, taking into accout the camera pos
    ctx.translate(-World.camera_pos.x + canvas.width/ 2, -World.camera_pos.y + canvas.height / 2);

    // Draw the background of the current room
    World.room_backgrounds[World.current_room].render(ctx);

    // Render each object
    var time = performance.now();
    for(var i = 0; i < World.objects[World.current_room].length; i++) {
      World.objects[World.current_room][i].render(ctx, performance.now(), {x: 1, y: 1});
    }

    var now = performance.now();
    var elapsed_time = (now - World.last_time) / 1000;
    last_time = now;

    // Updated
    // Add movement marks


    for(var i = 0; i < World.objects[World.current_room].length; i++) {
      World.objects[World.current_room][i].position.x += World.objects[World.current_room][i].speed.x * elapsed_time;
    }

    // Reset the camera transfomrs, return the axis to the origila pos, and send the animation frame
    ctx.resetTransform();
    requestAnimationFrame(World.render_frame);
  },

  create_room: function(name, image_url, scale) {
    var new_room = {
      img_url: image_url,
      scale: scale,
      render: function(ctx) {
        var image = get_image(this.img_url);
        var size = [image.width * scale, image.height * scale];
        ctx.drawImage(image, -size[0] / 2, -size[1] / 2, size[0], size[1]);
      }
    };

    this.room_backgrounds[name] = new_room;
    this.objects[name] = [];
  },

  add_user_to_room: function (room_name, img, scale, tile_size_x, tile_size_y, tile_standby, tile_walk_anim) {
    // Fill the user strucutre
    var new_user = {...user_template};
    new_user.scale = scale;
    new_user.img = img;
    new_user.tile_size_x = tile_size_x;
    new_user.tile_size_y = tile_size_y;
    new_user.tile_standby = tile_standby;
    new_user.tile_walk = tile_walk_anim;

    this.objects[room_name].push(new_user);

    // Returns the index of the current object
    return this.objects[room_name].length - 1;
  }

};



World.create_room("room_1", "imgs/mezeus-silent-hill.jpg", 0.86);
World.current_user = World.add_user_to_room("room_1",
                                            "imgs/tileset.png",
                                            4.0,
                                            43, 43,
                                            0,
                                            [1, 2, 3, 4, 5, 6, 7]);
World.current_room = "room_1";
World.render_frame();
