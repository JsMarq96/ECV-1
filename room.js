var canvas = document.getElementById("main_canvas");

var img_cache = {};
function get_image(url) {
  if (img_cache[url])
    return img_cache[url];

  var img = imgs[url] = new Image();
  img.src = url;
  return img;
}

var obj_template = {
  position: {x: 0, y: 0},
  scale: {width: 0, height: 0},
  img: null,
  render: function(ctx, cam_scale) {
    const img = get_image(this.img);
    ctx.drawImage(img, this.position.x, this.position.x, img.width * this.scale.x * cam_scale.x, img.height * this.scale.y * cam_scale.y);
  }
};

var World = {
  camera_pos: {x: 0, y: 0},
  camera_scale: {width: 0, height: 0},
  current_room: "",
  objects: {},

  render_frame: function() {
    var ctx = canvas.getContext('2d');

    // Clear pass
    ctx.fillStyle = "#000000"; // Black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render each object
    for(var i = 0; i < World.objects.length(); i++) {
      World.objects[this.current_room][i].render(ctx, {x: 1, y: 1});
    }
  }

};


draw();
