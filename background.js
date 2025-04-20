// Set up the daily reset alarm at 12:00 a.m.
chrome.runtime.onInstalled.addListener(() => {
  setMidnightAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  setMidnightAlarm();
});

// Handle alarms for resetting state
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyReset") {
    // Retrieve the current state and history from storage
    chrome.storage.local.get(["state", "history"], (result) => {
      const { state, history } = result;

      // Initialize history if it doesn't exist
      const updatedHistory = history || {};

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Extract completed tasks from the state
      const completedTasks = state?.tasks?.filter(task => task.completed) || [];

      // Add completed tasks to today's history
      updatedHistory[today] = completedTasks;

      // Save the updated history back to storage
      chrome.storage.local.set({ history: updatedHistory }, () => {
        console.log("History updated with completed tasks for", today);
      });

      // Reset the state
      chrome.storage.local.set({ state: null }, () => {
        console.log("State reset at 12:00 a.m.");
      });

      // Reset the alarm for the next day
      setMidnightAlarm();
    });
  }
});

// Function to set an alarm for 12:00 a.m.
function setMidnightAlarm() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeUntilMidnight = (midnight - now) / (1000 * 60);
  chrome.alarms.create("dailyReset", { delayInMinutes: timeUntilMidnight });
}

// Handle messages from newTab.js for generating subtasks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateSubtasks") {
    // Call GPT wrapper
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer API_TOKEN", // tbu
      },
      body: JSON.stringify({
        prompt: `Break down the task "${message.task}" into 5 subtasks.`,
        max_tokens: 100,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const subtasks = data.choices[0].text
          .trim()
          .split("\n")
          .filter(Boolean);
        chrome.runtime.sendMessage({ action: "updateSubtasks", subtasks });
      })
      .catch((error) => {
        console.error("Error generating subtasks:", error);
      });
    return true; // Keep the message channel open for async response
  }
});
