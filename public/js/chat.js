const socket = io();

//elemets
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#locationmessage-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// scroll of the chat box
const autoscroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //  console.log(newMessageStyles);

  const visibleHeight=$messages.offsetHeight;
  
  //height of messages container
  const containerHeight=$messages.scrollHeight;

  // how far have i scrolled
  const scrollOffset=$messages.scrollTop+visibleHeight;

  if(containerHeight-newMessageHeight<=scrollOffset){
      $messages.scrollTop=$messages.scrollHeight;
  }

};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  //disable

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message dilivered");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geoloaction is not supperted by your browser");
  }
  $sendLocationButton.setAttribute("disable", "disable");

  navigator.geolocation.getCurrentPosition((position) => {
    //console.log(position);

    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disable");
        console.log("Location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
