function showModal(m) {
  var modal = document.getElementById(m + "Modal");
  var span = document.getElementById(m + "Close");

  modal.style.display = "block";

  span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}