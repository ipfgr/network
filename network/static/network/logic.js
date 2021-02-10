document.addEventListener("DOMContentLoaded", () => {

    const submitNewPost = document.getElementById("submit-post")
    const followPage = document.getElementById("following-page")
    const indexPageButton = document.querySelector("#indexpage")
    const followButton = document.querySelector("#follow")

    followButton.addEventListener('click', () => startFollow())
    submitNewPost.addEventListener("click", () => submitPost())
    indexPageButton.addEventListener("click", () => showAllPosts())

    const page = document.querySelectorAll("#page")
    const pageProfile = document.querySelectorAll("#page-profile")


    page.forEach(el => {
        let number = el.innerHTML
        el.addEventListener('click', () => {
            el.parentNode.classList.add("active")
            showAllPosts(number)
        })
        console.log(number)
    })

    pageProfile.forEach(el => {
        let number = el.innerHTML
        el.addEventListener('click', () => showAllUserPosts(number))
        console.log(number)
    })

    $('#edit-modal').on('show.bs.modal', function (e) {
        const button = $(e.relatedTarget)
        let modal_title = button.data('bs-filltitle')
        let modal_body = button.data('bs-fillbody')
        const $modal = $(this)
        const saveChangesButton = document.querySelector("#save-changes")
        saveChangesButton.addEventListener("click", () => submitEditPost())

        $modal.find('.modal-title').text(modal_title);
        $modal.find('.modal-body textarea').val(modal_body);
    })

    const unfollowButton = document.querySelector("#unfollow")

    followButton.style.display = "none"
    unfollowButton.style.display = "none"

    document.querySelector("#full-posts").style.display = 'none';
    document.querySelector("#followed-posts").style.display = 'none';

})

function startFollow() {
    const user_id = JSON.parse(document.getElementById('currentuser').textContent)
    const profile_id = JSON.parse(document.getElementById('profile_id').textContent)

    fetch(`/posts/follow`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            user: user_id.toLowerCase(),
            followto: profile_id.toLowerCase(),
        })
    })
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(err => console.log(err))
}

function setLike(title, user) {
    const currentPage = JSON.parse(document.getElementById("current-page").textContent);
    console.log(currentPage)
    const full_posts = document.querySelector("#full-posts")
    fetch(`posts/like`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            user: user,
            title: title,
        })
    }).then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log(error))
        .finally(() => {

            full_posts.innerHTML = ""
            showAllPosts(currentPage)
        })
}

function submitEditPost() {
    const editedValue = document.querySelector("#message-text").value;
    const title = document.querySelector("#modalLabel").innerText
    fetch(`/posts/edit`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            body: editedValue,
            title: title
        })
    })
    $('#edit-modal').modal('hide')
    location.reload()
}

function submitPost() {
    const full_posts = document.querySelector("#full-posts")
    const title = document.querySelector("#post-title").value
    const body = document.querySelector("#post-body").value
    fetch('/posts', {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            title: title,
            body: body,
        })
    })
        .then(response => console.log(response))
        .finally(() => {

            full_posts.innerHTML = ""
            showAllPosts()
        })
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function addpPagination() {
    const pagination = document.querySelector("#pag-page")


    //Функция отображения PopUp


}

function showAllPosts(number = 1) {
    const full_posts = document.querySelector("#full-posts")

    const username = JSON.parse(document.getElementById('username').textContent)
    full_posts.innerHTML = ""


    fetch(`/posts?page=${number}`)
        .then(response => response.json())
        .then(result => {
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    if (result[i].publish_user == username) {
                        let row = `
                                    <div class="one-post">
                                    <div class="out-post-container">
                                    <div class="post-title">${result[i].title}</div>
                                    <div class="post-timestamp">${result[i].timestamp}</div>
                                    <div class="post-body">${result[i].body}</div>
                                    <div class="post-publish_user"><a href="/profile/${result[i].publish_user}">Posted by: ${result[i].publish_user}</a></div>
                                    <div class="likes"><button id="submit-like" onClick = "setLike('${result[i].title}' , '${username}')" class="btn btn-danger like-button" >${result[i].likes}</button> like's</div>
                                                                        <!-- Button trigger modal -->
                                    <div class="post-edit"><button id="edit-post" data-bs-toggle="modal" data-bs-target="#edit-modal" data-bs-filltitle="${result[i].title}" data-bs-fillbody="${result[i].body}" class="btn btn-outline-info edit-button" >Edit this post</button></div>
                                    </div>
                                    </div>
                                    `
                        full_posts.innerHTML += row
                    } else {
                        let row = `
                                    <div class="one-post">
                                    <div class="out-post-container">
                                    <div class="post-title">${result[i].title}</div>
                                    <div class="post-timestamp">${result[i].timestamp}</div>
                                    <div class="post-body">${result[i].body}</div>
                                    <div class="post-publish_user"><a href="/profile/${result[i].publish_user}">Posted by: ${result[i].publish_user}</a></div>
                                    <div class="likes"><button id="submit-like" onClick = "setLike('${result[i].title}' , '${username}')" class="btn btn-danger like-button" >${result[i].likes}</button> like's</div>
                                    </div>
                                    </div>
                                    `
                        full_posts.innerHTML += row
                    }
                }
            } else {
                let row = `
                                       <h5>Not yet have posts</h5>
                                      `
                full_posts.innerHTML = row;
            }
        }).catch(error => console.error(error))
}

function showAllUserPosts(username) {
    const loadmore = document.querySelector("#load-more")
    const userPosts = document.querySelector("#user-posts")
    const title = document.querySelector("#title-h1")
    let pagination = document.querySelector("#pagination")

    let pagination_start = 0
    let pagination_end = 1
    loadmore.style.display = 'block';
    title.insertAdjacentHTML("beforeend", `All post's from user ${username}`)
    fetch(`/posts/${username.toLowerCase()}`)
        .then(response => response.json())
        .then(result => {
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    let row = `
                                    <div class="one-post">
                                    <div class="out-post-container">
                                    <div class="post-title">${result[i].title}</div>
                                    <div class="post-timestamp">${result[i].timestamp}</div>
                                    <div class="post-body">${result[i].body}</div>
                                    <div class="post-publish_user"><a href="/profile/${result[i].publish_user}">Posted by: ${result[i].publish_user}</a></div>
                                    <div class="likes"><button id="submit-like" onClick = "setLike('${result[i].title}' , '${result[i].publish_user}')" class="btn btn-danger like-button" >${result[i].likes}</button> like's</div>
                                    </div>
                                    </div>
                                    `
                    userPosts.innerHTML += row
                }
            } else {
                let row = `
                                       <h5>This user not yet have posts</h5>
                                      `
                userPosts.innerHTML = row;
            }
        }).catch(error => console.error(error))
}


