var CHAT = {

  chat_history: [],

  current_user: "Juan",

  init: function() {
    this.message_box = document.getElementById('chat-conversation');
  },

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

     this.chat_history = this.chat_history.concat({'from': sender_name, 'message': message});

    this.message_box.appendChild(message_main);
    this.message_box.scrollTop = 100000;
  },

  send_button_onclick: function (event) {
    var text_input = document.getElementById('text-input');

  }
};
