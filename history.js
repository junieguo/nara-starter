document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("history-container");
  
    chrome.storage.local.get(["history", "mood"], (result) => {
        const history = result.history;
        const moods = result.mood;
        if (!history || Object.keys(history).length === 0) {
            container.textContent = "No history found.";
            return;
        }
        
      
        Object.entries(history).forEach(([date, tasks]) => {
          const section = document.createElement("div");
          section.className = "history-entry";
      
          const dateHeader = document.createElement("h3");
          dateHeader.textContent = formatDate(date);
      
          if (moods[date]) {
            const moodEmoji = {
              happy: "😊",
              neutral: "😐",
              stressed: "😣"
            }[moods[date]] || "🙂";
      
            dateHeader.innerHTML += ` <span style="font-size: 1.4rem;">${moodEmoji}</span>`;
          }
          section.appendChild(dateHeader);
  
        const list = document.createElement("ul");
        list.className = "history-task-list";
  
        tasks.forEach((task) => {
          const item = document.createElement("li");
          item.textContent = task.text;
          list.appendChild(item);
        });
  
        section.appendChild(list);
        container.appendChild(section);
    
      });
    });
  
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  });
  