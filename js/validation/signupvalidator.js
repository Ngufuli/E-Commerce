function validation() {
  if (document.register.first_name.value == "") {
    document.getElementById("first_name_ide").innerHTML =
      "Please fill in your name";
    document.register.first_name.focus();
    return false;
  }

  if (document.register.sur_name.value.trim() === "") {
    document.getElementById("sur_name_ide").innerHTML =
      "Please fill in your surname";
    document.register.sur_name.focus();
    return false;
  }

  if (document.signin.email_id.value.trim() === "") {
    document.getElementById("email_id_ide").innerHTML =
      "Please fill in your email address";
    document.register.email_id.focus();
    return false;
  }

  if (
    document.signin.password.value.trim() === "" &&
    document.signin.password.length <= 10
  ) {
    document.getElementById("pass_word_ide").innerHTML =
      "Please fill in your password";
    document.register.password.focus();
    return false;
  }

  //   if (document.register.gender_g == "") {
  //     document.getElementById("gender_g_ide").innerHTML =
  //       "Please select your gender";
  //     return false;
  //   }

  return true;
}
