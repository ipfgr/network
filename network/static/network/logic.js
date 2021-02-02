document.addEventListener("DOMContentLoaded", () => {

document.getElementById("submit-post").addEventListener("click", () => submitPost())

})

function submitPost() {
let body = document.querySelector("#post-body").value
        document.querySelector(".all-posts").innerHTML= `${body}`

}


