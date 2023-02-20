var World = {
  current_user: null,
  camera_pos: {x: 0, y: 0},
  camera_scale: {width: 0, height: 0},
  current_room: "",
  objects: {},
  room_backgrounds: {},
  last_time: performance.now(),

  render_menu: function() {
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
    const half_player_width = 0.0;//World.objects[World.current_room][World.current_user].tile_size_x * 2.0;
    const curr_camera_coords = World.camera_pos.x;
    const ideal_camera_pos = 0.0;//World.objects[World.current_room][World.current_user].position.x + half_player_width;
    // Move smoothly the cam
    World.camera_pos.x = LERP(0.01, curr_camera_coords, ideal_camera_pos);
    ctx.translate(-World.camera_pos.x + canvas.width / 2, -World.camera_pos.y + canvas.height / 2);

    // Draw the background of the current room
    World.room_backgrounds[World.current_room].render(ctx);

    var now = performance.now();
    var elapsed_time = (now - World.last_time) / 1000;
    World.last_time = now;

    // Updated

    // Reset the camera transfomrs, return the axis to the origila pos, and send the animation frame
    ctx.resetTransform();
  },

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
    const half_player_width = World.current_user.tile_size_x * 2.0;
    const curr_camera_coords = World.camera_pos.x;
    const ideal_camera_pos = World.current_user.position_x + half_player_width;
    // Move smoothly the cam
    World.camera_pos.x = LERP(0.01, curr_camera_coords, ideal_camera_pos);
    ctx.translate(-World.camera_pos.x + canvas.width / 2, -World.camera_pos.y + canvas.height / 2);

    // Draw the background of the current room
    World.room_backgrounds[World.current_room].render(ctx);

    // Render each object
    var time = performance.now();
    for(var i = 0; i < World.objects[World.current_room].length; i++) {
      World.objects[World.current_room][i].render(ctx, time, {x: 1, y: 1});
    }

    var now = performance.now();
    var elapsed_time = (now - World.last_time) / 1000;
    World.last_time = now;

    // Updated
    // Add movement marks
    for(var i = 0; i < World.objects[World.current_room].length; i++) {
      World.objects[World.current_room][i].update(elapsed_time);
    }

    // Reset the camera transfomrs, return the axis to the origila pos, and send the animation frame
    ctx.resetTransform();
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

  add_user_to_room: function (name, room_name, server_id, position_x, style, img, scale, tile_size_x, tile_size_y, tile_standby, tile_walk_anim) {
    // Fill the user strucutre
    var new_user = Object.assign({}, user_template);
    new_user.name = name;
    new_user.style = style;
    new_user.position_x = position_x;
    new_user.id = server_id;
    new_user.scale = scale;
    new_user.img = img;
    new_user.tile_size_x = tile_size_x;
    new_user.tile_size_y = tile_size_y;
    new_user.tile_standby = tile_standby;
    new_user.tile_walk = tile_walk_anim;
    new_user.speed_x = 0;
    new_user.move_marker = 0;

    World.objects[room_name].push(new_user);
    return World.objects[room_name].length - 1;
  },

  update_position: function(position_x) {
    var msg = {'type': 'updated_position', 'position': position_x};
    World.socket.send(JSON.stringify(msg));
  },

  send_message: function(message) {
    var msg = {'type': 'message', 'message': message};
    World.socket.send(JSON.stringify(msg));
  }
};
