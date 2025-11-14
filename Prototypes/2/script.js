const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

sidebarToggle.addEventListener("click", () => {
    console.log("Clicked!");
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-230px";
    } else {
        sidebar.style.left = "0px";
    }
});

const historySidebar = document.getElementById("historySidebar");
const historyToggle = document.getElementById("historyToggle");

historyToggle.addEventListener("click", () => {
    if (historySidebar.style.right === "0px") {
        historySidebar.style.right = "-230px";
    } else {
        historySidebar.style.right = "0px";
    }
});

const historyClose = document.getElementById("historyClose");
historyClose.addEventListener("click", () => {
    historySidebar.style.right = "-230px";
});

const imageUpload = document.getElementById("imageUpload");
const classificationResult = document.getElementById("classificationResult");
let classifiedDisease = null;
const previewImage = document.getElementById("previewImage");


imageUpload.addEventListener("change", () => {
    if (imageUpload.files.length > 0) {
        const file = imageUpload.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);

        const diseases = ["Bacterial Blight", "Healthy", "Mosaic", "Red Rot", "Rust", "Yellow"];
        classifiedDisease = diseases[Math.floor(Math.random() * diseases.length)];
        classificationResult.textContent = "Classified Disease: " + classifiedDisease;
    }
});

const chatHistory = document.getElementById("chatHistory");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const pastChats = document.getElementById("pastChats");
let sessionHistory = [];

function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.classList.add("chat-message", sender);
    msg.textContent = text;
    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

sendBtn.addEventListener("click", () => {
    const userText = chatInput.value.trim();
    if (userText) {
        addMessage("user", userText);
        sessionHistory.push({ sender: "user", text: userText });

        const botReply = classifiedDisease
            ? `Based on ${classifiedDisease}, here’s an answer to your query: "${userText}".`
            : `Please upload an image in CaneSight first.`;
        setTimeout(() => {
            addMessage("bot", botReply);
            sessionHistory.push({ sender: "bot", text: botReply });
        }, 500);
        chatInput.value = "";
    }
});

micBtn.addEventListener("click", () => {
    addMessage("user", "[Voice Input Placeholder]");
    sessionHistory.push({ sender: "user", text: "[Voice Input Placeholder]" });
    const botReply = classifiedDisease
    ? `This is a response to your voice query regarding ${classifiedDisease}.`
    : `Please upload an image in CaneSight first.`;
    setTimeout(() => {
        addMessage("bot", botReply);
        sessionHistory.push({ sender: "bot", text: botReply });
    }, 500);
});


window.addEventListener("beforeunload", () => {
    if (sessionHistory.length > 0) {
        const li = document.createElement("li");
        li.textContent = "Chat with " + (classifiedDisease || "Unknown Disease");
        pastChats.appendChild(li);
    }
});