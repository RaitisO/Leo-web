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
const monday = week[0];
  const sunday = new Date(week[6]);
  sunday.setHours(23, 59, 59, 999);
  const startISO = monday.toISOString();
  const endISO = sunday.toISOString();
  const role = window.location.pathname.split('/')[2];

  fetch(`/get_lessons?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}&role=${encodeURIComponent(role)}`)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      console.log("Lessons for the week:", data);
    })
    .catch(error => {
      console.error("Error fetching lessons:", error);
    });
  // Month label (June–July 2025)
  const months = new Set(week.map(d => d.toLocaleString('default', { month: 'long' })));
  const year = week[0].getFullYear();
  const monthLabel = [...months].join("–") + " " + year;
  label.textContent = monthLabel;

  // Add day labels (Mon 17, Tue 18...)
    const today = new Date();

week.forEach(date => {
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = date.getDate();
  const div = document.createElement("div");
  div.className = "calendar-day-label";
  div.textContent = `${dayName} ${dayNum}`;

  // Check if this date is today (compare year, month, and date)
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    div.classList.add("today-highlight"); // Add a CSS class for today
  }

  dayLabels.appendChild(div);
});


schedule.forEach(block => {
  const timeLabel = document.createElement("div");
  timeLabel.textContent = block.start;
  timeLabel.className = block.type === "break" ? "break-label" : "lesson-label";
  times.appendChild(timeLabel);
});

  // Add empty grid slots (7 days × N hours)
schedule.forEach((block, index) => {
  for (let day = 0; day < 7; day++) {
    const slot = document.createElement("div");

    slot.className = block.type === "lesson" 
      ? "calendar-slot" 
      : "calendar-break-slot"; // new class for break style

    slot.dataset.day = day;
    slot.dataset.start = block.start;
    slot.dataset.end = block.end;


    // Optional: disable interaction on break slots
    if (block.type === "break") {
      slot.style.pointerEvents = "none";
    }

    grid.appendChild(slot);
  }
});




  document.querySelectorAll('.calendar-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const day = parseInt(slot.dataset.day);
      const hour = parseInt(slot.dataset.start);//TODO!!!!!<========== change this so it gives HH:MM instead of H
      openSlotPopup(day, hour);
    });
  });



  return week[0]; // return Monday of the week
}

function makeLessonSlot(start, end) {
  const startDate = new Date(start);
  const day = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;

  const startHours = String(startDate.getHours()).padStart(2, "0");
  const startMinutes = String(startDate.getMinutes()).padStart(2, "0");
  const timeKey = `${startHours}:${startMinutes}`;

  const slot = document.querySelector(`[data-day="${day}"][data-start="${timeKey}"]`);

  if (slot) {
    slot.classList.remove("calendar-slot");
    slot.classList.add("lesson-slot");
  } else {
    console.warn("Slot not found for", day, timeKey);
  }
}

function openSlotPopup(day, hour) {
  const popup = document.getElementById("slot-popup");
console.log(hour)

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
          makeLessonSlot(fullStart,fullEnd);
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
const endHour = 23;
const schedule = [
  { start: "08:00", end: "09:00", type: "lesson" },
  { start: "09:00", end: "10:00", type: "lesson" },
  { start: "10:00", end: "10:15", type: "break" },
  { start: "10:15", end: "11:15", type: "lesson" },
  { start: "11:15", end: "12:15", type: "lesson" },
  { start: "12:15", end: "12:30", type: "break" },
  { start: "12:30", end: "13:30", type: "lesson" },
  { start: "13:30", end: "14:30", type: "lesson" },
  { start: "14:30", end: "14:45", type: "break" },
  { start: "14:45", end: "15:45", type: "lesson" },
  { start: "15:45", end: "16:45", type: "lesson" },
  { start: "16:45", end: "17:00", type: "break" },
  { start: "17:00", end: "18:00", type: "lesson" },
  { start: "18:00", end: "19:00", type: "lesson" },
  { start: "19:00", end: "19:15", type: "break" },
  { start: "19:15", end: "20:15", type: "lesson" },
  { start: "20:15", end: "21:15", type: "lesson" },
  { start: "21:15", end: "21:30", type: "break" },
  { start: "21:30", end: "22:30", type: "lesson" },
  { start: "22:30", end: "23:30", type: "lesson" },
  { start: "23:30", end: "23:45", type: "break" },
  { start: "23:45", end: "00:45", type: "lesson" }
];


