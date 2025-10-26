chrome.alarms.onAlarm.addListener(async (alarm) => {
	const data = JSON.parse(alarm.name); // Contains { url, type }
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
});