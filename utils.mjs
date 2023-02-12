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

export {get_image, LERP};
