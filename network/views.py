import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import Follow
from .models import Like
from .models import Post
from .models import User


def index(request):
    context = {
    }
    return render(request, "network/index.html", context)


@login_required()
def follow_view():
    pass


@login_required()
def like_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user = data.get("user", "")
        title = data.get("title", "")
        user_names = User.objects.raw("SELECT * FROM network_user WHERE username=%s", [user])
        like = Post.objects.get(title=title)
        if user_names is not None:
            wholike = Like.objects.raw("SELECT * FROM network_like WHERE like_by=%s AND like_topost_id=%s",
                                       [user, title])
            if not wholike:
                like.likes += 1
                like.save()
                wl = Like(like_topost_id=title, like_by=user)
                wl.save()
                return JsonResponse({
                    "Ok": "Like put successful"
                }, status=201)


            else:
                like.likes -= 1
                like.save()
                Like.objects.get(like_topost_id=title, like_by=user).delete()
                return JsonResponse({
                    "Ok": "Unlike put successful"
                }, status=201)
        else:
            return JsonResponse({"Invalid username "})

@login_required()
def posts_saveedit(request):
    if request.method == "POST":
        data = json.loads(request.body)
        body = data.get("body", "")
        title = data.get("title", "")
        Post.objects.filter(title=title).update(post_body=body)
        return JsonResponse({"message": "Successfully updated."}, status=201)


    
    
    
def getAllPosts():
    pass


def posts_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        body = data.get("body", "")
        title = data.get("title", "")
        newpost = Post(title=title, post_body=body, publish_user_id=request.user.username)
        newpost.save()
        return JsonResponse({"message": "Successfully posted."}, status=201)

    if request.method != "POST":
        page = request.GET.get("page")
        start = len(Post.objects.all()) - (int(page) * 4)
        end = len(Post.objects.all())
        posts = Post.objects.raw('SELECT * FROM network_post WHERE id BETWEEN %s AND %s', [start, end + 1])
        return JsonResponse([post.serialize() for post in posts], safe=False)


def singlepost_view(request, post_id):
    pass


def user_post_view(request, user):
    posts = Post.objects.raw("SELECT * FROM network_post WHERE publish_user_id=%s", [user])
    return JsonResponse([post.serialize() for post in posts], safe=False)


def profile_view(request, user):
    currentuser = request.user.username
    finduser = User.objects.filter(username=user)
    # userfollowers = Follow.objects.raw("SELECT * FROM network_follow WHERE user_tofollow=%s", [user])
    # userfollow = Follow.objects.raw("SELECT COUNT * FROM network_follow WHERE user_whofollow=%s", [user])

    userfollowers = Follow.objects.filter(user_tofollow=user).count()
    userfollow = Follow.objects.filter(user_whofollow=user).count()

    if finduser:
        if currentuser == user:
            return render(request, "network/profile.html", {
                "currentuser": user.capitalize(),
                "userfollow": userfollow,
                "userfollowers": userfollowers,
                "buttons": False
            })
        else:
            return render(request, "network/profile.html", {
                "currentuser": user.capitalize(),
                "currentuser": user.capitalize(),
                "userfollow": userfollow,
                "userfollowers": userfollowers,
                "buttons": True

            })
    else:
        return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
