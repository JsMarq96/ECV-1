var CHAT = {

  chat_history: {},

  current_user: "Juan",
  user_name: "Juan",
  chat_room_prefix: "_jsm_chatroom_prefix",
  current_conversation: null,
  server_connections: {},
  if_is_private: {},
  id_names_dict: {},

  // ===================================
  // CLIENT MESSAGING FUNCTIONS
  // ===================================

  get_private_room_id: function(username, recipient_username) {
    var room_id = '';
    if (username[0] > recipient_username[0]) {
      room_id += username + ' & ' + recipient_username;
    } else {
      room_id += recipient_username + ' & ' + username;
    }
    return room_id;
  },

  add_message: function (sender_id, sender_name, message) {
    var bubble_class = "message-to-user"
    if (sender_name.localeCompare(CHAT.user_name) == 0) {
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

    // Add ocnlick for private chat
    if (sender_name.localeCompare(CHAT.user_name) != 0 && sender_id != 0) {
      message_buble.onclick = function (event) {
        CHAT.add_a_connection(CHAT.get_private_room_id(CHAT.user_name, sender_name), true, sender_id, CHAT.current_conversation);
      };
    }

    // Merge all the structure & submit to the DOM
    message_buble.appendChild(sender_paragraph);
    message_buble.appendChild(text_paragraph);
    message_main.appendChild(message_buble);

    this.message_box.appendChild(message_main);
    this.message_box.scrollTop = 100000;
  },



  add_bubble_notification(text) {
    var main_div = document.createElement('div');
    main_div.classList.add('message-container');

    var sub_div = document.createElement('div');
    sub_div.classList.add('message-join');

    sub_div.innerHTML = text;

    main_div.appendChild(sub_div);

    this.message_box.appendChild(main_div);
    this.message_box.scrollTop = 100000;
  },



  send_message: function () {
    var msg = {};
    msg.type = 'text';
    msg.username = CHAT.user_name;
    msg.content = CHAT.text_input.value;
    msg.user_id = CHAT.current_user;

    if (!CHAT.if_is_private[CHAT.current_conversation].private) {
      CHAT.server_connections[CHAT.current_conversation].sendMessage(JSON.stringify(msg));
    } else {
      CHAT.server_connections[CHAT.current_conversation].sendMessage(JSON.stringify(msg), [CHAT.if_is_private[CHAT.current_conversation.id]]);
    }
    CHAT.add_message(0, CHAT.user_name, CHAT.text_input.value);
    CHAT.text_input.value = "";

    CHAT.chat_history[CHAT.current_conversation] = CHAT.chat_history[CHAT.current_conversation].concat(msg);
  },



  send_button_onclick: function (event) {
    if (event.code == 'Enter') {
      CHAT.send_message();
    }
  },



  clean_chatbox: function() {
    this.message_box.innerHTML = '';
  },


  // ===================================
  // CONVERSATION FUNCTIONS
  // ===================================
  add_conversation: function(name) {
    this.if_is_private[name] = {'private': false};
    // Just create structure and add it to the DOM
    var main_div = document.createElement('div');
    main_div.classList.add('conversation-item');

    var paragraph = document.createElement('p');
    paragraph.innerHTML = name;

    var separator = document.createElement('div');
    separator.classList.add('conversation-separator');

    main_div.appendChild(paragraph);
    main_div.appendChild(separator);

    main_div.onclick = function(event) {
      CHAT.change_conversation(name);
    };

    this.conversation_box.appendChild(main_div);
  },



  change_conversation: function(conversation_id) {
    // Clean conversation
    CHAT.clean_chatbox();
    CHAT.current_conversation = conversation_id;
    CHAT.chat_title.innerHTML = conversation_id;

    const history = CHAT.chat_history[CHAT.current_conversation];
    for(var i = 0; i < history.length; i++) {
      CHAT.add_message(history[i].user_id, history[i].username, history[i].content);
    }
  },

  // ===================================
  // SERVER EVENTS
  // ===================================

  server_on_ready: function(server_index, id){
    this.chat_history[server_index] = [];
    console.log("Server ready", id, server_index);
    this.current_conversation = server_index;
    this.current_user = id;
    this.if_is_private[server_index] = {};
    this.if_is_private[server_index].private = false;
  },



  private_server_on_ready: function(server_index, id, recipient_user_id, conversation_id, room_id, request_recibed) {
    // If you recibe the request, then you dont need the send one!
    if (!request_recibed) {
      var msg = {};
      msg.type = 'private_chat';
      msg.username = CHAT.current_user;
      msg.content = server_index;
      msg = JSON.stringify(msg);

      // Send the channel data to the other user
      this.server_connections[conversation_id].sendMessage(msg, [recipient_user_id]);
    }

    this.server_on_ready(server_index, id);
    this.if_is_private[server_index] = {};
    this.if_is_private[server_index].private = true;
    this.if_is_private[server_index].id = recipient_user_id;
  },



  server_on_room_info: function(server_index, info) {
    console.log("Room info ", info);

    CHAT.clean_chatbox();

    if (info.clients.length > 1) {
      var msg = {};
      msg.type = 'history-request';
      msg.username = self.current_user;

      msg = JSON.stringify(msg);
      for(var i = 0; i < info.clients.length; i++) {
        if (CHAT.current_user.localeCompare(info.clients[i]) == 0) {
          continue;
        }

        CHAT.server_connections[CHAT.current_conversation].sendMessage(msg, [info.clients[i]]);
        break;
      }

      // Send name
      var msg = {};
      msg.type = 'name';
      msg.just_joined = false;
      msg.content = {id: CHAT.current_user, name: CHAT.user_name};
      CHAT.server_connections[CHAT.current_conversation].sendMessage(JSON.stringify(msg));

    }
    CHAT.add_conversation(this.current_conversation);
    // Show the conversation box
    CHAT.chat_area.style.display = 'block';
    CHAT.chat_title.innerHTML = this.current_conversation;
  },



  server_on_user_connect: function(server_index, user_id) {
    if (server_index.localeCompare(this.current_conversation) != 0) {
      return;
    }
    console.log("User connected", user_id);
    // Send the name to the new user
    // Send name
    var msg = {};
    msg.type = 'name';
    msg.just_joined = true;
    msg.content = {id: CHAT.current_user, name: CHAT.user_name};
    CHAT.server_connections[CHAT.current_conversation].sendMessage(JSON.stringify(msg), [user_id]);
  },



  server_on_user_disconnect: function(server_index, user_id) {
    if (server_index.localeCompare(this.current_conversation) != 0) {
      return;
    }

    this.add_bubble_notification(this.id_names_dict[user_id] + ' disconected');
    console.log("User disconnected", user_id);

  },



  server_on_message: function(server_index, author_id, message) {
    var msg = JSON.parse(message);

    const on_this_conversation = server_index === this.current_conversation;
    console.log(server_index, this.current_conversation, on_this_conversation, "======");

    if (msg.type.localeCompare('text') == 0) {
      // A normal message
      this.chat_history[server_index].push(msg);

      if (on_this_conversation) {
        this.add_message(author_id, msg.username, msg.content);
      }

    } else if (msg.type.localeCompare('history-request') == 0) {
      // Another user request the history of the chat
      var history_msg = {};
      history_msg.type = 'history';
      history_msg.content = this.chat_history[server_index];

      this.server_connections[server_index].sendMessage(JSON.stringify(history_msg));

    } else if (msg.type.localeCompare('history') == 0) {
      // History of the chat
      var history = msg.content;

      this.chat_history[server_index] = history;

      if (on_this_conversation) {
        for(var i = 0; i < history.length; i++) {
          this.add_message(history[i].user_id, history[i].username, history[i].content);
        }
      }
    } else if (msg.type.localeCompare('private_chat') == 0) {
      // A request for a private chat
      CHAT.add_a_connection(msg.content, true, msg.username, '', true);

    } else if (msg.type.localeCompare('name') == 0) {
      CHAT.id_names_dict[msg.content.id] = msg.content.name;
      if (msg.just_joined) {
        this.add_bubble_notification(msg.content.name + ' joined');
      } else {
        this.add_bubble_notification(msg.content.name + ' is on this chat');
      }
    }

    console.log("Message recibed", author_id, message, msg);
  },



  server_on_close: function(server_index) {

  },



  add_a_connection: function(server_name, is_private=false, recipient_user_id='', conversation_id='', request_recibed=false) {
    var server_connection = new SillyClient();
    var room_id = '';

    if (!is_private) {
      room_id = server_name + this.chat_room_prefix;
    } else {
      room_id = 'private_room_' + server_name + this.chat_room_prefix;
    }

    server_connection.connect("wss://ecv-etic.upf.edu/node/9000/ws", room_id);

    if (!is_private) {
       server_connection.on_ready = function(id) {
         CHAT.server_on_ready(server_name, id);
       };
    } else {
       server_connection.on_ready = function(id) {
         CHAT.private_server_on_ready(server_name, id, recipient_user_id, conversation_id, room_id, request_recibed);
       };
    }
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
    this.user_name = this.username_input.value;
  },



  // ===================================
  // UI EVENTS
  // ===================================

  ui_add_conversation: function(event) {
    CHAT.add_a_connection(CHAT.new_conversation_input.value);
  },



  init: function() {
    this.chat_area = document.getElementById('chat');
    this.chat_title = document.getElementById('chat-title');
    this.message_box = document.getElementById('chat-conversation');
    this.text_input = document.getElementById('text-input');
    this.new_conversation_input = document.getElementById('new-conversation-id');
    this.username_input = document.getElementById('username-input');
    this.conversation_box = document.getElementById('conversations');

    this.text_input.addEventListener('keydown', CHAT.send_button_onclick);
    document.getElementById('send-button').onclick = this.send_message;
    document.getElementById('launch-conversation').onclick = this.ui_add_conversation;
  },
};
