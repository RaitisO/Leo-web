
document.addEventListener("DOMContentLoaded", function () {
    const password = document.getElementById("password");
    const repeatPassword = document.getElementById("repeat-password");
    const requirementsDiv = document.getElementById("password-requirements");
    const repeatErrorDiv = document.getElementById("repeat-password-error");
    const form = document.querySelector("form");
    const params = new URLSearchParams(window.location.search);
  if (params.get("error") === "email") {
    document.getElementById("email-error").textContent = "This email is already in use.";
  }else if(params.get("error") === "signinerror"){
    document.getElementById("login-error").textContent = "Wrong email or password"
  }
    function validatePassword(pwd) {
      const lengthOK = pwd.length >= 8;
      const upperOK = /[A-Z]/.test(pwd);
      const numberOK = /[0-9]/.test(pwd);
      const specialOK = /[^A-Za-z0-9]/.test(pwd);
  
      return {
        isValid: lengthOK && upperOK && numberOK && specialOK,
        errors: {
          lengthOK,
          upperOK,
          numberOK,
          specialOK
        }
      };
    }
  
    function showPasswordRequirements(validation) {
const { lengthOK, upperOK, numberOK, specialOK } = validation.errors;

const requirements = [
  { id: "req-length", ok: lengthOK, text: "At least 8 characters" },
  { id: "req-uppercase", ok: upperOK, text: "At least 1 uppercase letter" },
  { id: "req-number", ok: numberOK, text: "At least 1 number" },
  { id: "req-special", ok: specialOK, text: "At least 1 special character" },
];

const listContainer = document.getElementById("password-requirements");
const successMessage = document.getElementById("password-success");

// Clear existing list
listContainer.innerHTML = "";

let allMet = true;

for (const req of requirements) {
  if (!req.ok) {
    const li = document.createElement("li");
    li.id = req.id;
    li.textContent = req.text;
    listContainer.appendChild(li);
    allMet = false;
  }
}

if (allMet) {
  successMessage.textContent = "Password looks good!";
} else {
  successMessage.textContent = "";
}
}


  
    function checkPasswordsMatch() {
      if (password.value !== repeatPassword.value) {
        repeatErrorDiv.textContent = "Passwords do not match.";
        repeatErrorDiv.style.color = "red";
        return false;
      } else {
        repeatErrorDiv.textContent = "";
        return true;
      }
    }
  
    password.addEventListener("input", () => {
      const result = validatePassword(password.value);
      showPasswordRequirements(result);
    });
  
    repeatPassword.addEventListener("input", checkPasswordsMatch);
  
    form.addEventListener("submit", function (e) {
      const result = validatePassword(password.value);
      const match = checkPasswordsMatch();
  
      if (!result.isValid || !match) {
        e.preventDefault(); // Block submission if not valid
      }
    });
  });
