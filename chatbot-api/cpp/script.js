async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chat");

  const userMsg = input.value;
  chatBox.innerHTML += `<p><b>You:</b> ${userMsg}</p>`;
  input.value = "";

  // Call backend API
  const res = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg })
  });

  const data = await res.json();
  chatBox.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;
}
