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
        makeLessonSlot(lesson.start_time,lesson.end_time,lesson.student_name,lesson.teacher_name,lesson.lesson_id,lesson.student_id,lesson.teacher_id,lesson.subj);
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
function makeLessonSlot(start, end, student, teacher, lesson_id, student_id, teacher_id, subject_id) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const day = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;

  const startHours = String(startDate.getHours()).padStart(2, "0");
  const startMinutes = String(startDate.getMinutes()).padStart(2, "0");
  const timeKey = `${startHours}:${startMinutes}`;

  let slot = document.querySelector(`[data-day="${day}"][data-start="${timeKey}"]`);

  const endHours = String(endDate.getHours()).padStart(2, "0");
  const endMinutes = String(endDate.getMinutes()).padStart(2, "0");

  // build lesson content
  const timeLabel = document.createElement("div");
  const studentNameLabel = document.createElement("div");
  const teacherNameLabel = document.createElement("div");

  studentNameLabel.className = "student-name-label";
  studentNameLabel.textContent = student;

  teacherNameLabel.className = "teacher-name-label";
  teacherNameLabel.textContent = teacher;

  timeLabel.className = "lesson-time-label";
  timeLabel.textContent = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;

  // ✅ Case 1: fits into existing predefined slot
  if (slot) {
    slot.classList.remove("calendar-slot");
    slot.classList.add("lesson-slot");

    slot.appendChild(timeLabel);
    slot.appendChild(studentNameLabel);
    slot.appendChild(teacherNameLabel);

    slot.dataset.student_name = student;
    slot.dataset.teacher_name = teacher;
    slot.dataset.student_id = student_id;
    slot.dataset.teacher_id = teacher_id;
    slot.dataset.lesson_id = lesson_id;
    slot.dataset.subject_id = subject_id;

  } else {
    // ✅ Case 2: no matching predefined slot → create special slot
    console.warn("No predefined slot for", day, timeKey, "→ creating special slot");

    const col = document.querySelector(`.calendar-column[data-day="${day}"]`);
    if (!col) {
      console.error("No calendar column for day", day);
      return;
    }

    const specialSlot = document.createElement("div");
    specialSlot.classList.add("lesson-slot", "special-lesson-slot");

    specialSlot.appendChild(timeLabel);
    specialSlot.appendChild(studentNameLabel);
    specialSlot.appendChild(teacherNameLabel);

    // dataset for editing/updating
    specialSlot.dataset.student_name = student;
    specialSlot.dataset.teacher_name = teacher;
    specialSlot.dataset.student_id = student_id;
    specialSlot.dataset.teacher_id = teacher_id;
    specialSlot.dataset.lesson_id = lesson_id;
    specialSlot.dataset.subject_id = subject_id;
    specialSlot.dataset.start = timeKey;

    // add it to the right column
    col.appendChild(specialSlot);
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
  const select = document.getElementById("preset-time");

  schedule.forEach((slot) => {
    if (slot.type === "lesson") {
      const localStart = shiftTime(slot.start,offsetMinutes);
      const localEnd = shiftTime(slot.end,offsetMinutes);

      const opt = document.createElement("option");
      opt.value = `${localStart}-${localEnd}`; // keep original UTC values
      opt.textContent = `${localStart} - ${localEnd}`;
      if(localStart===time){
        opt.setAttribute("selected",true);
      }
      select.appendChild(opt);
    }
  });
  document.getElementById("preset-time").addEventListener("change",function(){
    const val  = this.value;
    if(!val) return;
    const [start,end] = val.split("-");

    document.getElementById("start-time").value = `${start}`;
    document.getElementById("end-time").value = `${end}`;
    document.getElementById("start-time-display").innerText = start;
    document.getElementById("end-time-display").innerText = end;
  });

  if (mode === "edit" && lessonData) {
  // 🔧 Update title and button
   document.getElementById("recurring-container").style.display = "none";
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
  const isoDateStr = new Date(yyyy, mm - 1, dd+1).toISOString().split("T")[0]; // "yyyy-mm-dd"
  document.getElementById("popup-date").innerHTML = `
  <label>Date:
    <input type="date" id="raw-date" name="raw-date" value="${isoDateStr}">
  </label>
`;


  // 👤 Pre-select teacher/student
document.querySelector("#teacher-select").tomselect.setValue(lessonData.teacher_id);
document.querySelector("#student-select").tomselect.setValue(lessonData.student_id);



  } else {
    // 🟢 CREATE MODE (default)
    document.getElementById("recurring-container").style.display = "block";
    document.getElementById('teacher-select').tomselect.clear();
    document.getElementById('student-select').tomselect.clear();
    document.getElementById('subject-select').tomselect.clear();

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
  const student_id = slot.dataset.student_id;
  const teacher_id = slot.dataset.teacher_id;
  const start = slot.dataset.start;
  const end = slot.dataset.end;
  const lessonID = slot.dataset.lesson_id
  const date = slot.dataset.date
  const lessonData={
    lesson_id: lessonID,
    end: end,
    teacher_id: teacher_id,
    student_id: student_id
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
  const timeDropdown =  document.getElementById("preset-time-container");

  if (showInputs) {
    startTimeInput.style.display = "inline-block";
    endTimeInput.style.display = "inline-block";
    startDisplay.style.display = "none";
    endDisplay.style.display = "none";
    timeDropdown.style.display= "none";
  } else {
    startTimeInput.style.display = "none";
    endTimeInput.style.display = "none";
    startDisplay.style.display = "inline-block";
    endDisplay.style.display = "inline-block";
    timeDropdown.style.display= "inline-block";

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
  const actionBtn = document.getElementById("create-lesson");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Stop normal form submission

    // ✅ Use stored raw dd/mm/yyyy format
    const rawDateElem = document.getElementById("raw-date");
    if (!rawDateElem) {
      console.error("raw-date input missing");
      return;
    }
    const rawDate = rawDateElem.value.trim();
    if (!rawDate) {
      console.error("raw-date empty");
      return;
    }

    // --- Parse raw date: accept dd/mm/yyyy or yyyy-mm-dd ---
    let dd, mm, yyyy;
    if (rawDate.includes("/")) {
      [dd, mm, yyyy] = rawDate.split("/").map(s => s.padStart(2, "0")); // dd/mm/yyyy
    } else if (rawDate.includes("-")) {
      [yyyy, mm, dd] = rawDate.split("-").map(s => s.padStart(2, "0")); // yyyy-mm-dd
    } else {
      const d = new Date(rawDate);
      if (isNaN(d)) {
        console.error("Cannot parse raw date:", rawDate);
        return;
      }
      dd = String(d.getDate()).padStart(2, "0");
      mm = String(d.getMonth() + 1).padStart(2, "0");
      yyyy = d.getFullYear();
    }

    // Get time inputs
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;

    // Build local datetime
    const localStart = new Date(`${yyyy}-${mm}-${dd}T${startTime}`);
    const localEnd = new Date(`${yyyy}-${mm}-${dd}T${endTime}`);

    // Convert to ISO (no milliseconds)
    const fullStart = localStart.toISOString().slice(0, 16);
    const fullEnd = localEnd.toISOString().slice(0, 16);

    // ✅ Get selected IDs & names from Tom Select
    const teacherID = document.querySelector("#teacher-select").tomselect.getValue();
    const teacherName = document.querySelector("#teacher-select").tomselect.getItem(teacherID)?.textContent || "";
    const studentID = document.querySelector("#student-select").tomselect.getValue();
    const studentName = document.querySelector("#student-select").tomselect.getItem(studentID)?.textContent || "";
    const subjectID = document.querySelector("#subject-select").tomselect.getValue(); // ✅ new

    // Create FormData and append full datetime + IDs
    const formData = new FormData(form);
    formData.set("start-time", fullStart);
    formData.set("end-time", fullEnd);
    formData.set("teacher_id", teacherID);
    formData.set("student_id", studentID);
    formData.set("subject_id", subjectID); // ✅ add subject

    if (actionBtn.classList.contains("create")) {
      const isRecurring = document.getElementById("recurring-checkbox").checked;
      formData.set("recurring", isRecurring ? "true" : "false");
    }

    // Decide route based on mode
    let url, method;
    if (actionBtn.classList.contains("save-changes")) {
      console.log("lesson id: ", actionBtn.dataset.lessonId);
      url = `/edit_lesson?id=${actionBtn.dataset.lessonId}`;
      method = "POST";
    } else {
      url = "/add_lesson";
      method = "POST";
    }

    fetch(url, {
      method: method,
      body: formData,
    })
      .then(response => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then(data => {
        if (actionBtn.classList.contains("save-changes")) {
          location.reload();
        } else {
          makeLessonSlot(localStart, localEnd, studentName, teacherName, data.lesson_id, studentID, teacherID, subjectID);
          // ✅ you can also pass subjectName into makeLessonSlot if you want to display it
        }
        document.getElementById("slot-popup").style.display = "none";
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
  const subjectSelect = document.getElementById('subject-select'); // ✅

  // Teachers
  data.teachers.forEach(t => {
    const option = document.createElement('option');
    option.value = t.id;
    option.textContent = `${t.first_name} ${t.last_name}`;
    teacherSelect.appendChild(option);
  });

  // Students
  data.students.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = `${s.first_name} ${s.last_name}`;
    studentSelect.appendChild(option);
  });

  // ✅ Subjects
  data.subjects.forEach(sub => {
    const option = document.createElement('option');
    option.value = sub.id;
    option.textContent = sub.name;
    subjectSelect.appendChild(option);
  });

  // Initialize TomSelects
  new TomSelect('#teacher-select', { create: false, sortField: 'text' });
  new TomSelect('#student-select', { create: false, sortField: 'text' });
  new TomSelect('#subject-select', { create: false, sortField: 'text' }); // ✅
});





