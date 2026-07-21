// ===============================
// BVLTNE v0.4
// ===============================

// ---------- Supabase ----------
let recordedBlob = null;
let mediaRecorder = null;
let recordedChunks = [];
let currentTake = 1;
const SUPABASE_URL = "https://mipxgufdyykcudfwsijy.supabase.co";
console.log(SUPABASE_URL);
const SUPABASE_KEY =
"sb_publishable_YJcYWUZqfXZ-vrnAI4DUjw_ZEkhpmoR";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("BVLTNE Connected");

let currentAudio = null;



// ---------- Page Control ----------

function hideAll() {

    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("producerPage").classList.add("hidden");

    document.getElementById("sessionPanel").classList.add("hidden");
    document.getElementById("producerSessionPanel").classList.add("hidden");
}
function closeRecordingModal(){

    document
    .getElementById("recordingModal")
    .classList
    .add("hidden");

}
function goHome() {
localStorage.removeItem("producerLoggedIn");
    hideAll();

    document.getElementById("homePage").classList.remove("hidden");

}
function logout() {

    localStorage.removeItem("producerLoggedIn");
    localStorage.removeItem("artistMode");
    localStorage.removeItem("artistSession");
    hideAll();

    document
        .getElementById("homePage")
        .classList
        .remove("hidden");

}
function backToHome() {

    window.currentSession = null;

    localStorage.removeItem("artistMode");
    localStorage.removeItem("artistSession");

    hideAll();

    document.getElementById("homePage").classList.remove("hidden");

    document.getElementById("sessionPanel").classList.add("hidden");
    document.getElementById("sessionManagerPanel").classList.add("hidden");
    document.getElementById("newSessionPanel").classList.add("hidden");

    document.getElementById("joinPanel").style.display = "";
    document.getElementById("producerLink").style.display = "";

    document.getElementById("instructionPanel").classList.add("hidden");

    document.getElementById("sessionCode").value = "";

}
function showLogin() {

    hideAll();

    document.getElementById("loginPage").classList.remove("hidden");

}
function stopAudio() {

    if (currentAudio) {

        currentAudio.pause();
        currentAudio.currentTime = 0;

    }

    if (mediaRecorder && mediaRecorder.state === "recording") {

        mediaRecorder.stop();

    }

    if (window.recordStream) {

        window.recordStream.getTracks().forEach(track => track.stop());

    }

}
function login() {

    const pw = document.getElementById("password").value;

    if (pw === "010305") {
        localStorage.setItem("producerLoggedIn", "true");
        hideAll();

        document.getElementById("producerPage").classList.remove("hidden");
document
    .getElementById("newSessionPanel")
    .classList
    .add("hidden");
document
    .getElementById("sessionPanel")
    .classList
    .add("hidden");
    }

    else {

        alert("Wrong Password");

    }

}
function showNewSession() {
document
    .getElementById("sessionManagerPanel")
    .classList
    .add("hidden");
    document
        .getElementById("newSessionPanel")
        .classList
        .remove("hidden");

}
function playRecording() {

    if (!recordedBlob) {

        alert("No recording.");

        return;

    }

    currentAudio = new Audio(
        URL.createObjectURL(recordedBlob)
    );

    currentAudio.play();

}

async function submitRecording() {

    if (!recordedBlob) {

        alert("No recording.");
        return;

    }

    const fileName = `take${currentTake}.wav`;
    console.log(fileName);
    const fileName = `take${currentTake}.wav`;

const path =
    `${window.currentSession.session_token}/${fileName}`;

const wavBlob = await blobToWav(recordedBlob);

const { data, error } =
    await db.storage
        .from("recordings")
        .upload(
            path,
            wavBlob,
            {
                upsert: true,
                contentType: "audio/wav"
            }
        );

    console.log("Upload data:", data);
    console.log("Upload error:", error);

    if (error) {

        alert(error.message);
        return;

    }

    closeRecordingModal();

    if (currentTake < 5) {

        alert(`Take ${currentTake} uploaded!`);
        console.log("CURRENT TAKE =", currentTake);
        currentTake++;

        document.getElementById("recordGuideBtn").innerText =
            `Record Take ${currentTake}`;

        recordedBlob = null;

    } else {

        alert("Take 5 uploaded!\n\nAll 5 takes have been submitted.\nThank you!");

        document.getElementById("recordGuideBtn").disabled = true;

    }

}
function rerecord() {

    recordedBlob = null;

    document
    .getElementById("recordingModal")
    .classList
    .remove("hidden");

    recordWithGuide();

}
async function showSessionManager() {

    document
        .getElementById("newSessionPanel")
        .classList
        .add("hidden");
document
    .getElementById("producerSessionPanel")
    .classList
    .add("hidden");
    document
        .getElementById("sessionManagerPanel")
        .classList
        .remove("hidden");

    const { data, error } = await db
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });
    console.log("DATA =", JSON.stringify(data));
    if (error) {
        alert(error.message);
        return;
    }

    const list = document.getElementById("sessionList");

    list.innerHTML = "";
if (!data || data.length === 0) {
    list.innerHTML = "<p>No sessions found.</p>";
    return;
}
    data.forEach(session => {
        console.log(JSON.stringify(session));
        list.innerHTML += `
            <div class="card">

                <h3>${session.session_name}</h3>

                <p><b>ID:</b> ${session.id}</p>
                <p><b>Code:</b> ${session.session_token}</p>
                <button
    class="openBtn"
    onclick="openSession(${session.id})">
    Open
</button>
                <button
                    class="deleteBtn"
                    onclick="deleteSession(${JSON.stringify(session.id)})">
                    Delete
                </button>

                <hr>

            </div>
        `;

    });

}

async function deleteSession(id) {

    if (!confirm("Delete this session?\n\nThis cannot be undone.")) {
        return;
    }

    // 데이터타입 문제를 방지하기 위해 id를 숫자(Number)로 확실하게 변환합니다.
    const numericId = Number(id);
alert("Deleting ID = " + numericId);
    console.log("Trying to delete session ID:", numericId);

    const { data, error } = await db
        .from("sessions")
        .delete()
        .eq("id", numericId)
        .select();

    console.log("Delete Result Data:", data);
    console.log("Delete Result Error:", error);

    if (error) {
        alert("Delete failed: " + error.message);
        return;
    }

    alert("Session deleted successfully!");

await showSessionManager();
}
async function openSession(id) {

    const { data, error } = await db
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    document
        .getElementById("sessionManagerPanel")
        .classList
        .add("hidden");

    document
    .getElementById("producerSessionPanel")
    .classList
    .remove("hidden");

    document
    .getElementById("producerSessionName")
    .innerText =
    data.session_name;
    document
    .getElementById("producerSessionCode")
    .innerText =
    data.session_token;

    

    window.currentSession = data;
    const { data: files, error: fileError } =
    await db.storage
        .from("recordings")
        .list(data.session_token);

const takeList = document.getElementById("producerTakeList");

if (fileError) {
    takeList.innerHTML = "Unable to load takes.";
    return;
}

if (!files || files.length === 0) {
    takeList.innerHTML = "No takes yet.";
    return;
}

takeList.innerHTML = "";
files.forEach(file => {

    if (file.name === ".emptyFolderPlaceholder") return;

   

    const takeName = file.name.replace(".webm", "");

    takeList.innerHTML += `
<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #333;">

    <span>🎤 ${takeName}</span>

    <div style="display:flex;gap:4px;">
        <button
    class="playTakeBtn"
    data-file="${file.name}"
    style="font-size:11px;padding:2px 6px;">
    ▶
</button>
        <button
    class="downloadWavBtn"
    data-file="${file.name}"
    style="font-size:11px;padding:2px 6px;">
    WAV
</button>
    </div>

</div>
`;

});

takeList.innerHTML += `
    <div style="text-align:center;margin-top:20px;">
        <button id="deleteAllTakesBtn">
            🗑 Delete All Takes
        </button>
    </div>
`;
    document.querySelectorAll(".downloadWavBtn").forEach(btn => {

    btn.onclick = function () {

        downloadWav(this.dataset.file);

    };

});
    document.querySelectorAll(".playTakeBtn").forEach(btn => {

    btn.onclick = async function () {

        const fileName = this.dataset.file;

        const { data, error } = await db.storage
            .from("recordings")
            .createSignedUrl(
                `${window.currentSession.session_token}/${fileName}`,
                60
            );

        if (error) {
            alert(error.message);
            return;
        }

        if (currentAudio) {
            currentAudio.pause();
        }

        currentAudio = new Audio(data.signedUrl);
        currentAudio.play();

    };

});
}
async function playWithGuide() {

    if (!window.currentSession) {
        alert("No current session");
        return;
    }

    const { data, error } = await db.storage
        .from("guides")
        .createSignedUrl(
            window.currentSession.guide_path,
            3600
        );

    if (error) {
        alert(error.message);
        return;
    }

    currentAudio = new Audio(data.signedUrl);

try {

    await currentAudio.play();

}
catch (e) {

    alert(e.message);

}
}
async function playWithoutGuide() {

    if (!window.currentSession) {
        alert("No current session");
        return;
    }

    const { data, error } = await db.storage
        .from("instrumentals")
        .createSignedUrl(
            window.currentSession.instrumental_path,
            3600
        );

    if (error) {
        alert(error.message);
        return;
    }

    currentAudio = new Audio(data.signedUrl);

    try {
        await currentAudio.play();
    }
    catch (e) {
        alert(e.message);
    }

}
async function recordWithGuide() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        window.recordStream = stream;

        recordedChunks = [];
document
    .getElementById("recordingModal")
    .classList
    .add("hidden");
        
mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(event) {

            if (event.data.size > 0) {

                recordedChunks.push(event.data);

            }

        };
        mediaRecorder.onstop = function () {

    recordedBlob = new Blob(recordedChunks, {
    type: mediaRecorder.mimeType
});
            document
    .getElementById("recordingStatus")
    .classList
    .add("hidden");
    alert("Recording finished.");
document
    .getElementById("recordGuideBtn")
    .classList
    .remove("hidden");
document
    .getElementById("recordingModal")
    .classList
    .remove("hidden");
};
        mediaRecorder.start();
document
    .getElementById("recordGuideBtn")
    .classList
    .add("hidden");

document
    .getElementById("recordingStatus")
    .classList
    .remove("hidden");
        
        await playWithGuide();
    }

    catch (err) {

        alert("Microphone permission denied.");

    }

}

async function joinSession() {

    const token =
        document
            .getElementById("sessionCode")
            .value
            .trim()
            .toUpperCase();

    if (!token) {

        alert("Please enter Session Code.");

        return;

    }

   const { data, error } = await db
    .from("sessions")
    .select("*")
    .ilike("session_token", token);

console.log(data);
console.log(error);

if (error) {
    alert(error.message);
    return;
}

if (!data || data.length === 0) {
    alert("Session not found.");
    return;
}

const session = data[0];
    console.log("TOKEN =", token);
    console.log("DATA =", data, "ERROR =", error);

    if (error) {

        alert("Session not found.");

        return;

    }

  hideAll();

document
    .getElementById("homePage")
    .classList
    .remove("hidden");

document
    .getElementById("producerLink")
    .style
    .display = "none";

document
    .getElementById("instructionPanel")
    .classList
    .remove("hidden");
document
    .getElementById("joinPanel")
    .style
    .display = "none";


    document
        .getElementById("currentSessionName")
        .innerText =
       session.session_name;

    document
        .getElementById("currentLyrics")
        .innerText =
        session.lyrics;
    window.currentSession = session;
    localStorage.setItem("artistMode", "true");
    localStorage.setItem("artistSession", JSON.stringify(session));
}

// ---------- Save Session ----------

async function testBackend() {

    const sessionName =
        document.getElementById("sessionName").value.trim();

    const lyrics =
        document.getElementById("lyrics").value.trim();

    const instrumental =
        document.getElementById("instrumentalFile").files[0];

    const guide =
        document.getElementById("guideFile").files[0];

    if (!sessionName) {
        alert("Please enter Session Name.");
        return;
    }

    if (!instrumental) {
        alert("Please select an Instrumental file.");
        return;
    }

    if (!guide) {
        alert("Please select a Guide Vocal file.");
        return;
    }

    // Safe filenames

    const safeInstName =
        instrumental.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const safeGuideName =
        guide.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Upload Instrumental

    const {
        data: instData,
        error: instError
    } = await db.storage
        .from("instrumentals")
        .upload(
            `${sessionName}/${safeInstName}`,
            instrumental
        );

    if (instError) {
        alert("Instrumental Upload Failed\n\n" + instError.message);
        return;
    }

    // Upload Guide

    const {
        data: guideData,
        error: guideError
    } = await db.storage
        .from("guides")
        .upload(
            `${sessionName}/${safeGuideName}`,
            guide
        );

    if (guideError) {
        alert("Guide Upload Failed\n\n" + guideError.message);
        return;
    }

    // Generate Session Token

    const sessionToken =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    // Save Session

    const { error: dbError } = await db
        .from("sessions")
        .insert([
            {
                session_name: sessionName,
                session_token: sessionToken,
                lyrics: lyrics,
                instrumental_path: instData.path,
                guide_path: guideData.path
            }
        ]);

    if (dbError) {
        alert(dbError.message);
        return;
    }

    // Show Session Panel

    

    document
        .getElementById("currentSessionName")
        .innerText =
        sessionName;

    document
        .getElementById("currentLyrics")
        .innerText =
        lyrics;

    const sessionLink =
        window.location.origin +
        window.location.pathname +
        "?session=" +
        sessionToken;

   alert(
    "Session Created Successfully!\n\n" +
    "Session Code: " + sessionToken +
    "\n\n" +
    sessionLink
);

}
// ---------- Events ----------

document.addEventListener("DOMContentLoaded", () => {
    document
    .getElementById("submitBtn")
    ?.addEventListener("click", submitRecording);
    document.getElementById("recordStopBtn")
    ?.addEventListener("click", stopAudio);
    document.getElementById("rerecordBtn")
    ?.addEventListener("click", rerecord);
    document.getElementById("logoutBtn")
    ?.addEventListener("click", logout);
    document.getElementById("playRecordingBtn")
    ?.addEventListener("click", playRecording);
    document.getElementById("backToHomeBtn")
    ?.addEventListener("click", backToHome);
    document.getElementById("startBtn")
        ?.addEventListener("click", startSession);
    document.getElementById("stopBtn")
    ?.addEventListener("click", stopAudio);
    document.getElementById("joinBtn")
        ?.addEventListener("click", joinSession);
document.getElementById("newSessionBtn")
    ?.addEventListener("click", showNewSession);
    document.getElementById("sessionManagerBtn")
    ?.addEventListener("click", showSessionManager);
    document.getElementById("readyBtn")
        ?.addEventListener("click", () => {

            document.getElementById("joinPanel").style.display = "none";

            document.getElementById("instructionPanel")
                .classList
                .add("hidden");

            document.getElementById("sessionPanel")
                .classList
                .remove("hidden");

        });

    document.getElementById("producerLink")
        ?.addEventListener("click", showLogin);

    document.getElementById("loginBtn")
        ?.addEventListener("click", login);

    document.getElementById("backBtn")
        ?.addEventListener("click", goHome);
    document.getElementById("practiceGuideBtn")
    ?.addEventListener("click", playWithGuide);
    document.getElementById("recordGuideBtn")
    ?.addEventListener("click", recordWithGuide);
document.getElementById("practiceNoGuideBtn")
    ?.addEventListener("click", playWithoutGuide);
    document.getElementById("instrumentalFile")
        ?.addEventListener("change", function () {

            const file = this.files[0];

            document.getElementById("instrumentalName").innerText =
                file ? file.name : "No file selected";

        });

    document.getElementById("guideFile")
        ?.addEventListener("change", function () {

            const file = this.files[0];

            document.getElementById("guideName").innerText =
                file ? file.name : "No file selected";

        });
if (localStorage.getItem("producerLoggedIn") === "true") {
    hideAll();
    document.getElementById("producerPage").classList.remove("hidden");
}
if (localStorage.getItem("artistMode") === "true") {

    const session =
        JSON.parse(localStorage.getItem("artistSession"));

    window.currentSession = session;

    hideAll();

    document
        .getElementById("homePage")
        .classList
        .remove("hidden");

    document
        .getElementById("producerLink")
        .style
        .display = "none";

    document
        .getElementById("joinPanel")
        .style
        .display = "none";

    document
        .getElementById("instructionPanel")
        .classList
        .add("hidden");

    document
        .getElementById("sessionPanel")
        .classList
        .remove("hidden");

    document
        .getElementById("currentSessionName")
        .innerText =
        session.session_name;

    document
        .getElementById("currentLyrics")
        .innerText =
        session.lyrics;

}
});
async function blobToWav(webmBlob) {

    const arrayBuffer = await webmBlob.arrayBuffer();

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;

    const buffer = new ArrayBuffer(44 + samples * numChannels * 2);
    const view = new DataView(buffer);

    function writeString(offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples * numChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples * numChannels * 2, true);

    let offset = 44;

    for (let i = 0; i < samples; i++) {

        for (let channel = 0; channel < numChannels; channel++) {

            let sample = audioBuffer.getChannelData(channel)[i];

            sample = Math.max(-1, Math.min(1, sample));

            view.setInt16(
                offset,
                sample < 0 ? sample * 0x8000 : sample * 0x7FFF,
                true
            );

            offset += 2;
        }
    }

    await audioCtx.close();

    return new Blob([buffer], { type: "audio/wav" });

}
