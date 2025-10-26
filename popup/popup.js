document.addEventListener("DOMContentLoaded", async () => {
	const datetimeInput = document.getElementById("datetime");
	const actionInput = document.getElementById("action");
	const scheduleBtn = document.getElementById("schedule");
	const list = document.getElementById("scheduledList");
	const historyList = document.getElementById("historyList");
	const clearBtn = document.getElementById("clearHistory");


	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });


	scheduleBtn.onclick = async () => {
		const datetime = new Date(datetimeInput.value);
		const when = datetime.getTime();
		const now = Date.now();
		const minutesUntil = (when - now) / 60000;
		const id = JSON.stringify({ url: tab.url, type: actionInput.value });


		if (minutesUntil > 0) {
			chrome.alarms.create(id, { when });
			const entries = (await chrome.storage.local.get({ entries: [] })).entries;
			entries.push({ url: tab.url, time: datetime.toString(), type: actionInput.value });
			await chrome.storage.local.set({ entries });
			renderLists();
		} else {
			alert("Time must be in the future.");
		}
	};


	clearBtn.onclick = async () => {
		await chrome.storage.local.set({ history: [] });
		renderLists();
	};


	async function renderLists() {
		const { entries, history } = await chrome.storage.local.get({ entries: [], history: [] });


		list.innerHTML = "";
		for (const e of entries) {
			const li = document.createElement("li");
			li.textContent = `${e.type.toUpperCase()}: ${e.url} at ${e.time}`;
			list.appendChild(li);
		}


		historyList.innerHTML = "";
		for (const h of history) {
			const li = document.createElement("li");
			li.textContent = `${h.type.toUpperCase()}: ${h.url} at ${h.time}`;
			historyList.appendChild(li);
		}
	}


	renderLists();
});