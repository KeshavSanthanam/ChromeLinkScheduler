document.addEventListener("DOMContentLoaded", async () => {
	const datetimeInput = document.getElementById("datetime");
	const actionInput = document.getElementById("action");
	const scheduleBtn = document.getElementById("schedule");
	const list = document.getElementById("scheduledList");
	const historyList = document.getElementById("historyList");
	const clearBtn = document.getElementById("clearHistory");
	const exportBtn = document.getElementById("exportHistory");

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

	exportBtn.onclick = async () => {
		const { history } = await chrome.storage.local.get({ history: [] });
		const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'link_scheduler_history.json';
		a.click();
		URL.revokeObjectURL(url);
	};

	async function removeEntry(index) {
		const { entries } = await chrome.storage.local.get({ entries: [] });
		const entry = entries[index];
		const alarmId = JSON.stringify({ url: entry.url, type: entry.type });
		entries.splice(index, 1);
		await chrome.alarms.clear(alarmId);
		await chrome.storage.local.set({ entries });
		renderLists();
	}

	async function cleanupPastEntries() {
		const now = Date.now();
		const { entries = [], history = [] } = await chrome.storage.local.get(["entries", "history"]);
		const remaining = [];
		for (const e of entries) {
			const time = new Date(e.time).getTime();
			if (time <= now) {
				history.push(e);
				const alarmId = JSON.stringify({ url: e.url, type: e.type });
				await chrome.alarms.clear(alarmId);
			} else {
				remaining.push(e);
			}
		}
		await chrome.storage.local.set({ entries: remaining, history });
	}

	async function renderLists() {
		await cleanupPastEntries();
		const { entries, history } = await chrome.storage.local.get({ entries: [], history: [] });

		list.innerHTML = "";
		entries.forEach((e, i) => {
			const li = document.createElement("li");
			li.innerHTML = `${e.type.toUpperCase()}: ${e.url} at ${e.time} <span class='remove' data-index='${i}'><strong>X</strong></span>`;
			list.appendChild(li);
		});

		document.querySelectorAll('.remove').forEach(btn => {
			btn.addEventListener('click', async (e) => {
				const index = parseInt(e.target.closest('span').getAttribute('data-index'));
				await removeEntry(index);
			});
		});

		historyList.innerHTML = "";
		for (const h of history) {
			const li = document.createElement("li");
			li.textContent = `${h.type.toUpperCase()}: ${h.url} at ${h.time}`;
			historyList.appendChild(li);
		}
	}

	renderLists();
});
