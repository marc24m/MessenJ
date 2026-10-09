// ==========================================
// MESSENJ - SCRIPT.JS
// ==========================================

// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://dplyaisicmujmecpnbaf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_v7XAz9LOE-9PcE2ZIDU0cA_rGUEMgv4";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// LOCAL PLACEHOLDERS
// ==========================================

const STATUS_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' rx='25' fill='%23e5e7eb'/%3E%3C/svg%3E";

const USER_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='45' height='45'%3E%3Crect width='45' height='45' rx='22.5' fill='%23e5e7eb'/%3E%3C/svg%3E";


// ==========================================
// ELEMENTS
// ==========================================

const authSection =
    document.getElementById("auth-section");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const signupButton =
    document.getElementById("signup-btn");

const loginButton =
    document.getElementById("login-btn");

const authMessage =
    document.getElementById("auth-message");

const app =
    document.getElementById("app");

const startButton =
    document.getElementById("startButton");

const messenger =
    document.getElementById("messenger");

const usersList =
    document.getElementById("users-list");

const messagesContainer =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const logoutButton =
    document.getElementById("logoutButton");

const profileButton =
    document.getElementById("profileButton");

const profileSection =
    document.getElementById("profile-section");

const profileUsername =
    document.getElementById("profile-username");

const profileFullName =
    document.getElementById("profile-full-name");

const profileAvatar =
    document.getElementById("profile-avatar");


// ==========================================
// STATUS ELEMENTS
// ==========================================

const statusInput =
    document.getElementById("status-input");

const statusMediaInput =
    document.getElementById("status-media-input");

const statusMediaPreview =
    document.getElementById("status-media-preview");

const removeStatusMedia =
    document.getElementById("remove-status-media");

const publishStatusButton =
    document.getElementById(
        "publish-status-button"
    );

const statusMessage =
    document.getElementById("status-message");

const statusesContainer =
    document.getElementById("statuses");


// ==========================================
// VARIABLES
// ==========================================

let currentUser = null;

let selectedUserId = null;

let selectedUserName = "";

let selectedUserAvatar = "";

let statusMediaFile = null;

let realtimeChannel = null;

let loadingMessages = false;


// ==========================================
// HELPERS
// ==========================================

function escapeHtml(text) {

    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// AUTH MESSAGE
// ==========================================

function showAuthMessage(
    message,
    success = false
) {

    if (!authMessage) {
        return;
    }

    authMessage.textContent = message;

    authMessage.style.color =
        success ? "green" : "red";
}


// ==========================================
// SIGN UP
// ==========================================

if (signupButton) {

    signupButton.addEventListener(
        "click",
        async () => {

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value.trim();

            if (!email || !password) {

                showAuthMessage(
                    "Veuillez remplir tous les champs."
                );

                return;
            }

            if (password.length < 6) {

                showAuthMessage(
                    "Le mot de passe doit contenir au moins 6 caractères."
                );

                return;
            }

            signupButton.disabled = true;

            showAuthMessage(
                "Création du compte..."
            );

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({
                    email: email,
                    password: password
                });

            signupButton.disabled = false;

            if (error) {

                console.error(
                    "Erreur inscription:",
                    error
                );

                showAuthMessage(
                    error.message
                );

                return;
            }

            if (data.user) {

                showAuthMessage(
                    "Compte créé avec succès.",
                    true
                );

                await createUserProfile(
                    data.user
                );
            }
        }
    );
}


// ==========================================
// LOGIN
// ==========================================

if (loginButton) {

    loginButton.addEventListener(
        "click",
        async () => {

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value.trim();

            if (!email || !password) {

                showAuthMessage(
                    "Veuillez remplir tous les champs."
                );

                return;
            }

            loginButton.disabled = true;

            showAuthMessage(
                "Connexion..."
            );

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            loginButton.disabled = false;

            if (error) {

                console.error(
                    "Erreur connexion:",
                    error
                );

                showAuthMessage(
                    error.message
                );

                return;
            }

            if (data.user) {

                currentUser =
                    data.user;

                showAuthMessage(
                    "Connexion réussie.",
                    true
                );

                await createUserProfile(
                    data.user
                );

                showMessenger();
            }
        }
    );
}


// ==========================================
// CREATE / UPDATE USER PROFILE
// ==========================================

async function createUserProfile(user) {

    if (!user) {
        return;
    }

    const metadata =
        user.user_metadata || {};

    const username =
        metadata.username ||
        user.email
            .split("@")[0];

    const fullName =
        metadata.full_name ||
        username;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    username: username,
                    full_name: fullName
                },
                {
                    onConflict: "id"
                }
            )
            .select()
            .single();

    if (error) {

        console.error(
            "Erreur profil:",
            error
        );

        return null;
    }

    return data;
}


// ==========================================
// CHECK CURRENT USER
// ==========================================

async function checkUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();

    if (error) {

        console.error(
            "Erreur récupération utilisateur:",
            error
        );

        return;
    }

    if (data && data.user) {

        currentUser =
            data.user;

        await createUserProfile(
            currentUser
        );

        showMessenger();

    } else {

        showLogin();
    }
}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    if (authSection) {
        authSection.style.display = "block";
    }

    if (app) {
        app.style.display = "none";
    }

    if (messenger) {
        messenger.style.display = "none";
    }
}


// ==========================================
// SHOW MESSENGER
// ==========================================

function showMessenger() {

    if (authSection) {
        authSection.style.display = "none";
    }

    if (app) {
        app.style.display = "none";
    }

    if (messenger) {
        messenger.style.display = "block";
    }

    if (profileSection) {
        profileSection.style.display = "none";
    }

    setupNavigation();
    showView("statuses");
    loadUsers();

    loadStatuses();

    setupRealtime();
}


// ==========================================
// START BUTTON
// ==========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            if (app) {
                app.style.display = "none";
            }

            if (messenger) {
                messenger.style.display = "block";
            }

            setupNavigation();
            showView("statuses");
            loadUsers();

            loadStatuses();

            setupRealtime();
        }
    );
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                if (realtimeChannel) {

                    await supabaseClient
                        .removeChannel(
                            realtimeChannel
                        );

                    realtimeChannel = null;
                }

                await supabaseClient.auth.signOut();

                currentUser = null;

                selectedUserId = null;

                selectedUserName = "";

                if (messenger) {
                    messenger.style.display = "none";
                }

                if (app) {
                    app.style.display = "none";
                }

                showLogin();

            } catch (error) {

                console.error(
                    "Erreur déconnexion:",
                    error
                );
            }
        }
    );
}


// ==========================================
// PROFILE BUTTON
// ==========================================

if (profileButton) {

    profileButton.addEventListener(
        "click",
        async () => {

            if (!profileSection) {
                return;
            }

            if (
                profileSection.style.display ===
                "none"
            ) {

                profileSection.style.display =
                    "block";

                await loadProfile();

            } else {

                profileSection.style.display =
                    "none";
            }
        }
    );
}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    if (!currentUser) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "username, full_name, avatar_url"
            )
            .eq(
                "id",
                currentUser.id
            )
            .single();

    if (error) {

        console.error(
            "Erreur chargement profil:",
            error
        );

        return;
    }

    if (profileUsername) {

        profileUsername.textContent =
            data.username ||
            "";
    }

    if (profileFullName) {

        profileFullName.textContent =
            data.full_name ||
            "";
    }

    if (profileAvatar) {

        profileAvatar.src =
            data.avatar_url ||
            USER_PLACEHOLDER;
    }
}


// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {

    if (!currentUser || !usersList) {
        return;
    }

    usersList.innerHTML =
        "<p>Chargement des utilisateurs...</p>";

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, username, full_name, avatar_url"
            )
            .neq(
                "id",
                currentUser.id
            )
            .order(
                "full_name",
                {
                    ascending: true
                }
            );

    if (error) {

        console.error(
            "Erreur chargement utilisateurs:",
            error
        );

        usersList.innerHTML =
            "<p>Impossible de charger les utilisateurs.</p>";

        return;
    }

    usersList.innerHTML = "";

    if (!data || data.length === 0) {

        usersList.innerHTML =
            "<p>Aucun autre utilisateur pour le moment.</p>";

        return;
    }

    data.forEach(user => {

        createUserButton(user);
    });
}


// ==========================================
// CREATE USER BUTTON
// ==========================================

function createUserButton(user) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "user-item";

    const avatar =
        user.avatar_url ||
        USER_PLACEHOLDER;

    const name =
        user.full_name ||
        user.username ||
        "Utilisateur";

    button.innerHTML = `
        <img
            src="${escapeHtml(avatar)}"
            alt=""
            class="user-avatar"
            onerror="this.src='${USER_PLACEHOLDER}'"
        >

        <span class="user-info">
            <strong>
                ${escapeHtml(name)}
            </strong>

            <small>
                ${escapeHtml(
                    user.username || ""
                )}
            </small>
        </span>
    `;

    button.addEventListener(
        "click",
        async () => {

            selectedUserId =
                user.id;

            selectedUserName =
                name;

            selectedUserAvatar =
                avatar;

            document
                .querySelectorAll(
                    ".user-item"
                )
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );
                });

            button.classList.add(
                "active"
            );

            showConversationPlaceholder();
            showView("messages");

            await loadMessages();

            if (messageInput) {
                messageInput.focus();
            }
        }
    );

    usersList.appendChild(
        button
    );
}


// ==========================================
// CONVERSATION PLACEHOLDER
// ==========================================

function showConversationPlaceholder() {

    if (!messagesContainer) {
        return;
    }

    if (!selectedUserId) {

        messagesContainer.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">💬</div>
                <strong>
                    Choisir une conversation
                </strong>
                <span>
                    Sélectionnez une conversation pour commencer.
                </span>
            </div>
        `;

        return;
    }

    messagesContainer.innerHTML = `
        <div class="empty-message">
            <div class="empty-icon">💬</div>
            <strong>
                Conversation avec
                ${escapeHtml(selectedUserName)}
            </strong>
            <span>
                Chargement des messages...
            </span>
        </div>
    `;
}


// ==========================================
// LOAD MESSAGES
// ==========================================

async function loadMessages() {

    if (
        !currentUser ||
        !selectedUserId ||
        !messagesContainer
    ) {
        return;
    }

    if (loadingMessages) {
        return;
    }

    loadingMessages = true;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("messages")
            .select("*")
            .or(
                `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUser.id})`
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );

    loadingMessages = false;

    if (error) {

        console.error(
            "Erreur chargement messages:",
            error
        );

        messagesContainer.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">⚠️</div>
                <strong>
                    Impossible de charger les messages
                </strong>
                <span>
                    ${escapeHtml(
                        error.message
                    )}
                </span>
            </div>
        `;

        return;
    }

    messagesContainer.innerHTML = "";

    if (!data || data.length === 0) {

        messagesContainer.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">💬</div>

                <strong>
                    Conversation avec
                    ${escapeHtml(selectedUserName)}
                </strong>

                <span>
                    Aucun message pour le moment.
                    Envoyez votre premier message.
                </span>
            </div>
        `;

        return;
    }

    data.forEach(message => {

        displayMessage(message);
    });

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


// ==========================================
// DISPLAY MESSAGE
// ==========================================

function displayMessage(message) {

    if (!messagesContainer) {
        return;
    }

    const messageElement =
        document.createElement("div");

    const isMine =
        message.sender_id ===
        currentUser.id;

    messageElement.className =
        isMine
            ? "message sent"
            : "message received";

    const text =
        message.content || "";

    const date =
        message.created_at
            ? new Date(
                message.created_at
            ).toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
            : "";

    messageElement.innerHTML = `
        <div class="message-content">
            ${escapeHtml(text)}
        </div>

        <div class="message-time">
            ${escapeHtml(date)}
        </div>
    `;

    messagesContainer.appendChild(
        messageElement
    );
}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    if (
        !currentUser ||
        !selectedUserId ||
        !messageInput
    ) {
        return;
    }

    const content =
        messageInput.value.trim();

    if (!content) {
        return;
    }

    if (sendButton) {
        sendButton.disabled = true;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("messages")
            .insert({
                sender_id:
                    currentUser.id,

                receiver_id:
                    selectedUserId,

                content:
                    content
            })
            .select()
            .single();

    if (error) {

        console.error(
            "Erreur envoi message:",
            error
        );

        alert(
            "Impossible d'envoyer le message : " +
            error.message
        );

        if (sendButton) {
            sendButton.disabled = false;
        }

        return;
    }

    messageInput.value = "";

    if (data) {
        displayMessage(data);
    }

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

    if (sendButton) {
        sendButton.disabled = false;
    }
}


// ==========================================
// SEND BUTTON
// ==========================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );
}


// ==========================================
// ENTER TO SEND
// ==========================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );
}


// ==========================================
// STATUS MEDIA SELECT
// ==========================================

if (statusMediaInput) {

    statusMediaInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            statusMediaFile =
                file;

            showStatusMediaPreview(
                file
            );
        }
    );
}


// ==========================================
// STATUS MEDIA PREVIEW
// ==========================================

function showStatusMediaPreview(file) {

    if (!statusMediaPreview) {
        return;
    }

    const url =
        URL.createObjectURL(file);

    statusMediaPreview.innerHTML = "";

    if (
        file.type.startsWith(
            "image/"
        )
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.src = url;

        image.style.maxWidth =
            "100%";

        image.style.maxHeight =
            "300px";

        image.style.borderRadius =
            "12px";

        statusMediaPreview.appendChild(
            image
        );

    } else if (
        file.type.startsWith(
            "video/"
        )
    ) {

        const video =
            document.createElement(
                "video"
            );

        video.src = url;

        video.controls = true;

        video.style.maxWidth =
            "100%";

        video.style.maxHeight =
            "300px";

        video.style.borderRadius =
            "12px";

        statusMediaPreview.appendChild(
            video
        );
    }

    if (removeStatusMedia) {

        removeStatusMedia.style.display =
            "inline-block";
    }
}


// ==========================================
// REMOVE STATUS MEDIA
// ==========================================

if (removeStatusMedia) {

    removeStatusMedia.addEventListener(
        "click",
        () => {

            statusMediaFile = null;

            if (statusMediaInput) {
                statusMediaInput.value = "";
            }

            if (statusMediaPreview) {
                statusMediaPreview.innerHTML =
                    "";
            }

            removeStatusMedia.style.display =
                "none";
        }
    );
}


// ==========================================
// PUBLISH STATUS
// ==========================================

if (publishStatusButton) {

    publishStatusButton.addEventListener(
        "click",
        publishStatus
    );
}


// ==========================================
// PUBLISH STATUS FUNCTION
// ==========================================

async function publishStatus() {

    if (!currentUser) {
        return;
    }

    const content =
        statusInput
            ? statusInput.value.trim()
            : "";

    if (
        !content &&
        !statusMediaFile
    ) {

        if (statusMessage) {
            statusMessage.textContent =
                "Écrivez quelque chose ou ajoutez une photo/vidéo.";
        }

        return;
    }

    publishStatusButton.disabled =
        true;

    if (statusMessage) {

        statusMessage.textContent =
            "Publication en cours...";
    }

    let mediaUrl = null;

    let mediaType = null;

    // --------------------------------------
    // UPLOAD MEDIA
    // --------------------------------------

    if (statusMediaFile) {

        const extension =
            statusMediaFile.name
                .split(".")
                .pop();

        const fileName =
            `${currentUser.id}/${Date.now()}.${extension}`;

        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("status-media")
                .upload(
                    fileName,
                    statusMediaFile,
                    {
                        upsert: false
                    }
                );

        if (uploadError) {

            console.error(
                "Erreur upload statut:",
                uploadError
            );

            if (statusMessage) {
                statusMessage.textContent =
                    "Erreur lors de l'envoi du fichier.";
            }

            publishStatusButton.disabled =
                false;

            return;
        }

        const {
            data: publicData
        } =
            supabaseClient
                .storage
                .from("status-media")
                .getPublicUrl(
                    fileName
                );

        mediaUrl =
            publicData.publicUrl;

        mediaType =
            statusMediaFile.type;
    }

    // --------------------------------------
    // INSERT STATUS
    // --------------------------------------

    const {
        data,
        error
    } =
        await supabaseClient
            .from("statuses")
            .insert({
                user_id:
                    currentUser.id,

                content:
                    content || null,

                media_url:
                    mediaUrl,

                media_type:
                    mediaType
            })
            .select()
            .single();

    if (error) {

        console.error(
            "Erreur publication statut:",
            error
        );

        if (statusMessage) {
            statusMessage.textContent =
                "Impossible de publier le statut.";
        }

        publishStatusButton.disabled =
            false;

        return;
    }

    console.log(
        "Statut publié:",
        data
    );

    if (statusInput) {
        statusInput.value = "";
    }

    statusMediaFile = null;

    if (statusMediaInput) {
        statusMediaInput.value = "";
    }

    if (statusMediaPreview) {
        statusMediaPreview.innerHTML =
            "";
    }

    if (removeStatusMedia) {
        removeStatusMedia.style.display =
            "none";
    }

    if (statusMessage) {

        statusMessage.textContent =
            "Statut publié avec succès.";
    }

    publishStatusButton.disabled =
        false;

    await loadStatuses();
}


// ==========================================
// LOAD STATUSES
// ==========================================

async function loadStatuses() {

    if (!statusesContainer) {
        return;
    }

    statusesContainer.innerHTML =
        "<p>Chargement des statuts...</p>";

    const {
        data,
        error
    } =
        await supabaseClient
            .from("statuses")
            .select(`
                id,
                user_id,
                content,
                media_url,
                media_type,
                created_at,
                profiles (
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(
            "Erreur chargement statuts:",
            error
        );

        statusesContainer.innerHTML =
            "<p>Impossible de charger les statuts.</p>";

        return;
    }

    statusesContainer.innerHTML = "";

    if (!data || data.length === 0) {

        statusesContainer.innerHTML =
            "<p>Aucun statut pour le moment.</p>";

        return;
    }

    data.forEach(status => {

        displayStatus(status);
    });
}


// ==========================================
// DISPLAY STATUS
// ==========================================

function displayStatus(status) {

    if (!statusesContainer) {
        return;
    }

    const profile =
        status.profiles || {};

    const name =
        profile.full_name ||
        profile.username ||
        "Utilisateur";

    const avatar =
        profile.avatar_url ||
        STATUS_PLACEHOLDER;

    const statusElement =
        document.createElement("article");

    statusElement.className =
        "status-card";

    let mediaHtml = "";

    if (
        status.media_url &&
        status.media_type &&
        status.media_type.startsWith(
            "image/"
        )
    ) {

        mediaHtml = `
            <img
                src="${escapeHtml(
                    status.media_url
                )}"
                alt="Statut"
                class="status-media"
            >
        `;

    } else if (
        status.media_url &&
        status.media_type &&
        status.media_type.startsWith(
            "video/"
        )
    ) {

        mediaHtml = `
            <video
                src="${escapeHtml(
                    status.media_url
                )}"
                controls
                class="status-media"
            ></video>
        `;
    }

    const date =
        status.created_at
            ? new Date(
                status.created_at
            ).toLocaleString()
            : "";

    statusElement.innerHTML = `
        <div class="status-header">

            <img
                src="${escapeHtml(avatar)}"
                alt=""
                class="status-avatar"
                onerror="this.src='${STATUS_PLACEHOLDER}'"
            >

            <div>
                <strong>
                    ${escapeHtml(name)}
                </strong>

                <small>
                    ${escapeHtml(date)}
                </small>
            </div>

        </div>

        ${
            status.content
                ? `
                    <div class="status-content">
                        ${escapeHtml(
                            status.content
                        )}
                    </div>
                `
                : ""
        }

        ${mediaHtml}
    `;

    statusesContainer.appendChild(
        statusElement
    );
}




// ==========================================
// NAVIGATION: STATUTS / CONTACTS / MESSAGES
// ==========================================
let currentView = "statuses";

function setupNavigation() {
    if (!messenger || document.getElementById("messenj-nav")) return;

    const nav = document.createElement("nav");
    nav.id = "messenj-nav";
    nav.setAttribute("aria-label", "Navigation principale");
    nav.innerHTML = `
        <button type="button" class="messenj-nav-button active" data-view="statuses">📸 Statuts</button>
        <button type="button" class="messenj-nav-button" data-view="contacts">👥 Contacts</button>
        <button type="button" class="messenj-nav-button" data-view="messages">💬 Messages</button>
    `;

    const firstSection = document.getElementById("status-section");
    if (firstSection) firstSection.parentNode.insertBefore(nav, firstSection);
    else messenger.insertBefore(nav, messenger.firstChild);

    const style = document.createElement("style");
    style.id = "messenj-nav-style";
    style.textContent = `
      #messenj-nav { display:flex; gap:8px; padding:12px; margin:0 0 14px; background:#fff; border-radius:12px; position:sticky; top:0; z-index:10; box-shadow:0 2px 10px rgba(0,0,0,.06); }
      #messenj-nav .messenj-nav-button { flex:1; border:0; border-radius:9px; padding:12px 8px; cursor:pointer; background:#f1f5f9; color:#334155; font-weight:600; }
      #messenj-nav .messenj-nav-button.active { background:#2563eb; color:white; }
      @media (max-width:480px) { #messenj-nav { gap:5px; padding:8px; } #messenj-nav .messenj-nav-button { padding:10px 4px; font-size:13px; } }
    `;
    document.head.appendChild(style);

    nav.querySelectorAll("[data-view]").forEach(button => {
        button.addEventListener("click", () => showView(button.dataset.view));
    });
    showView(currentView);
}

function showView(view) {
    currentView = view;
    const statusSection = document.getElementById("status-section");
    const usersSection = document.getElementById("users-section");
    const messagesSection = document.getElementById("messages");
    const messageForm = document.querySelector(".message-form");

    if (statusSection) statusSection.style.display = view === "statuses" ? "block" : "none";
    if (usersSection) usersSection.style.display = view === "contacts" ? "block" : (view === "messages" && selectedUserId ? "none" : "none");
    if (messagesSection) messagesSection.style.display = view === "messages" ? "block" : "none";
    if (messageForm) messageForm.style.display = view === "messages" ? "flex" : "none";

    document.querySelectorAll("#messenj-nav [data-view]").forEach(button => {
        const active = button.dataset.view === view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-current", active ? "page" : "false");
    });
}


// ==========================================
// REALTIME
// ==========================================

function setupRealtime() {

    if (realtimeChannel) {

        supabaseClient
            .removeChannel(
                realtimeChannel
            );

        realtimeChannel = null;
    }

    realtimeChannel =
        supabaseClient
            .channel(
                "messages-realtime"
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "messages"
                },
                payload => {

                    console.log(
                        "Nouveau changement message:",
                        payload
                    );

                    if (
                        !currentUser ||
                        !selectedUserId
                    ) {
                        return;
                    }

                    const message =
                        payload.new ||
                        payload.old;

                    if (!message) {
                        return;
                    }

                    if (
                        message.sender_id ===
                            currentUser.id ||
                        message.receiver_id ===
                            currentUser.id
                    ) {

                        loadMessages();
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "statuses"
                },
                payload => {

                    console.log(
                        "Nouveau changement statut:",
                        payload
                    );

                    loadStatuses();
                }
            )
            .subscribe(
                status => {

                    console.log(
                        "Realtime messages:",
                        status
                    );

                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        console.log(
                            "Realtime connecté avec succès."
                        );
                    }

                    if (
                        status ===
                        "CHANNEL_ERROR"
                    ) {

                        console.error(
                            "Erreur du canal Realtime."
                        );
                    }

                    if (
                        status ===
                        "TIMED_OUT"
                    ) {

                        console.error(
                            "Realtime a dépassé le délai."
                        );
                    }
                }
            );
}


// ==========================================
// AUTH STATE
// ==========================================

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        console.log(
            "Auth event:",
            event
        );

        if (
            session &&
            session.user
        ) {

            currentUser =
                session.user;

            await createUserProfile(
                currentUser
            );

        } else {

            currentUser = null;
        }
    }
);


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "MessenJ démarré."
        );

        checkUser();
    }
);
