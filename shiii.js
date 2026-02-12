(function () {
    if (window.__polliInjected) return;
    window.__polliInjected = true;

    let chatHistory = [
        { role: "system", content: "give very concise responses without markdown." }
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
<style>
#polli-chat {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-family: sans-serif;
}

#polli-chat * {
  border-radius: 0 !important;
}

#polli-header {
  padding: 8px;
  border-bottom: 1px solid #000;
  cursor: move;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}

#polli-messages {
  flex: 1;
  padding: 8px;
  overflow: auto;
  font-size: 14px;
}

#polli-input-row {
  display: flex;
  border-top: 1px solid #000;
}

#polli-input {
  flex: 1;
  border: none;
  border-right: 1px solid #000;
  padding: 8px;
  outline: none;
  color: #000;
  background: #fff !important;
  border-radius: 0 !important;
}

#polli-send {
  border: none;
  padding: 8px 12px;
  background: #fff !important;
  color: #000;
  cursor: pointer;
  border-radius: 0 !important;
}
</style>

<div id="polli-chat">
  <div id="polli-header">
    AI Chat
  </div>
  <div id="polli-messages"></div>
  <div id="polli-input-row">
    <input id="polli-input" placeholder="Type..." />
    <button id="polli-send">Send</button>
  </div>
</div>
`;

        document.body.appendChild(box);

        const messages = document.getElementById("polli-messages");
        const input = document.getElementById("polli-input");

        function addMessage(role, text) {
            const div = document.createElement("div");
            div.style.marginBottom = "6px";
            div.innerHTML = "<b>" + (role === "user" ? "You" : "AI") + ":</b> " + text;
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
                const reply = data.choices?.[0]?.message?.content || "No response";

                chatHistory.push({ role: "assistant", content: reply });
                addMessage("assistant", reply);
            } catch {
                addMessage("assistant", "Error contacting AI");
            }
        }

        document.getElementById("polli-send").onclick = send;
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") send();
        });

        const header = document.getElementById("polli-header");
        let offsetX, offsetY, isDown = false;

        header.onmousedown = e => {
            isDown = true;
            offsetX = e.clientX - box.offsetLeft;
            offsetY = e.clientY - box.offsetTop;

            document.onmousemove = ev => {
                if (!isDown) return;
                box.style.left = ev.clientX - offsetX + "px";
                box.style.top = ev.clientY - offsetY + "px";
            };

            document.onmouseup = () => {
                isDown = false;
                document.onmousemove = null;
            };
        };
    }

    function toggle() {
        const box = document.getElementById("polli-chat-widget");
        if (!box) {
            createChat();
        } else {
            box.style.display = box.style.display === "none" ? "flex" : "none";
        }
    }

    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "3") {
            e.preventDefault();
            toggle();
        }
    });
})();
