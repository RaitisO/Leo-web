//CONSTANTS
const offsetMinutes = new Date().getTimezoneOffset() * -1;
let currentBaseDate = new Date();
const schedule = [
  { start: "05:00", end: "06:00", type: "lesson" },
  { start: "06:00", end: "07:00", type: "lesson" },
  { start: "07:00", end: "07:15", type: "break" },
  { start: "07:15", end: "08:15", type: "lesson" },
  { start: "08:15", end: "09:15", type: "lesson" },
  { start: "09:15", end: "09:30", type: "break" },
  { start: "09:30", end: "10:30", type: "lesson" },
  { start: "10:30", end: "11:30", type: "lesson" },
  { start: "11:30", end: "11:45", type: "break" },
  { start: "11:45", end: "12:45", type: "lesson" },
  { start: "12:45", end: "13:45", type: "lesson" },
  { start: "13:45", end: "14:00", type: "break" },
  { start: "14:00", end: "15:00", type: "lesson" },
  { start: "15:00", end: "16:00", type: "lesson" },
  { start: "16:00", end: "16:15", type: "break" },
  { start: "16:15", end: "17:15", type: "lesson" },
  { start: "17:15", end: "18:15", type: "lesson" },
  { start: "18:15", end: "18:30", type: "break" },
  { start: "18:30", end: "19:30", type: "lesson" },
  { start: "19:30", end: "20:30", type: "lesson" },
  { start: "20:30", end: "20:45", type: "break" },
  { start: "20:45", end: "21:45", type: "lesson" }
];

//Functions for rendering the calendar
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
      data.forEach(lesson=>{
        makeLessonSlot(lesson.start_time,lesson.end_time,lesson.student_name,lesson.teacher_name,lesson.lesson_id);
      });
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
  timeLabel.textContent = shiftTime(block.start, offsetMinutes); // shift to local time
  timeLabel.className = block.type === "break" ? "break-label" : "lesson-label";
  times.appendChild(timeLabel);
});


  // Add empty grid slots (7 days × N hours)
schedule.forEach(block => {
  for (let day = 0; day < 7; day++) {
    const slot = document.createElement("div");

    slot.className = block.type === "lesson" 
      ? "calendar-slot" 
      : "calendar-break-slot";

    // Convert start/end to local time for dataset
    const localStart = shiftTime(block.start, offsetMinutes);
    const localEnd = shiftTime(block.end, offsetMinutes);
    const baseMonday = getWeekDates(baseDate)[0];
    const currentDate = new Date(baseMonday);
    currentDate.setDate(currentDate.getDate() + day);
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const yyyy = currentDate.getFullYear();
    slot.dataset.date = `${dd}/${mm}/${yyyy}`;

    slot.dataset.day = day;
    slot.dataset.start = localStart;
    slot.dataset.end = localEnd;

    if (block.type === "break") {
      slot.style.pointerEvents = "none";
    }

    grid.appendChild(slot);
  }
});





document.querySelectorAll('.calendar-slot, .lesson-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    if (slot.classList.contains('lesson-slot')) {
      // Show view/edit popup for existing lesson
      openLessonInfoPopup(slot);
    } else {
      // Open regular "create new lesson" popup
      const hour = slot.dataset.start;
      const date = slot.dataset.date;
      openSlotPopup(hour, date);
    }
  });
});




  return week[0]; // return Monday of the week
}
function makeLessonSlot(start, end, student, teacher,lesson_id) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const day = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;

  const startHours = String(startDate.getHours()).padStart(2, "0");
  const startMinutes = String(startDate.getMinutes()).padStart(2, "0");
  const timeKey = `${startHours}:${startMinutes}`;

  const slot = document.querySelector(`[data-day="${day}"][data-start="${timeKey}"]`);

  if (slot) {
    slot.classList.remove("calendar-slot");
    slot.classList.add("lesson-slot");
    

    const endHours = String(endDate.getHours()).padStart(2, "0");
    const endMinutes = String(endDate.getMinutes()).padStart(2, "0");

    const timeLabel = document.createElement("div");
    const studentNameLabel = document.createElement("div");
    const teacherNameLabel = document.createElement("div");
    studentNameLabel.className = "student-name-label";
    studentNameLabel.textContent = `${student}`
    teacherNameLabel.className = "teacher-name-label";
    teacherNameLabel.textContent = `${teacher}`
    timeLabel.className = "lesson-time-label";
    timeLabel.textContent = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
    
    slot.appendChild(timeLabel);
    slot.appendChild(studentNameLabel);
    slot.appendChild(teacherNameLabel);
    slot.dataset.student_name = student;
    slot.dataset.teacher_name = teacher;
    slot.dataset.lesson_id=lesson_id;

  } else {
    console.warn("Slot not found for", day, timeKey);
  }
}

//Popup functions
function openSlotPopup(time, date, mode = "create", lessonData = null) {
  const popup = document.getElementById("slot-popup");
  const form = document.getElementById("lesson-form");
  const title = popup.querySelector("h3");
  const actionBtn = document.getElementById("create-lesson");

  // Reset popup content
  form.reset();
  document.getElementById("custom-time-toggle").checked = false;
  toggleTimeFields(false);
  actionBtn.className = ""; // reset button classes

  if (mode === "edit" && lessonData) {
  // 🔧 Update title and button
  title.textContent = "Edit Lesson Info";
  actionBtn.textContent = "Save Changes";
  actionBtn.classList.add("save-changes");
  actionBtn.dataset.lessonId = lessonData.lesson_id;
  form.dataset.mode = "edit";

  // ⏱️ Prefill start/end time
  const startTimeStr = time; // already in "HH:mm" format
  const endTimeStr = lessonData.end;
  document.getElementById("start-time").value = startTimeStr;
  document.getElementById("end-time").value = endTimeStr;
  document.getElementById("start-time-display").textContent = startTimeStr;
  document.getElementById("end-time-display").textContent = endTimeStr;

  // 🟨 Enable custom time toggle
  document.getElementById("custom-time-toggle").checked = true;
  toggleTimeFields(true);

  // 📅 Replace raw-date label with a date input
  const [dd, mm, yyyy] = date.split("/").map(Number);
  const isoDateStr = new Date(yyyy, mm - 1, dd).toISOString().split("T")[0]; // "yyyy-mm-dd"
  document.getElementById("popup-date").innerHTML = `
  <label>Date:
    <input type="date" id="raw-date" name="raw-date" value="${isoDateStr}">
  </label>
`;


  // 👤 Pre-select teacher/student
  document.getElementById("teacher-select").value = lessonData.teacher_id;
  document.getElementById("student-select").value = lessonData.student_id;



  } else {
    // 🟢 CREATE MODE (default)
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr);
    const minutes = parseInt(minuteStr);
    const [dd, mm, yyyy] = date.split("/").map(Number);
    const selectedDate = new Date(yyyy, mm - 1, dd, hour, minutes);
    const endDate = new Date(selectedDate);
    endDate.setHours(hour + 1, minutes, 0, 0);

    const startTimeStr = selectedDate.toTimeString().slice(0, 5);
    const endTimeStr = endDate.toTimeString().slice(0, 5);
    document.getElementById("start-time").value = startTimeStr;
    document.getElementById("end-time").value = endTimeStr;
    document.getElementById("start-time-display").textContent = startTimeStr;
    document.getElementById("end-time-display").textContent = endTimeStr;

    title.textContent = "Create a Lesson Time";
    actionBtn.textContent = "Create";
    actionBtn.classList.add("create");
    delete actionBtn.dataset.lessonId;
    form.dataset.mode = "create";

    // 📅 Pretty display instead of date input
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = selectedDate.getDate();
    const month = selectedDate.toLocaleString("default", { month: "long" });
    const year = selectedDate.getFullYear();

    document.getElementById("popup-date").innerHTML = `
  <input type="hidden" id="raw-date" name="raw-date" value="${date}">
  ${dayName} ${dayNum}. ${month} ${year}
`;

  }

  popup.style.display = "flex";
}


function openLessonInfoPopup(slot) {
  // You should already store these attributes when creating lesson slots
  const studentName = slot.dataset.student_name;
  const teacherName = slot.dataset.teacher_name;
  const start = slot.dataset.start;
  const end = slot.dataset.end;
  const lessonID = slot.dataset.lesson_id
  const date = slot.dataset.date
  const lessonData={
    lesson_id: lessonID,
    end: end,
    teacher_name: teacherName,
    student_name: studentName
  }
  // Create popup container
  const popup = document.createElement("div");
  popup.className = "info-popup-overlay";
  popup.id ="popup-overlay"

  popup.innerHTML = `<div class="lesson-info-popup">
    <span id="close-lesson-popup-btn" class="close-popup">&times;</span>
    <h3>Lesson Details</h3>
    <p><strong>Student:</strong> ${studentName}</p>
    <p><strong>Teacher:</strong> ${teacherName}</p>
    <p><strong>Start:</strong> ${start}</p>
    <p><strong>End:</strong> ${end}</p>
    <div class="popup-buttons">
      <button id="edit-lesson-btn">Edit</button>
      <button id="cancel-lesson-btn">Cancel Lesson</button>
    </div>
    </div>
  `;

  // Append and fade in (optional)
  document.body.appendChild(popup);

  // Close button logic
 document.getElementById("close-lesson-popup-btn").addEventListener("click", () => {
    popup.remove();
  });
  // Placeholder for edit logic
 document.getElementById("edit-lesson-btn").addEventListener("click", () => {
    openSlotPopup(start, date, "edit", lessonData);
    popup.remove();
});

  document.getElementById("cancel-lesson-btn").addEventListener("click", () => {
    warningPopup(lessonID);
  });
}
function warningPopup(lessonID){
  const popup = document.createElement("div");
  popup.className = "warning-popup-overlay";
  popup.id ="warning-popup-overlay"

  popup.innerHTML=`
    <div class="warning-popup">
      <p>Are you sure you want to cancel this lesson?</p>
      <div class="popup-buttons">
        <button id="confirm-cancel-yes" class="danger-button">Yes, Cancel</button>
        <button id="confirm-cancel-no" class="safe-button">No</button>
      </div>
    </div>
  `;
    document.body.appendChild(popup);
document.getElementById("confirm-cancel-no").addEventListener("click", () => {
    popup.remove();
  });
  document.getElementById("confirm-cancel-yes").addEventListener("click", () => {
  // Send POST request to /deletelesson
 fetch(`/delete_lesson?id=${lessonID}`, {
  method: "POST",
})
  .then(response => {
    if (response.ok) {
      location.reload();
    } else{
      console.error("Failed to delete lesson");
    }
  })
  .catch(error => {
    console.error("Network error:", err);
    alert("There was an error cancelling the lesson.");
  });
});

}



//Helper functions
function shiftTime(utcTimeStr, offsetMinutes) {
  const [hours, minutes] = utcTimeStr.split(":").map(Number);

  // Create a Date object assuming it's in UTC (not local)
  const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes));

  // Shift by the offset
  utcDate.setMinutes(utcDate.getMinutes() + offsetMinutes);

  const localHours = String(utcDate.getUTCHours()).padStart(2, "0");
  const localMinutes = String(utcDate.getUTCMinutes()).padStart(2, "0");

  return `${localHours}:${localMinutes}`;
}
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
function toggleTimeFields(showInputs) {
  const startTimeInput = document.getElementById("start-time");
  const endTimeInput = document.getElementById("end-time");
  const startDisplay = document.getElementById("start-time-display");
  const endDisplay = document.getElementById("end-time-display");

  if (showInputs) {
    startTimeInput.style.display = "inline-block";
    endTimeInput.style.display = "inline-block";
    startDisplay.style.display = "none";
    endDisplay.style.display = "none";
  } else {
    startTimeInput.style.display = "none";
    endTimeInput.style.display = "none";
    startDisplay.style.display = "inline-block";
    endDisplay.style.display = "inline-block";
  }
}

//Even Listeners
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
document.getElementById("custom-time-toggle").addEventListener("change", function () {
  toggleTimeFields(this.checked);
});

});
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("lesson-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Stop normal form submission

    // ✅ Use stored raw dd/mm/yyyy format
    const rawDate = document.getElementById("popup-date").value;
    console.log(rawDate)
    const [dd, mm, yyyy] = rawDate.split("/");

    // Get time inputs
    const startTime = document.getElementById("start-time").value; // "HH:MM"
    const endTime = document.getElementById("end-time").value;

    // Build local datetime
    const localStart = new Date(`${yyyy}-${mm}-${dd}T${startTime}`);
    const localEnd = new Date(`${yyyy}-${mm}-${dd}T${endTime}`);

    // Convert to ISO (no milliseconds)
    const fullStart = localStart.toISOString().slice(0, 16);
    const fullEnd = localEnd.toISOString().slice(0, 16);

    // Get selected names
    const teacherSelect = document.getElementById("teacher-select");
    console.log(teacherSelect.selectedIndex)
    const teacherName = teacherSelect.options[teacherSelect.selectedIndex].text;
    const studentSelect = document.getElementById("student-select");
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;

    // Create FormData and append full datetime values
    const formData = new FormData(form);
    formData.set("start-time", fullStart);
    formData.set("end-time", fullEnd);

    fetch("/add_lesson", {
      method: "POST",
      body: formData,
    })
      .then(response => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then(data => {
        console.log("Lesson added! ID:", data.lesson_id);
        document.getElementById("slot-popup").style.display = "none";
        makeLessonSlot(localStart, localEnd, studentName, teacherName, data.lesson_id);
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




