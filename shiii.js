(function () {
  if (window.__polliInjected) return;
  window.__polliInjected = true;

  let chatHistory = [
    { role: "system", content: "give very concice responses without markdown." }
  ];

  function createChat() {
    if (document.getElementById("polli-chat-widget")) return;

    const box = document.createElement("div");
    box.id = "polli-chat-widget";
    box.style.position = "fixed";
    box.style.top = "120px";
    box.style.left = "120px";
    box.style.width = "380px";
    box.style.height = "500px";
    box.style.background = "#fff";
    box.style.border = "1px solid #000";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.zIndex = "999999";
    box.style.fontFamily = "Arial, sans-serif";
    box.style.color = "#000";

    box.innerHTML = `
      <div id="polli-header" style="padding:8px;border-bottom:1px solid #000;cursor:move;font-weight:bold;display:flex;justify-content:space-between;">
        AI Chat
        <span id="polli-close" style="cursor:pointer;">×</span>
      </div>
      <div id="polli-messages" style="flex:1;padding:8px;overflow:auto;font-size:14px;"></div>
      <div style="display:flex;border-top:1px solid #000;">
        <input id="polli-input" placeholder="Type..." 
          style="flex:1;border:none;border-right:1px solid #000;padding:8px;outline:none;color:#000;">
        <button id="polli-send"
          style="border:none 0px;padding:8px 12px;background:#fff;color:#000;cursor:pointer;">
          Send
        </button>
      </div>
    `;

    document.body.appendChild(box);

    document.getElementById("polli-close").onclick = () => box.remove();

    const messages = document.getElementById("polli-messages");
    const input = document.getElementById("polli-input");

    function addMessage(role, text) {
      const div = document.createElement("div");
      div.style.marginBottom = "6px";
      div.innerHTML =
        "<b>" + (role === "user" ? "You" : "AI") + ":</b> " + text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    async function send() {
      const text = input.value.trim();
      if (!text) return;

      addMessage("user", text);
      chatHistory.push({ role: "user", content: text });
      input.value = "";

      try {
        const res = await fetch("https://text.pollinations.ai/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai",
            messages: chatHistory
          })
        });

        const data = await res.json();
        const reply =
          data.choices?.[0]?.message?.content || "No response";

        chatHistory.push({ role: "assistant", content: reply });
        addMessage("assistant", reply);

      } catch (err) {
        addMessage("assistant", "Error contacting AI");
      }
    }

    document.getElementById("polli-send").onclick = send;
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") send();
    });

    // Dragging
    const header = document.getElementById("polli-header");
    let offsetX, offsetY, isDown = false;

    header.onmousedown = e => {
      isDown = true;
      offsetX = e.clientX - box.offsetLeft;
      offsetY = e.clientY - box.offsetTop;

      document.onmousemove = ev => {
        if (!isDown) return;
        box.style.left = (ev.clientX - offsetX) + "px";
        box.style.top = (ev.clientY - offsetY) + "px";
      };

      document.onmouseup = () => {
        isDown = false;
        document.onmousemove = null;
      };
    };
  }

  function toggle() {
    const existing = document.getElementById("polli-chat-widget");
    if (existing) existing.remove();
    else createChat();
  }

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "3") {
      e.preventDefault();
      toggle();
    }
  });

  console.log("Polli chat injected. Use Ctrl+3 to toggle.");
})();
