const chat = document.getElementById("enter-chat");
console.log("chat", chat);
chat.addEventListener("submit", function (event) {
  event.preventDefault(); 
  const formData = new FormData(event.target);
  const username = formData.get("username");
  const room = formData.get("room");

  const url = `chat.html?username=${encodeURIComponent(
    username
  )}&room=${encodeURIComponent(room)}`;

  window.location.href = url;
});
