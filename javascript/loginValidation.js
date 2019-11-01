function validation() {
  if (document.signin.email.value == "") {
    document.getElementById("first_name_ide").innerHTML =
      "Please fill in your email ID";
    document.register.first_name.focus();
    return false;
  }

  if (document.signin.password.value == "") {
    document.getElementById("sur_name_ide").innerHTML =
      "Please fill in your surname";
    document.register.sur_name.focus();
    return false;
  }

  if (document.register.email_id.value == "") {
    document.getElementById("email_id_ide").innerHTML =
      "Please fill in your email address";
    document.register.email_id.focus();
    return false;
  }

  if (document.register.pass_word.value == "") {
    document.getElementById("pass_word_ide").innerHTML =
      "Please fill in your password";
    document.register.password.focus();
    return false;
  }

  if (document.register.gender_g == "") {
    document.getElementById("gender_g_ide").innerHTML =
      "Please select your gender";
    return false;
  }

  if (document.register.file_upload.value == "") {
    document.getElementById(file_id_ide).innerHTML = "Please upload a file";
    return false;
  }
  return true;
}
