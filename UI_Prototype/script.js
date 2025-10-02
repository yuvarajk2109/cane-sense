function previewImage(event) {
    const preview = document.getElementById("preview");
    const uploadText = document.getElementById("uploadText");
    preview.src = URL.createObjectURL(event.target.files[0]);
    preview.style.display = "block";
    uploadText.style.display = "none";
}


function analyseImage() {
    const resultBox = document.getElementById("result");
    resultBox.style.display = "block";
    resultBox.innerHTML = "<b>Prediction:</b> Rust Disease (CaneSight simulated output)";
}

function recordVoice() {
    alert("Voice recording simulation: Your voice will be converted to text (ASR module placeholder).");
}

function getAnswer() {
    const question = document.getElementById("questionInput").value;
    const answerBox = document.getElementById("answer");
    answerBox.style.display = "block";
    if (question.trim() === "") {
        answerBox.innerHTML = "<b>Answer:</b> Please ask a valid question.";
    } else {
        answerBox.innerHTML = "<b>Answer:</b> This is a placeholder response for your query: '" + question + "'";
    }
}