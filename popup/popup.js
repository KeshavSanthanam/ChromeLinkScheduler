document.addEventListener("DOMContentLoaded", async () => {
	const datetimeInput = document.getElementById("datetime");
	const actionInput = document.getElementById("action");
	const scheduleBtn = document.getElementById("schedule");
	const list = document.getElementById("scheduledList");


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
			renderList();
		} else {
			alert("Time must be in the future.");
		}
	};


	async function renderList() {
		const { entries } = await chrome.storage.local.get({ entries: [] });
		list.innerHTML = "";
		for (const e of entries) {
			const li = document.createElement("li");
			li.textContent = `${e.type.toUpperCase()}: ${e.url} at ${e.time}`;
			list.appendChild(li);
		}
	}


	renderList();
});