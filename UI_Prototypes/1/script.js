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
    resultBox.innerHTML = "<b>Disease:</b> CaneSight prediction placeholder.";
}

function recordVoice() {
    alert("ASR placeholder.");
}

function getAnswer() {
    const question = document.getElementById("questionInput").value;
    const answerBox = document.getElementById("answer");
    answerBox.style.display = "block";
    if (question.trim() === "") {
        answerBox.innerHTML = "<b>Answer:</b> Please ask a valid question.";
    } else {
        answerBox.innerHTML = "<b>Answer:</b> CaneSpeak response placeholder.";
    }
}