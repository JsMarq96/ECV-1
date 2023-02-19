var canvas = document.getElementById("main_canvas");

var MOVEMENT_SPEED = 40.0;
var DELTA = 2;


function main_render_loop() {

  if (logged_in) {
    World.render_frame();
  } else {
    World.render_menu();
  }

  requestAnimationFrame(main_render_loop);
}

function init_menu() {
  World.create_room("room_1", "imgs/mezeus-silent-hill.jpg", 0.86);
  World.current_user = World.add_user_to_room("room_1",
                                              0,
                                              0,
                                              "imgs/tileset.png",
                                              4.0,
                                              43, 43,
                                              0,
                                              [1, 2, 3, 4, 5, 6, 7]);
  World.current_room = "room_1";

  World.objects[World.current_room][World.current_user].move_towards_pos(-220);

  main_render_loop();
}

function log_in() {
  var key = name_input.value + '_' + pass_input.value;
  var login_request = {'type':'login', 'data': key, 'style':color_select.value};
  socket.send(JSON.stringify(login_request));
  console.log("Send login");
  register_button.disabled = false;
  login_button.disabled = false;
}

function register() {
  var key = name_input.value + '_' + pass_input.value;
  var register_request = {'type':'register', 'data': key};
  socket.send(JSON.stringify(register_request));
  console.log("Send register");
  register_button.disabled = false;
  login_button.disabled = false;
}

var login_area = document.getElementById("login_area");
var chat_area = document.getElementById("chat_area");
var name_input = document.getElementById("user_input");
var pass_input = document.getElementById("pass_input");
var register_button = document.getElementById("register_button");
var login_button = document.getElementById("login_button");
var color_select = document.getElementById("color_select");
var logged_in = false;

register_button.onclick = register;
login_button.onclick = log_in;

const socket = new WebSocket('ws://localhost:9035/messages');
socket.addEventListener('open', (event) => {
  World.socket = socket;

  init_menu();
});

socket.addEventListener('message', (event) => {
  console.log(event.data);
  var msg_obj = JSON.parse(event.data);

  if (msg_obj.type.localeCompare("logged_in") == 0) {
    // Get the room and the data
    var room_data = msg_obj['room'];
    World.create_room(room_data.name, room_data.back_img, 0.86);
    World.current_room = room_data.name;

    for(var i = 0; i < room_data.users.length; i++) {
      var position_id = World.add_user_to_room(room_data.name,
                                               room_data.users[i].id,
                                               room_data.users[i].position,
                                               IMG_DIRS[room_data.users[i].style],
                                               2.0,
                                               43, 43,
                                               0,
                                               [1, 2, 3, 4, 5, 6, 7]);
      // Add the index
      if (room_data.users[i].id.localeCompare(msg_obj.id) == 0) {
        World.current_user = World.objects[room_data.name][position_id];
        console.log(World.current_user, "fef");
      }
    }

    logged_in = true;
  } else if (msg_obj.type.localeCompare("new_message") == 0) {
    // Get the room and the data
    console.log(msg_obj.message);
  } else if (msg_obj.type.localeCompare("change_room") == 0) {
    // Get the room data
  }  else if (msg_obj.type.localeCompare("new_character") == 0) {
    // Add the character to the room
    World.add_user_to_room(World.current_room,
                           msg_obj.user_id,
                           msg_obj.position_x,
                           IMG_DIRS[msg_obj.style],
                           2.0,
                           43, 43,
                           0,
                           [1, 2, 3, 4, 5, 6, 7]);

  } else if (msg_obj.type.localeCompare("move_character") == 0) {
    for(var i = 0; i < World.objects[World.current_room].length; i++) {
      if (World.objects[World.current_room][i].id.localeCompare(msg_obj.user_id) == 0) {
        World.objects[World.current_room][i].move_towards_pos(msg_obj.position);
        break;
      }
    }
  } else if (msg_obj.type.localeCompare("user_disconnect") == 0) {
    for(var i = 0; i < World.objects[World.current_room].length; i++) {
      if (World.objects[World.current_room][i].id.localeCompare(msg_obj.user_id) == 0) {
        World.objects[World.current_room].splice(i, 1);
        break;
      }
    }

  } else if (msg_obj.type.localeCompare("login_error") == 0) {
    register_button.disabled = false;
    login_button.disabled = false;

    alert("Error loggin in");
  } else if (msg_obj.type.localeCompare("register_error") == 0) {
    register_button.disabled = false;
    login_button.disabled = false;

    alert("Error registering in");
  } else if (msg_obj.type.localeCompare("registered_in") == 0) {
    register_button.disabled = false;
    login_button.disabled = false;

    alert("User registered in");
  }

  });
