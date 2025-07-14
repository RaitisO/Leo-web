function getWeekDates(baseDate = new Date()) {
  const date = new Date(baseDate);
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(date.setDate(diff));
  const week = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    week.push(current);
  }
  return week;
}

function renderWeek(baseDate = new Date()) {
  const grid = document.getElementById("calendar-grid");
  const times = document.querySelectorAll("#calendar-times")[1]; // 2nd one is for grid
  const label = document.getElementById("month-year-label");
  const dayLabels = document.getElementById("calendar-day-labels");

  grid.innerHTML = "";
  times.innerHTML = "";
  dayLabels.innerHTML="";
  

  const week = getWeekDates(baseDate);

  // Month label (June–July 2025)
  const months = new Set(week.map(d => d.toLocaleString('default', { month: 'long' })));
  const year = week[0].getFullYear();
  const monthLabel = [...months].join("–") + " " + year;
  label.textContent = monthLabel;

  // Add day labels (Mon 17, Tue 18...)
    week.forEach(date => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    const div = document.createElement("div");
    div.className = "calendar-day-label";
    div.textContent = `${dayName} ${dayNum}`;
    dayLabels.appendChild(div);
  });

  // Add time labels (08:00–20:00)
  for (let hour = startHour; hour <= endHour; hour++) {
    const timeLabel = document.createElement("div");
    timeLabel.textContent = `${String(hour).padStart(2, '0')}:00`;
    times.appendChild(timeLabel);
  }

  // Add empty grid slots (7 days × N hours)
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let day = 0; day < 7; day++) {
      const slot = document.createElement("div");
      slot.className = "calendar-slot";
      slot.dataset.day = day;
      slot.dataset.hour = hour;
      grid.appendChild(slot);
    }
  }
const pathParts = window.location.pathname.split('/');
const role = pathParts[2]; // /dashboard/role/name → role is at index 2

if (role === 'admin') {
  document.querySelectorAll('.calendar-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const day = parseInt(slot.dataset.day);
      const hour = parseInt(slot.dataset.hour);
      openSlotPopup(day, hour);
    });
  });
}


  return week[0]; // return Monday of the week
}
function addTimeSlotToCalendar(lesson) {
    const { start_time, end_time, student_name, lesson_topic } = lesson;

    // Parse datetime strings into JS Date objects
    const start = new Date(start_time);
    const end = new Date(end_time);

    // Format: e.g., "2025-07-15" (for column lookup)
    const dateStr = start.toISOString().split('T')[0];

    // Time in HH:MM format (for row lookup)
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    // Find the column (day)
    const column = document.querySelector(`[data-date="${dateStr}"]`);
    if (!column) {
        console.warn("Date column not found:", dateStr);
        return;
    }

    // Calculate the time range (e.g., 12:00 to 14:00)
    const startIndex = timeToRowIndex(startTimeStr);
    const endIndex = timeToRowIndex(endTimeStr);

    if (startIndex === null || endIndex === null) {
        console.warn("Invalid time range:", startTimeStr, endTimeStr);
        return;
    }

    // Create a new slot div
    const slot = document.createElement("div");
    slot.className = "calendar-slot";
    slot.style.gridRow = `${startIndex + 1} / ${endIndex + 1}`;
    slot.style.gridColumn = column.dataset.columnIndex; // assume this is set
    slot.innerHTML = `
        <strong>${student_name}</strong><br>
        <small>${lesson_topic}</small>
    `;

    // Append to calendar grid
    const calendarGrid = document.getElementById("calendar-grid");
    calendarGrid.appendChild(slot);
}
function timeToRowIndex(timeStr) {
    // e.g., "12:00" → 12
    const [hour, minutes] = timeStr.split(":").map(Number);

    // If your calendar starts at 08:00 and each row is 30 minutes:
    const baseHour = 8;
    const intervalMinutes = 30;

    const totalMinutes = (hour - baseHour) * 60 + minutes;

    if (totalMinutes < 0) return null;

    return Math.floor(totalMinutes / intervalMinutes);
}

function openSlotPopup(day, hour) {
  const popup = document.getElementById("slot-popup");

  const baseMonday = getWeekDates(currentBaseDate)[0];
  const selectedDate = new Date(baseMonday);
  selectedDate.setDate(baseMonday.getDate() + day);
  selectedDate.setHours(hour, 0, 0, 0);

  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = selectedDate.getDate();
  const month = selectedDate.toLocaleString("default", { month: "long" });
  const year = selectedDate.getFullYear();

  document.getElementById("popup-date").textContent = `${dayName} ${dayNum}. ${month} ${year}`;

  const startTimeStr = selectedDate.toTimeString().slice(0, 5);
  const endDate = new Date(selectedDate);
  endDate.setHours(hour + 1, 0, 0, 0);
  const endTimeStr = endDate.toTimeString().slice(0, 5);

  document.getElementById("start-time").value = startTimeStr;
  document.getElementById("end-time").value = endTimeStr;

  // Optional: clear old inputs
 

  popup.style.display = "flex";
}


let currentBaseDate = new Date();

document.addEventListener("DOMContentLoaded", () => {
  renderWeek(currentBaseDate);

  document.getElementById("prev-week").addEventListener("click", () => {
    currentBaseDate.setDate(currentBaseDate.getDate() - 7);
    renderWeek(currentBaseDate);
  });

  document.getElementById("next-week").addEventListener("click", () => {
    currentBaseDate.setDate(currentBaseDate.getDate() + 7);
    renderWeek(currentBaseDate);
  });
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("slot-popup").style.display = "none";
});
});
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("lesson-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Stop normal form submission

    // Get the date string from the popup
    const popupDateStr = document.getElementById('popup-date').textContent.trim(); // e.g. "03 July 2025"
    const dateObj = new Date(popupDateStr);

    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');

    // Get time inputs
    const startTime = document.getElementById("start-time").value; // "HH:MM"
    const endTime = document.getElementById("end-time").value;

    // Build full datetime strings
    const fullStart = `${yyyy}-${mm}-${dd}T${startTime}`;
    const fullEnd = `${yyyy}-${mm}-${dd}T${endTime}`;

    // Create FormData and append full datetime values
    const formData = new FormData(form);
    formData.set("start-time", fullStart);
    formData.set("end-time", fullEnd);

    fetch("/add_lesson", {
      method: "POST",
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          console.log("Lesson added successfully!");
          document.getElementById("slot-popup").style.display = "none";
          addTimeSlotToCalendar(data.lesson);
        } else {
          console.error("Error submitting form");
        }
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  });
});


window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/users');
  const data = await res.json();

  const teacherSelect = document.getElementById('teacher-select');
  const studentSelect = document.getElementById('student-select');

  data.teachers.forEach(t => {
    const option = document.createElement('option');
    option.value = t.id;
    option.textContent = `${t.first_name} ${t.last_name}`;
    teacherSelect.appendChild(option);
  });

  data.students.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = `${s.first_name} ${s.last_name}`;
    studentSelect.appendChild(option);
  });

  new TomSelect('#teacher-select', { create: false, sortField: 'text' });
  new TomSelect('#student-select', { create: false, sortField: 'text' });
});


const startHour = 8;
const endHour = 20;


