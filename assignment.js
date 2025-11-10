let marks;
let gradeMessage;

// Event listener for checking grade
document.getElementById("checkGradeBtn").addEventListener("click", function () {
  checkStudentGrade();
});

function checkStudentGrade() {
  marks = Number(document.getElementById("marks").value);

  if (marks >= 90 && marks <= 100) {
    gradeMessage = "Grade: A+ (Excellent!)";
  } else if (marks >= 80 && marks < 90) {
    gradeMessage = "Grade: A (Very Good)";
  } else if (marks >= 70 && marks < 80) {
    gradeMessage = "Grade: B (Good)";
  } else if (marks >= 60 && marks < 70) {
    gradeMessage = "Grade: C (Satisfactory)";
  } else if (marks >= 0 && marks < 60) {
    gradeMessage = "Fail — Work Hard!";
  } else {
    gradeMessage = "Please enter valid marks (0 - 100)";
  }

  document.getElementById("gradeResult").innerHTML =
    "Marks: " + marks + "<br>" + gradeMessage;
}

// Math functions
function add() {
  let a = 10, b = 6;
  return a + b;
}

function subtract() {
  let a = 10, b = 5;
  return a - b;
}

function multiply() {
  let a = 4, b = 3;
  return a * b;
}

function divide() {
  let a = 10, b = 5;
  return a / b;
}

// Display functions
function displaySum() {
  document.getElementById("toggleText1").innerHTML = "Sum: " + add();
}

function displaySub() {
  document.getElementById("toggleText2").innerHTML = "Difference: " + subtract();
}

function displayMul() {
  document.getElementById("toggleText3").innerHTML = "Product: " + multiply();
}

function displayDiv() {
  document.getElementById("toggleText4").innerHTML = "Quotient: " + divide();
}
