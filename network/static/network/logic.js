document.addEventListener("DOMContentLoaded", () => {


    document.getElementById("submit-post").addEventListener("click", () => submitPost())



    document.getElementById("#follow").style.display = 'none';
    document.querySelector("#unfollow").style.display = 'none';

    const indexpagebutton = document.querySelector("#indexpage")
    indexpagebutton.addEventListener("click", () => showAllPosts())


    
})

function setLike(title,user){
    fetch(`posts/like`,{
        method: "POST",
        headers:{
            "X-CSRFToken":getCookie("csrftoken")
        },
        body: JSON.stringify({
            user: user,
            title: title,

        })
    })  .then(response =>response.json())
        .then(result => console.log(result))
        .catch(error => console.log(error))

        location.reload()
}

function submitPost() {
    let title = document.querySelector("#post-title").value
    let body = document.querySelector("#post-body").value
    fetch('/posts', {
        method: "POST",
        headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
        body: JSON.stringify({
            title: title,
            body: body,
        })

    }).finally(response => console.log(response))

    location.reload()

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

function showAllPosts() {
    let pagination = document.querySelector("#pagination")
    let allposts = document.querySelector("#all-posts")


    fetch(`/posts?page=1`)
        .then(response => response.json())
        .then(result => {
            if (result.length > 0) {
                for (let i = result.length-1; i >= 0; i--) {
                    row = `
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
                    allposts.innerHTML += row

                }
            } else {
                row = `
                                       <h5>This user not yet have posts</h5>
                                      `
                allposts.innerHTML = row;
            }

        }).catch(error => console.error(error))

}

function showAllUserPosts(username) {
    console.log(username.toLowerCase())
    const loadmore = document.querySelector("#load-more")
    loadmore.style.display = 'block';

    let userposts = document.querySelector("#user-posts")
    let pagination = document.querySelector("#pagination")
    let pagination_start = 0
    let pagination_end = 1

    fetch(`/posts/${username.toLowerCase()}`)
        .then(response => response.json())
        .then(result => {
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    row = `
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
                    userposts.innerHTML += row
                }
            } else {
                row = `
                                       <h5>This user not yet have posts</h5>
                                      `
                userposts.innerHTML = row;
            }

    }).catch(error => console.error(error))


}


