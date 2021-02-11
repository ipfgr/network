document.addEventListener("DOMContentLoaded", () => {

    if (window.location.href.indexOf("profile") > -1) {
        console.log("Profile page")
        const followButton = document.querySelector("#follow")
        followButton.addEventListener('click', () => startFollow())
    }
    if (window.location.href.indexOf("followpage") > -1) {
         const pageFollow = document.querySelectorAll("#page-follow")
        pageFollow.forEach(el => {
        let number = el.innerHTML
        el.addEventListener('click', () => {
            showAllFollowPosts(number)
        })

    })
    }


    const submitNewPost = document.getElementById("submit-post")
    const followPage = document.querySelector("#following-page")
    const indexPageButton = document.querySelector("#indexpage")
    const pageAll = document.querySelectorAll("#page-all")

    submitNewPost.addEventListener("click", () => submitPost())
    indexPageButton.addEventListener("click", () => showAllPosts())
    followPage.addEventListener("click", () => showAllFollowPosts())

    //Form pagination
    pageAll.forEach(el => {
        let number = el.innerHTML
        el.addEventListener('click', () => {
            showAllPosts(number)
        })

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
})

function startFollow() {
    const user_id = JSON.parse(document.getElementById('currentuser').textContent)
    const profile_id = JSON.parse(document.getElementById('profile_id').textContent)

    fetch(`/api/posts/follow`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            user: user_id.toLowerCase(),
            followto: profile_id.toLowerCase(),
        })
    })
        .then(response => response.status)
        .then(result => {
            if (result == "418") {
                document.querySelector(".toast").innerHTML = `<div class="toast-header">
                                                                      <strong class="me-auto">Error</strong>
                                                                      <small>now</small>
                                                                      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                                                                        </div>
                                                                        <div class="toast-body">
                                                                          Sorry, you cant follow yourself.
                                                                        </div>
                                                                      `
                $('.toast').toast('show')
                console.log("Error: Cant follow your account")
            } else {
                console.log("Success!")
            }
        })
        .catch(err => console.log(err))
        .finally(() => {
            setTimeout(() => location.reload(), 2000)
        })
}

function setLike(title, user) {
    const currentPage = JSON.parse(document.getElementById("current-page").textContent);
    console.log(currentPage)
    const full_posts = document.querySelector("#full-posts")
    fetch(`/api/posts/like`, {
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
    fetch(`/api/posts/edit`, {
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
}

function submitPost() {
    const full_posts = document.querySelector("#full-posts")
    const title = document.querySelector("#post-title").value
    const body = document.querySelector("#post-body").value
    fetch('/api/posts', {
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

function showAllFollowPosts(number = 1) {

    const pageFollow = document.querySelectorAll("#page-follow")
    pageFollow.forEach(page => page.parentNode.classList.remove("active"))
    pageFollow.forEach(page => {
        if (page.innerHTML == number) {
            page.parentNode.classList.add("active")
        }
    })
    const follow_posts = document.querySelector("#following-posts")
    const username = JSON.parse(document.getElementById('username').textContent)
    follow_posts.innerHTML = ""
    fetch(`/api/posts/follow?page=${number}`)
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
                                    <div class="likes"><button id="submit-like" onClick = "setLike('${result[i].title}' , '${username}')" class="btn btn-danger like-button" >${result[i].likes}</button> like's</div>
                                    </div>
                                    </div>
                                    `
                        follow_posts.innerHTML += row

                }
            } else {
                let row = `
                                       <h5>Not yet have posts</h5>
                                      `
                follow_posts.innerHTML = row;
            }
        }).catch(error => console.error(error))
    

function showAllPosts(number = 1) {
    const pageAll = document.querySelectorAll("#page-all")
    pageAll.forEach(page => page.parentNode.classList.remove("active"))
    pageAll.forEach(page => {
        if (page.innerHTML == number) {
            page.parentNode.classList.add("active")
        }
    })
    const full_posts = document.querySelector("#full-posts")
    const username = JSON.parse(document.getElementById('username').textContent)
    full_posts.innerHTML = ""
    fetch(`/api/posts?page=${number}`)
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

    loadmore.style.display = 'block';
    title.insertAdjacentHTML("beforeend", `All post's from user ${username}`)
    fetch(`/api/posts/${username.toLowerCase()}`)
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
        }).finally(() => {
        loadmore.style.display = "none"
    })
        .catch(error => console.error(error))
}


