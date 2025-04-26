function toggleTheme() {
	const body = document.body
	const container = document.querySelector(".container")
	const isDark = body.classList.toggle("dark-mode")
	if (isDark) {
		body.style.background = "linear-gradient(135deg, #1a1a2e, #16213e)"
		body.style.color = "#fff"
		// Ne plus modifier la couleur des numéros des jours (on garde en noir)
		if (container) container.style.background = "#292a3e"
	} else {
		body.style.background = "#f3f0ff"
		body.style.color = "#222"
		// Ne plus modifier la couleur des numéros des jours (on garde en noir)
		if (container) container.style.background = "#ffffff"
	}
}

function toggleStars() {
	const stars = document.getElementById("stars")
	const btn = document.getElementById("toggleStarsBtn")
	const isVisible = stars.style.display !== "none"

	if (isVisible) {
		stars.style.display = "none"
		localStorage.setItem("starsVisible", "false")
		btn.textContent = "✨ Activer les étoiles"
	} else {
		stars.style.display = "block"
		localStorage.setItem("starsVisible", "true")
		btn.textContent = "❌ Désactiver les étoiles"
	}
}

function checkSecretWord() {
	const input = document.getElementById("secretInput").value.trim().toLowerCase()
	const correct = document.getElementById("secretHint").getAttribute("data-secret")
	let tries = parseInt(localStorage.getItem("triesLeft") ?? "3")
	if (input == correct) {
		openModal("magicModal")
		document.getElementById("secretInput").disabled = true
	} else {
		tries--
		localStorage.setItem("triesLeft", tries)
		if (tries <= 0) {
			document.getElementById("secretInput").disabled = true
			alert("😢 Tu as utilisé tous tes essais pour aujourd’hui.")
		} else {
			alert(`❌ Mauvais mot. Il te reste ${tries} essais aujourd’hui.`)
		}
	}
}

// 🔒 Mot magique à deviner
const magicWord = "magic"
document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("secretHint").setAttribute("data-secret", magicWord)
})

let editUnlocked = false
let failedAttempts = 0
let lockoutUntil = null
let currentDate = new Date()
let selectedDay = null

function getKey(year, month) {
	return `${year}-${month + 1}`
}

let unsubscribe = null

function listenToData(key) {
	const ref = db.collection("plannings").doc(key)
	if (unsubscribe) unsubscribe() // Arrêter l’écoute précédente
	unsubscribe = ref.onSnapshot((doc) => {
		const data = doc.exists ? doc.data() : {}
		createCalendar(currentDate, data)
	})
}

async function saveData(key, data) {
	const ref = db.collection("plannings").doc(key)
	await ref.set(data)
}
async function getDataOnce(key) {
	const ref = db.collection("plannings").doc(key)
	const snap = await ref.get()
	return snap.exists ? snap.data() : {}
}

async function deleteDay() {
	const key = getKey(currentDate.getFullYear(), currentDate.getMonth())
	const ref = db.collection("plannings").doc(key)
	await ref.update({ [selectedDay]: firebase.firestore.FieldValue.delete() })
	closeModal("editModal")
	createCalendar(currentDate)
}

async function saveEdit() {
	if (selectedDay == null) return
	const title = document.getElementById("title").value.trim()
	const type = document.getElementById("type").value
	const hour = document.getElementById("hour").value
	const key = getKey(currentDate.getFullYear(), currentDate.getMonth())
	const data = await getDataOnce(key)

	data[selectedDay] = { title, type, hour }
	await saveData(key, data)
	closeModal("editModal")
	createCalendar(currentDate)
}

function createCalendar(date, data = null) {
	const year = date.getFullYear()
	const month = date.getMonth()
	const firstDay = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const today = new Date()
	if (!data) return // On attend que le listener fournisse les données
	const container = document.getElementById("calendar-days")

	container.innerHTML = ""
	document.getElementById("month-year").textContent = `✨ Calendrier des Streams leatvlive.tv – ${["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"][month]} ${year}`

	for (let i = 1; i < (firstDay == 0 ? 7 : firstDay); i++) {
		const empty = document.createElement("div")
		empty.className = "day empty"
		container.appendChild(empty)
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const div = document.createElement("div")
		div.className = "day"
		div.dataset.day = day
		div.innerHTML = `<strong style='color: inherit;'>${day}</strong>`

		if (day == today.getDate() && month == today.getMonth() && year == today.getFullYear()) {
			div.classList.add("today")
		}

		if (data[day.toString()]) {
			const d = data[day.toString()]
			const info = document.createElement("div")
			info.className = `stream-info ${d.type}`
			const title = d.title?.trim()
			const hour = d.hour || ""
			const type = d.type || "Off"
			if (type == "Off") {
				info.innerHTML = `<small>Jour Off</small>`
				div.style.opacity = 0.5
			} else {
				info.innerHTML = `${title ? title + "<br>" : ""}<small>${type}${hour ? ` à ${hour}` : ""}</small>`
			}
			div.appendChild(info)
		}

		div.onclick = () => {
			if (!editUnlocked) return
			selectedDay = day
			openModal("editModal")
			const d = data[day.toString()] || {}
			document.getElementById("title").value = d.title || ""
			document.getElementById("type").value = d.type || "Minecraft"
			document.getElementById("hour").value = d.hour || "20h00"
		}

		container.appendChild(div)
	}
}

function changeMonth(delta) {
	currentDate.setMonth(currentDate.getMonth() + delta)
	listenToData(getKey(currentDate.getFullYear(), currentDate.getMonth()))
}

function handleAuth() {
	// Si l'utilisateur est déjà connecté
	if (editUnlocked) {
		// Demander confirmation
		const confirmLogout = confirm("🔐 Tu es déjà connectée.\nSouhaites-tu te déconnecter ?")
		if (confirmLogout) {
			editUnlocked = false
			window.connectedUser = null
			document.getElementById("authBtn").textContent = "🔒 Modifier le planning"

			const adminBtn = document.getElementById("adminBtn")
			if (adminBtn) adminBtn.style.display = "none"

			alert("🌙 Tu es maintenant déconnectée du planning magique. À bientôt Léa !")

			// 🔁 Enregistrer la déconnexion dans l’historique
			const logEntry = {
				user: "Déconnexion",
				role: "-",
				date: new Date().toLocaleDateString("fr-FR"),
				time: new Date().toLocaleTimeString("fr-FR"),
				changes: "Utilisateur déconnecté",
			}
			db.collection("settings")
				.doc("history")
				.collection("logs")
				.add(logEntry)
				.then(() => {
					loadAdminLogs()
				})
		}
	} else {
		// Sinon, ouvrir le popup login
		document.getElementById("authTitle").textContent = "Connexion"
		openModal("loginModal")
	}
}

function validateLogin() {
	const user = document.getElementById("loginUser").value.trim()
	const pass = document.getElementById("loginPass").value.trim()

  // recupér l'utilisateur selectionné depuis users.js
  let selectedUser = users.find((u) => u.username == user)

	if (selectedUser && selectedUser.password == CryptoJS.SHA256(pass).toString()) {
		const role = selectedUser.role
		window.connectedUser = { name: user, role }

		// Changer bouton admin en fonction du rôle
		const adminBtn = document.getElementById("adminBtn")
		if (adminBtn) {
			adminBtn.style.display = role == "admin" || role == "leatv" ? "inline-block" : "none"
		}

		closeModal("loginModal")
		editUnlocked = true
		document.getElementById("authBtn").textContent = "🚪 Déconnexion"

		alert("🔓 Accès débloqué !")
		failedAttempts = 0
	} else {
		failedAttempts++
		if (failedAttempts >= 3) {
			lockoutUntil = Date.now() + 10 * 60 * 1000
			alert("Trop de tentatives ! Réessaie dans 10 minutes.")
			closeModal("loginModal")
		} else {
			alert("Identifiants incorrects !")
		}
	}
}

function openModal(id) {
	document.getElementById(id).style.display = "flex"
}

function closeModal(id) {
	document.getElementById(id).style.display = "none"
}

window.addEventListener("DOMContentLoaded", () => {
	createStars() // 🌟 ajouté correctement
	// 🌟 Appliquer le réglage étoiles
	let starsMode = "auto" // par défaut

	db.collection("settings")
		.doc("global")
		.get()
		.then((doc) => {
			if (doc.exists) {
				const settings = doc.data()
				starsMode = settings.starsMode || "auto"

				// 🌟 Application du forçage étoile
				const stars = document.getElementById("stars")
				if (stars) {
					if (starsMode == "off") {
						stars.style.display = "none"
					} else if (starsMode == "on") {
						stars.style.display = "block"
					} else {
						// mode auto → on applique localStorage
						const starsVisible = localStorage.getItem("starsVisible") !== "false"
						stars.style.display = starsVisible ? "block" : "none"
						const btn = document.getElementById("toggleStarsBtn")
						if (btn) {
							btn.textContent = starsVisible ? "❌ Désactiver les étoiles" : "✨ Activer les étoiles"
						}
					}
				}
				const warning = document.getElementById("starsLockedMsg")
				if (warning) {
					warning.style.display = starsMode == "on" || starsMode == "off" ? "block" : "none"
				}
				const btn = document.getElementById("toggleStarsBtn")
				if (btn) {
					if (starsMode == "on" || starsMode == "off") {
						btn.disabled = true
						btn.style.opacity = "0.5"
						btn.title = "Option désactivée par l'admin"
					} else {
						btn.disabled = false
						btn.style.opacity = "1"
						btn.title = ""
					}
				}
				// reste inchangé...
				const sm = document.getElementById("adminStarsMode")
				if (sm) sm.value = starsMode

				const mw = document.getElementById("adminMagicWord")
				if (mw) mw.value = settings.magicWord || ""
				document.getElementById("secretHint").setAttribute("data-secret", settings.magicWord || "magic")

				const popupMsg = settings.popupMessage || "Tu as découvert le mot magique ✨<br>Une pluie d’étoiles t’accompagne !"
				const pm = document.getElementById("adminPopupMessage")
				if (pm) pm.value = popupMsg
				const magicModal = document.querySelector("#magicModal p")
				if (magicModal) magicModal.innerHTML = popupMsg
			}
		})
	// Chargement de l'historique admin
	const logContainer = document.getElementById("adminLogContainer")
	if (logContainer) {
		db.collection("settings")
			.doc("history")
			.collection("logs")
			.orderBy("date", "desc")
			.limit(50)
			.get()
			.then((snapshot) => {
				logContainer.innerHTML = ""
				snapshot.forEach((doc) => {
					const l = doc.data()
					const item = document.createElement("p")
					item.innerHTML = `📅 ${l.date} ${l.time} – <strong>${l.user}</strong> (${l.role}) ➜ ${l.changes}`
					logContainer.appendChild(item)
				})
			})
			.catch(() => {
				logContainer.innerHTML = "<p>❌ Erreur lors du chargement de l'historique.</p>"
			})
	}
	function loadAdminLogs() {
		const logContainer = document.getElementById("adminLogContainer")
		if (logContainer) {
			db.collection("settings")
				.doc("history")
				.collection("logs")
				.orderBy("date", "desc")
				.limit(50)
				.get()
				.then((snapshot) => {
					logContainer.innerHTML = ""
					snapshot.forEach((doc) => {
						const l = doc.data()
						const item = document.createElement("p")
						item.innerHTML = `📅 ${l.date} ${l.time} – <strong>${l.user}</strong> (${l.role}) ➜ ${l.changes}`
						logContainer.appendChild(item)
					})
				})
				.catch(() => {
					logContainer.innerHTML = "<p>❌ Erreur lors du chargement de l'historique.</p>"
				})
		}
	}

	// ... tout ton code de chargement (stars, admin, mot magique, etc.)

	// 🔐 Bloc mot magique
	const triesLeft = localStorage.getItem("triesLeft") ?? 3
	if (triesLeft == "0") {
		document.getElementById("secretInput").disabled = true
	}

	// 📆 Création / Écoute calendrier
	if (typeof db !== "undefined") {
		listenToData(getKey(currentDate.getFullYear(), currentDate.getMonth()))
	} else {
		console.error("Firebase n'est pas chargé correctement.")
	}
})

function createStars() {
	const starsContainer = document.getElementById("stars")
	if (!starsContainer) return

	starsContainer.style.display = "block" // ← ✅ ici !

	for (let i = 0; i < 60; i++) {
		const star = document.createElement("div")
		star.className = "star"
		star.style.top = Math.random() * 100 + "%"
		star.style.left = Math.random() * 100 + "%"
		star.style.animationDelay = Math.random() * 3 + "s"
		star.style.animationDuration = 1 + Math.random() * 2 + "s"
		starsContainer.appendChild(star)
	}
}

// 🎁 Surprise cachée : tape "magic" dans la console
window.addEventListener("keydown", (e) => {
	window.__secret = (window.__secret || "") + e.key
	if (window.__secret.endsWith("magic")) {
		alert("✨ Une surprise magique apparaît !")
		const surprise = document.createElement("div")
		surprise.textContent = "🌈 Tu as trouvé l'étoile secrète !"
		surprise.style.position = "fixed"
		surprise.style.bottom = "20px"
		surprise.style.right = "20px"
		surprise.style.padding = "10px 20px"
		surprise.style.background = "#ff69b4"
		surprise.style.color = "#fff"
		surprise.style.borderRadius = "12px"
		surprise.style.boxShadow = "0 0 15px rgba(255, 105, 180, 0.5)"
		surprise.style.zIndex = "1001"
		document.body.appendChild(surprise)
		setTimeout(() => surprise.remove(), 6000)
		window.__secret = ""
	}
})

function switchAdminTab(id) {
	const tabs = document.querySelectorAll(".admin-tab")
	tabs.forEach((tab) => (tab.style.display = "none"))

	const buttons = ["tabMagicBtn", "tabSettingsBtn", "tabLogBtn"]
	buttons.forEach((btn) => {
		const b = document.getElementById(btn)
		if (b) b.classList.remove("active-admin-tab")
	})

	document.getElementById(id).style.display = "block"
	const activeBtn = document.getElementById(id + "Btn")
	if (activeBtn) activeBtn.classList.add("active-admin-tab")
}

function saveAdminSettings() {
	const settings = {
		magicWord: document.getElementById("adminMagicWord")?.value.trim().toLowerCase() || "magic",
		starsMode: document.getElementById("adminStarsMode")?.value || "auto",
		popupMessage: document.getElementById("adminPopupMessage")?.value.trim() || "Tu as découvert le mot magique ✨",
	}

	db.collection("settings")
		.doc("global")
		.set(settings)
		.then(() => {
			alert("✅ Paramètres enregistrés pour tous !")
			closeModal("parametreAdmin")

			const logEntry = {
				user: window.connectedUser?.name || "inconnu",
				role: window.connectedUser?.role || "non défini",
				date: new Date().toLocaleDateString("fr-FR"),
				time: new Date().toLocaleTimeString("fr-FR"),
				changes: Object.keys(settings).join(", "),
			}

			db.collection("settings")
				.doc("history")
				.collection("logs")
				.add(logEntry)
				.then(() => {
					loadAdminLogs()
				})
		})
		.catch((error) => {
			console.error("❌ Erreur :", error)
			alert("❌ Erreur lors de l'enregistrement.")
		})
} 