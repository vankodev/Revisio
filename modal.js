function showModal(m) {
  var modal = document.getElementById("modal-" + m);
  var span = document.getElementById("close-" + m);

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