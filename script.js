// ===============================
// BVLTNE v0.4
// ===============================

// ---------- Supabase ----------

const SUPABASE_URL = "https://mipxgufdyykcudfwsijy.supabase.co";

const SUPABASE_KEY =
"sb_publishable_YJcYWUZqfXZ-vrnAI4DUjw_ZEkhpmoR";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("BVLTNE Connected");


// ---------- Page Control ----------

function hideAll() {

    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("producerPage").classList.add("hidden");

}

function goHome() {

    hideAll();

    document.getElementById("homePage").classList.remove("hidden");

}

function showLogin() {

    hideAll();

    document.getElementById("loginPage").classList.remove("hidden");

}

function login() {

    const pw = document.getElementById("password").value;

    if (pw === "010305") {

        hideAll();

        document.getElementById("producerPage").classList.remove("hidden");

    }

    else {

        alert("Wrong Password");

    }

}

async function startSession() {

    const params = new URLSearchParams(window.location.search);

    const sessionToken = params.get("session");

    if (!sessionToken) {

        alert("No session link.");

        return;

    }

    const { data, error } = await db
        .from("sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .single();

    if (error) {

        alert("Session not found.");

        return;

    }

    hideAll();

    document
        .getElementById("producerPage")
        .classList
        .remove("hidden");

    document
        .getElementById("sessionPanel")
        .classList
        .remove("hidden");

    document
        .getElementById("currentSessionName")
        .innerText =
        data.session_name;

    document
        .getElementById("currentLyrics")
        .innerText =
        data.lyrics;

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
        .getElementById("sessionPanel")
        .classList
        .remove("hidden");

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
        sessionLink
    );

}
// ---------- Events ----------

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("startBtn")
        ?.addEventListener("click", startSession);

    document.getElementById("producerLink")
        ?.addEventListener("click", showLogin);

    document.getElementById("loginBtn")
        ?.addEventListener("click", login);

    document.getElementById("backBtn")
        ?.addEventListener("click", goHome);

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

});
