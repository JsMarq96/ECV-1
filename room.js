var canvas = document.getElementById("main_canvas");

var MOVEMENT_SPEED = 40.0;
var DELTA = 1;

function main_render_loop() {
  if (logged_in) {
    World.render_frame();
  } else {
    World.render_menu();
  }

  requestAnimationFrame(main_render_loop);
}

function init_menu() {
  World.create_room("room_1", "imgs/mezeus-silent-hill.jpg", 0.86, []);
  World.current_user = World.add_user_to_room("",
                                              "room_1",
                                              0,
                                              0,
                                              "none",
                                              "imgs/tileset.png",
                                              4.0,
                                              43, 43,
                                              0,
                                              [1, 2, 3, 4, 5, 6, 7]);
  World.current_room = "room_1";

  World.objects[World.current_room][World.current_user].move_towards_pos(-220);

  main_render_loop();
}

// ============================
// CLIENT EVENTS ==============
// ============================

function log_in() {
  var key = name_input.value + '_' + pass_input.value;
  var login_request = {'type':'login', 'name': name_input.value, 'data': key, 'style':color_select.value};
  socket.send(JSON.stringify(login_request));
  console.log("Send login");
  register_button.disabled = false;
  login_button.disabled = false;

  login_area.style.display = "none";
  chat_area.style.display = "block";
}

function register() {
  var key = name_input.value + '_' + pass_input.value;
  var register_request = {'type':'register', 'data': key};
  socket.send(JSON.stringify(register_request));
  console.log("Send register");
  register_button.disabled = false;
  login_button.disabled = false;
}

function get_world_cursor_position(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return {'x':x  - (-World.camera_pos.x + canvas.width / 2), 'y': y - (-World.camera_pos.y + canvas.height / 2)};
}

var login_area = document.getElementById("login_area");
var chat_area = document.getElementById("chat_area");
var name_input = document.getElementById("user_input");
var pass_input = document.getElementById("pass_input");
var register_button = document.getElementById("register_button");
var login_button = document.getElementById("login_button");
var color_select = document.getElementById("color_select");
var message_input = document.getElementById("text-input");
var logged_in = false;

document.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    // Enter pressed
    if (message_input.value.length > 2) {
      World.send_message(message_input.value);
      message_input.value = "";
    }
  }
});

canvas.onclick = function(e) {
  // When you click the canvas, first check if its in door, if not, move towards
  World.update_position(get_world_cursor_position(e).x);
  var cursor_pos = get_world_cursor_position(e);
  const door_width = 274 / 2;
  const doow_height = 277 / 2;
  var doors = World.room_backgrounds[World.current_room].doors;
  for(var i = 0; i < doors.length; i++) {

    if (cursor_pos.x > (doors[i].pos_x - 31) && cursor_pos.x < (doors[i].pos_x + 32)) {
      if (cursor_pos.y < -38 && cursor_pos.y > -113) {
        World.move_to_room(doors[i].to)
      }
    }
  }
}

register_button.onclick = register;
login_button.onclick = log_in;

// ============================
// SERVER MESSAGES ============
// ============================

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
    World.create_room(room_data.name,
                      room_data.back_img,
                      1.5,
                      room_data.doors);
    World.current_room = room_data.name;

    var bubble = "";

    for(var i = 0; i < room_data.users.length; i++) {
      var position_id = World.add_user_to_room(room_data.users[i].name,
                                               room_data.name,
                                               room_data.users[i].id,
                                               room_data.users[i].position,
                                               room_data.users[i].style,
                                               IMG_DIRS[room_data.users[i].style],
                                               2.0,
                                               43, 43,
                                               0,
                                               [1, 2, 3, 4, 5, 6, 7]);
      // Add a reference to the current user
      if (room_data.users[i].id.localeCompare(msg_obj.id) == 0) {
        World.current_user = World.objects[room_data.name][position_id];
      } else {
        bubble += room_data.users[i].name + ", ";
      }
    }

    add_bubble_notification("Welcome to the lobby, " + World.current_user.name);
    if (bubble.length > 1) {
      add_bubble_notification(bubble + " are in this room, say hi!");
    }

    logged_in = true;
  } else if (msg_obj.type.localeCompare("new_message") == 0) {
    // Get the room and the data
    console.log(msg_obj);
    add_message(msg_obj.from, msg_obj.from_name, msg_obj.message, msg_obj.from.localeCompare(World.current_user.id) == 0);
  } else if (msg_obj.type.localeCompare("move_to_room") == 0) {
    // Clean chat
    message_box.innerHTML = "";
    // Get the room data
    var room_data = msg_obj['new_room'];
    World.create_room(room_data.name,
                      room_data.back_img,
                      1.5,
                      room_data.doors);
    World.current_room = room_data.name;
    console.log(room_data);

    var bubble = "";

    for(var i = 0; i < room_data.users.length; i++) {
      var position_id = World.add_user_to_room(room_data.users[i].name,
                                               room_data.name,
                                               room_data.users[i].id,
                                               room_data.users[i].position,
                                               room_data.users[i].style,
                                               IMG_DIRS[room_data.users[i].style],
                                               2.0,
                                               43, 43,
                                               0,
                                               [1, 2, 3, 4, 5, 6, 7]);
      // Add a reference to the current user
      if (room_data.users[i].id.localeCompare(msg_obj.id) == 0) {
        World.current_user = World.objects[room_data.name][position_id];
      } else {
        bubble += room_data.users[i].name + ", ";
      }
    }
    add_bubble_notification("Just entered in " + room_data.name);
    if (bubble.length > 1) {
      add_bubble_notification(bubble + " are in this room, say hi!");
    }
  }  else if (msg_obj.type.localeCompare("new_character") == 0) {
    // Add the character to the room
    World.add_user_to_room(msg_obj.name,
                           World.current_room,
                           msg_obj.user_id,
                           msg_obj.position_x,
                           msg_obj.style,
                           IMG_DIRS[msg_obj.style],
                           2.0,
                           43, 43,
                           0,
                           [1, 2, 3, 4, 5, 6, 7]);
    add_bubble_notification(msg_obj.name + " just entered this room, say hi!");

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
        add_bubble_notification(msg_obj.name + " exited!");
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
  } else if (msg_obj.type.localeCompare("user_gone_to_room") == 0) {
    for(var i = 0; i < World.objects[World.current_room].length; i++) {
      if (World.objects[World.current_room][i].id.localeCompare(msg_obj.user_id) == 0) {
        World.objects[World.current_room].splice(i, 1);
        add_bubble_notification(msg_obj.user_name + " gone to " + msg_obj.new_room);
        break;
      }
    }
  }
  });
