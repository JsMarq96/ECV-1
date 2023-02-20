var message_box = document.getElementById("conversation_area");


function add_message(sender_id, sender_name, message, from_user, style) {
  var bubble_class = "message-to-user"
  if (from_user) {
    bubble_class = "message-from-user";
  }

  var message_main = document.createElement('div');
  message_main.classList.add('message-container');

  var message_buble = document.createElement('div');
  message_buble.classList.add('message');
  message_buble.classList.add(bubble_class);
  message_buble.classList.add('message-style-' + style);

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

  message_box.appendChild(message_main);
  message_box.scrollTop = 100000;
}

function add_bubble_notification(text) {
  var main_div = document.createElement('div');
  main_div.classList.add('message-container');

  var sub_div = document.createElement('div');
  sub_div.classList.add('message-join');

  sub_div.innerHTML = text;

  main_div.appendChild(sub_div);

  this.message_box.appendChild(main_div);
  this.message_box.scrollTop = 100000;
}
