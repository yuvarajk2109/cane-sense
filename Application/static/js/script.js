document.addEventListener("DOMContentLoaded", () => {

    let currentLang = "en";
    const uiText = {
        en: {
            caneSenseTitle: "CaneSense",
            menuHome: "Home",
            menuAbout: "About Us",
            menuContact: "Contact",
            uploadBtn: "Choose File",
            clearChat: "Clear Chat",
            languageBtn: "தமிழ்",
            pastChats: "Past Chats",
            chatPlaceholder: "Ask something...",
            listening: "Listening... Press again to stop.",
            uploadLabel: "Upload an image of sugarcane leaf:",
            classifiedDisease: "Classified Disease:",
            confidence: "Confidence:",
            processing: "Processing",
            thinking: "Thinking",
            unableToFetch: "Unable to fetch data on ",
            transcriptionFailed: "Voice transcription failed. Please try again.",
            pastChatsTitle: "Past Chats",
            expertBtn: "Connect to Experts",
            expertPopupText: "Do you want to connect to an expert?",
            expertConfirmMsg: "An expert has been notified and will reach out soon."
        },
        ta: {
            caneSenseTitle: "கேன் சென்ஸ்",
            menuHome: "முகப்பு",
            menuAbout: "எங்களைப் பற்றி",
            menuContact: "தொடர்பு",
            uploadBtn: "கோப்பு தேர்வு செய்",
            clearChat: "செய்திகளை நீக்கு",
            languageBtn: "English",
            pastChats: "முந்தைய உரையாடல்கள்",
            chatPlaceholder: "ஏதாவது கேளுங்கள்...",
            listening: "கேட்கிறது... நிறுத்த மீண்டும் அழுத்தவும்.",
            uploadLabel: "கரும்பு இலைப் படத்தை பதிவேற்றவும்:",
            classifiedDisease: "வகைப்படுத்தப்பட்ட நோய்:",
            confidence: "நம்பிக்கை:",
            processing: "செயலாக்குகிறது",
            thinking: "சிந்திக்கிறது",
            unableToFetch: "தகவலை பெற முடியவில்லை: ",
            transcriptionFailed: "குரல் மாற்றம் தோல்வியுற்றது. தயவு செய்து மீண்டும் முயற்சிக்கவும்.",
            pastChatsTitle: "முந்தைய உரையாடல்கள்",
            expertBtn: "நிபுணர்களை தொடர்பு கொள்ள",
            expertPopupText: "நிபுணரை தொடர்பு கொள்ள விரும்புகிறீர்களா?",
            expertConfirmMsg: "ஒரு நிபுணருக்கு தகவல் தெரிவிக்கப்பட்டுள்ளது. விரைவில் உங்களை தொடர்பு கொள்வார்."
        }
    };
    function updateUILanguage() {
        document.querySelector("#caneSight h2").textContent = uiText[currentLang].caneSenseTitle;
        document.querySelector("#sidebar a:nth-of-type(1)").textContent = uiText[currentLang].menuHome;
        document.querySelector("#sidebar a:nth-of-type(2)").textContent = uiText[currentLang].menuAbout;
        document.querySelector("#sidebar a:nth-of-type(3)").textContent = uiText[currentLang].menuContact;
        document.getElementById("uploadBtn").textContent = uiText[currentLang].uploadBtn;
        document.getElementById("clearChatBtn").textContent = uiText[currentLang].clearChat;
        document.getElementById("languageBtn").textContent = uiText[currentLang].languageBtn;
        document.getElementById("historyToggle").textContent = uiText[currentLang].pastChats;
        document.getElementById("chatInput").placeholder = uiText[currentLang].chatPlaceholder;
        document.getElementById("listeningIndicator").textContent = uiText[currentLang].listening;
        document.querySelector("#historyContent h3").textContent = uiText[currentLang].pastChatsTitle;
        document.querySelector("#caneSight p").textContent = uiText[currentLang].uploadLabel;
        document.getElementById("expertBtn").textContent = uiText[currentLang].expertBtn;
        document.getElementById("expertPopupText").textContent = uiText[currentLang].expertPopupText;
        document.getElementById("popupBtnYes").textContent = (currentLang === "en" ? "Yes" : "ஆம்");
        document.getElementById("popupBtnNo").textContent = (currentLang === "en" ? "No" : "இல்லை");
        const result = document.getElementById("classificationResult");
        if (result.innerHTML.trim() !== "") {
            result.innerHTML = result.innerHTML
                .replace(/Classified Disease:/g, uiText[currentLang].classifiedDisease)
                .replace(/Confidence:/g, uiText[currentLang].confidence)
                .replace(/வகைப்படுத்தப்பட்ட நோய்:/g, uiText[currentLang].classifiedDisease)
                .replace(/நம்பிக்கை:/g, uiText[currentLang].confidence);
        }
    }
    const languageBtn = document.getElementById("languageBtn");
    languageBtn.addEventListener("click", () => {
        currentLang = currentLang === "en" ? "ta" : "en";
        updateUILanguage();
    });
    
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");    
    sidebarToggle.addEventListener("click", () => {
        sidebar.style.left = sidebar.style.left === "0px" ? "-230px" : "0px";
    }); 

    const historySidebar = document.getElementById("historySidebar");
    const historyToggle = document.getElementById("historyToggle");
    const historyClose = document.getElementById("historyClose");
    historyToggle.addEventListener("click", () => {
        historySidebar.style.right = historySidebar.style.right === "0px" ? "-300px" : "0px";
    });
    historyClose.addEventListener("click", () => {
        historySidebar.style.right = "-300px";
    });

    const imageUpload = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");    
    const classifyLoader = document.getElementById("classifyLoader");
    const classificationResult = document.getElementById("classificationResult");

    document.getElementById("uploadBtn").addEventListener("click", () => {
        imageUpload.click();
    });

    imageUpload.addEventListener("change", async () => {
        if (!imageUpload.files || imageUpload.files.length === 0) return;

        clearChat();
        showChatLoader();  

        previewImage.style.display = "block";

        classificationResult.textContent = "";
        classificationResult.classList.remove("filled");

        classifyLoader.classList.remove("hidden");
        const file = imageUpload.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await fetch("/upload-image", { method: "POST", body: formData });
            const data = await res.json();
            classifyLoader.classList.add("hidden");
            if (data.success) {
                classificationResult.innerHTML = `
                    <div>
                        <strong>Classified Disease:</strong> ${data.predicted_class}<br>
                        <span class="score-info"><strong>Confidence:</strong> ${(data.confidence * 100).toFixed(2)}%</span>
                    </div>
                `;
                hideChatLoader();
                if (data.message) {
                    addMessage("bot", data.message.replace(/\n/g, "<br>"));
                } else {
                    addMessage("bot", uiText[currentLang].unableToFetch + data.predicted_class + ".");
                }
            } else {
                classificationResult.textContent = "Classification failed: " + (data.error || "unknown");
            }
            } catch (err) {
                classificationResult.textContent = "Upload error: " + err.message;
            }
    });

    const chatHistory = document.getElementById("chatHistory");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const pastChatsUl = document.getElementById("pastChats");
    let sessionHistory = [];

    function addMessage(sender, text) {
        const msg = document.createElement("div");
        msg.classList.add("chat-message", sender === "user" ? "user" : "bot");
        msg.innerHTML = text;
        chatHistory.appendChild(msg);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function showChatLoader(type = "bot") {
        hideChatLoader();

        const loader = document.createElement("div");
        loader.classList.add("chat-loader", type);

        const label = type === "user" ? uiText[currentLang].processing : uiText[currentLang].thinking;

        loader.innerHTML = `
            <div class="bubble">
                <span>${label}</span>
                <div class="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;

        chatHistory.appendChild(loader);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        return loader;
    }

    function hideChatLoader() {
        const loader = document.querySelector(".chat-loader");
        if (loader) loader.remove();
    }

    async function askServer(questionText) {
        console.log("Sending to server:", questionText);
        addMessage("user", questionText);
        sessionHistory.push({ sender: "user", text: questionText });

        const loader = showChatLoader();

        const payload = { question: questionText };
        try {
            const res = await fetch("/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            hideChatLoader();
            if (data.success) {
                console.log(data);
                addMessage("bot",
                    data.answer +
                    (data.canonical_question
                        ? `<br><span class="score-info">(Matched: ${data.canonical_question} | Score: ${(data.score * 100).toFixed(2)}%)</span>`
                        : ""
                    )
                );
                sessionHistory.push({ sender: "bot", text: data.answer });
            } else {
                addMessage("bot", "Error: " + (data.error || "Unknown"));
            }
        } catch (err) {
            hideChatLoader();
            addMessage("bot", "Request failed: " + err.message);
        }
    }

    sendBtn.addEventListener("click", () => {
        const txt = chatInput.value.trim();
        if (!txt) return;
        askServer(txt);
        chatInput.value = "";
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendBtn.click();
        }
    });

    let isListening = false;
    const micBtn = document.getElementById("micBtn");
    const listeningIndicator = document.getElementById("listeningIndicator");

    let mediaRecorder = null;
    let audioChunks = [];
    let stream = null;
    let options = {};

    micBtn.addEventListener("click", async () => {
        if (!isListening) {
            isListening = true;
            micBtn.classList.add("listening");
            listeningIndicator.classList.add("active");
            showChatLoader("user")

            stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (MediaRecorder.isTypeSupported("audio/webm")) {
                options.mimeType = "audio/webm";
            } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
                options.mimeType = "audio/ogg;codecs=opus";
            } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
                console.log("Hello! OGG!")
                options.mimeType = "audio/ogg";
            }

            console.log("Using recorder format:", options.mimeType);

            audioChunks = [];

            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    audioChunks.push(e.data);
                }
            };

            mediaRecorder.start(200);
            console.log("Recording started.");
        } else {
            isListening = false;
            micBtn.classList.remove("listening");
            listeningIndicator.classList.remove("active");

            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                console.log("Recording stopped.");
            }

            if (stream) {
                stream.getTracks().forEach(track => {
                    track.enabled = false;   
                    track.stop();            
                 });
            }

            setTimeout(() => finalizeRecording(), 300);
        }
    });

    function finalizeRecording() {
        if (audioChunks.length === 0) {
            console.warn("No audio captured.");
            return;
        }

        const audioBlob = new Blob(audioChunks, { type: options.mimeType });
        console.log("Final audio type:", audioBlob.type);
        console.log("Final blob size:", audioBlob.size);

        sendToWhisper(audioBlob);
    }

    async function sendToWhisper(audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob, "speech.webm");

        try {
            const res = await fetch("/asr-whisper", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.success && data.text) {
                askServer(data.text); 
            } else {
                addMessage("bot", uiText[currentLang].transcriptionFailed);
                hideChatLoader();
            }
        } catch (err) {
            addMessage("bot", "ASR error: " + err.message);
        }
    }

    // let recognition = null;
    // if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    //     recognition = new SpeechRecognition();
    //     recognition.lang = "en-US";
    //     recognition.interimResults = true;
    //     recognition.maxAlternatives = 1;
    //     recognition.continuous = true;

    //     let restartTimeout = null;
    //     let restartCount = 0;

    //      micBtn.addEventListener("click", () => {
    //         if (!isListening) {
    //             isListening = true;
    //             micBtn.classList.add("listening");
    //             listeningIndicator.classList.add("active");
    //             try {
    //                 recognition.start();
    //             } catch (err) {
    //                 console.warn("Start failed:", err.message);
    //             }
    //             console.log("Listening started (tap mic again to stop).");
    //         } else {
    //             isListening = false;
    //             micBtn.classList.remove("listening");
    //             listeningIndicator.classList.remove("active");
    //             clearTimeout(restartTimeout);
    //             try {
    //                 recognition.stop();
    //             } catch (err) {
    //                 console.warn("Stop failed:", err.message);
    //             }
    //             console.log("Listening stopped.");
    //         }
    //     });

    //     recognition.addEventListener("start", () => {
    //         console.log("Voice recognition started.");
    //     });

    //     recognition.addEventListener("end", () => {
    //         console.log("Recognition ended internally.");

    //         if (isListening) {
    //             console.log("Restarting continuous listening...");
    //             clearTimeout(restartTimeout);
    //             restartTimeout = setTimeout(() => {
    //                 try {
    //                     recognition.start();
    //                 } catch (err) {
    //                     console.warn("Restart failed:", err.message);
    //                 }
    //             }, 600);
    //         }
    //     });

    //     recognition.addEventListener("result", (ev) => {
    //         const transcript = Array.from(ev.results)
    //             .map(r => r[0].transcript)
    //             .join("")
    //             .trim();
    //         if (ev.results[0].isFinal && transcript) {
    //             console.log("Heard:", transcript);
    //             askServer(transcript);
    //         }
    //     });

    //     recognition.addEventListener("error", (ev) => {
    //         console.warn("Voice recognition error:", ev.error);
    //          if (isListening && ev.error !== "aborted") {
    //             clearTimeout(restartTimeout);
    //             restartTimeout = setTimeout(() => {
    //                 try {
    //                     recognition.start();
    //                 } catch (err) {
    //                     console.warn("Recovery failed:", err.message);
    //                 }
    //             }, 600);
    //         }
    //     });
    // } else {
    //     micBtn.disabled = true;
    //     micBtn.title = "Voice input is not supported in this browser.";
    // }

    window.addEventListener("beforeunload", () => {
        if (sessionHistory.length > 0) {
            const li = document.createElement("li");
            const diseaseLabel = window.lastDisease || "Unknown Disease";
            li.textContent = `Chat with ${diseaseLabel} — ${new Date().toLocaleString()}`;
            pastChatsUl.appendChild(li);
        }
    });

    const expertBtn = document.getElementById("expertBtn");
    const expertPopupOverlay = document.getElementById("expertPopupOverlay");
    const popupBtnYes = document.getElementById("popupBtnYes");
    const popupBtnNo = document.getElementById("popupBtnNo");

    expertBtn.addEventListener("click", () => {
        expertPopupOverlay.style.display = "flex"; 
    });

    popupBtnNo.addEventListener("click", () => {
        expertPopupOverlay.style.display = "none";
    });

    popupBtnYes.addEventListener("click", () => {
        expertPopupOverlay.style.display = "none";
        addMessage("bot", uiText[currentLang].expertConfirmMsg);
    });

    async function refreshDisease() {
        try {
        const res = await fetch("/");
        } catch (e) {}
    }

    const clearChatBtn = document.getElementById("clearChatBtn");
    clearChatBtn.addEventListener("click", async () => {
        // if (!confirm("Are you sure you want to clear this chat?")) return;

        chatHistory.innerHTML = "";
        sessionHistory = [];
        previewImage.src = "";
        previewImage.style.display = "none";

        try {
            await fetch("/clear-session", { method: "POST" });
            classificationResult.textContent = "";
        } catch (err) {
            console.warn("Session clear failed:", err);
        }
    });

    function clearChat() {
        chatHistory.innerHTML = "";
        sessionHistory = [];
    }

});