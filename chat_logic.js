var CHAT = {

  chat_history: {},

  current_user: "Juan",
  user_name: "Juan",
  chat_room_prefix: "_jsm_chatroom_prefix",
  current_conversation: null,
  server_connections: {},

  // ===================================
  // CLIENT MESSAGING FUNCTIONS
  // ===================================
  add_message: function (sender_name, message) {
    var bubble_class = "message-to-user"
    if (sender_name.localeCompare(CHAT.current_user) == 0) {
      bubble_class = "message-from-user";
    }
    
    var message_main = document.createElement('div');
    message_main.classList.add('message-container');

    var message_buble = document.createElement('div');
    message_buble.classList.add('message');
    message_buble.classList.add(bubble_class);

    // Create the paragraphs
    var sender_paragraph = document.createElement('p');
    sender_paragraph.classList.add('message-sender');
    sender_paragraph.innerHTML = sender_name;

    var text_paragraph = document.createElement('p');
    text_paragraph.classList.add('message-content');
    text_paragraph.innerHTML = message;

    // Merge all the structure & submit to the DOM
    message_buble.appendChild(sender_paragraph);
    message_buble.appendChild(text_paragraph);
    message_main.appendChild(message_buble);

    this.message_box.appendChild(message_main);
    this.message_box.scrollTop = 100000;
  },

  send_message: function () {
    var msg = {};
    msg.type = 'text';
    msg.username = CHAT.user_name;
    msg.content = CHAT.text_input.value;

    CHAT.server_connections[CHAT.current_conversation].sendMessage(JSON.stringify(msg));
    CHAT.add_message(CHAT.current_user, CHAT.text_input.value);
    CHAT.text_input.value = "";

    CHAT.chat_history[CHAT.current_conversation].push(msg);
  },

  send_button_onclick: function (event) {
    if (event.code == 'Enter') {
      CHAT.send_message();
    }
  },


  // ===================================
  // CONVERSATION FUNCTIONS
  // ===================================


  // ===================================
  // SERVER EVENTS
  // ===================================

  server_on_ready: function(server_index, id){
    this.chat_history[server_index] = [];
    console.log("Server ready", id);
    this.current_conversation = server_index;
    this.current_user = id;
  },

  server_on_room_info: function(server_index, info) {
    console.log("Room info ", info);

  },

  server_on_user_connect: function(server_index, user_id) {
    console.log("User connected", user_id);

  },

  server_on_user_disconnect: function(server_index, user_id) {
    console.log("User disconnected", user_id);

  },

  server_on_message: function(server_index, author_id, message) {
    var msg = JSON.parse(message);
    this.add_message(author_id, msg.content);
    this.chat_history[this.current_conversation].push(msg);
    console.log("Message", author_id, message)
  },

  server_on_close: function(server_index) {

  },

  add_a_connection: function(server_name) {
    var server_connection = new SillyClient();
    server_connection.connect("wss://ecv-etic.upf.edu/node/9000/ws", server_name + this.chat_room_prefix);

    server_connection.on_connect = function() {
      CHAT.server_on_ready(server_name);
    };
    server_connection.on_ready = function(id) {
      CHAT.server_on_ready(server_name, id);
    };
    server_connection.on_room_info = function(info) {
      CHAT.server_on_room_info(server_name, info);
    };
    server_connection.on_message = function(author_id, msg) {
      CHAT.server_on_message(server_name, author_id, msg);
    };
    server_connection.on_user_connected = function(user_id) {
      CHAT.server_on_user_connect(server_name, user_id);
    };
    server_connection.on_user_disconnected = function(user_id) {
      CHAT.server_on_user_disconnect(server_name, user_id);
    };
    server_connection.on_close = function() {
      CHAT.server_on_close(server_name);
    };

    this.server_connections[server_name] = server_connection;
  },

  // ===================================
  // UI EVENTS
  // ===================================

  ui_add_conversation: function(event) {
    CHAT.add_a_connection(CHAT.new_conversation_input.value);
  },

  init: function() {
    this.message_box = document.getElementById('chat-conversation');
    this.text_input = document.getElementById('text-input');
    this.new_conversation_input = document.getElementById('new-conversation-id');

    this.text_input.addEventListener('keydown', CHAT.send_button_onclick);
    document.getElementById('launch-conversation').onclick = this.ui_add_conversation;
  },
};
