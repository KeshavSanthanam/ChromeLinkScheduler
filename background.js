chrome.alarms.onAlarm.addListener(async (alarm) => {
	const data = JSON.parse(alarm.name);


	if (data.type === 'open') {
		chrome.tabs.create({ url: data.url });
	} else if (data.type === 'reminder') {
		chrome.notifications.create({
			type: 'basic',
			iconUrl: 'icons/icon128.png',
			title: 'Link Reminder',
			message: `Reminder: ${data.url}`,
			priority: 1
		});
	}


	const { entries = [], history = [] } = await chrome.storage.local.get(["entries", "history"]);
	const index = entries.findIndex(e => e.url === data.url && e.type === data.type);
	if (index !== -1) {
		const [completed] = entries.splice(index, 1);
		history.push(completed);
		await chrome.storage.local.set({ entries, history });
	}
});