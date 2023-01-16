var CHAT = {

  current_user: "Juan",

  add_message: function (sender_name, message) {
      var bubble_class = "message_to_user"
    if (sender_name.localeCompare(CHAT.current_user) == 0) {
        bubble_class = "message_from_user";
      }
    
      var message_main = document.createElement('div');
      message_main.classList.add('message-cointainer');

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

      message_buble.appendChild(sender_paragraph);
      message_buble.appendChild(text_paragraph);
      message_main.appendChild(message_buble);

      document.getElementById('chat-conversation').appendChild(message_main);
  }
};
