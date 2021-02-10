import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Q

from .models import Follow
from .models import Like
from .models import Post
from .models import User


def index(request):
    for_pagination = Post.objects.all().order_by("-id")
    posts = Paginator(for_pagination, 3)
    context = {
        "pagination": posts
    }
    return render(request, "network/index.html", context)


@login_required()
def follow_user_view(request):
    if request.method == "GET":
        page = request.GET.get("page")
        follow_users = Follow.objects.filter(user_whofollow_id=request.user.username)
        query = Q()
        for username in follow_users:
            query.add(Q(publish_user_id=username.user_tofollow_id), Q.OR)
        for_pagination = Post.objects.filter(query)
        posts = Paginator(for_pagination, 3)
        page_obj = posts.get_page(page)

        return JsonResponse([post.serialize() for post in page_obj], safe=False)

    if request.method == "POST":
        data = json.loads(request.body)
        who_follow = data.get("user", "")
        whom_follow = data.get("followto", "")
        follow_check = Follow.objects.filter(user_whofollow_id=who_follow, user_tofollow_id=whom_follow)
        if not follow_check:
            follow_request = Follow(user_whofollow_id=who_follow, user_tofollow_id=whom_follow)
            follow_request.save()
            return JsonResponse({"Ok": "start following"}, status=200)
        else:
            follow_check.delete()
            return JsonResponse({"Ok": "Unfollow"}, status=201)


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


def posts_view(request, page=""):
    if request.method == "POST":
        data = json.loads(request.body)
        body = data.get("body", "")
        title = data.get("title", "")
        newpost = Post(title=title, post_body=body, publish_user_id=request.user.username)
        newpost.save()
        return JsonResponse({"message": "Successfully posted."}, status=201)

    if request.method != "POST":
        for_pagination = Post.objects.all().order_by("-id")
        print(for_pagination)
        page = request.GET.get("page")
        posts = Paginator(for_pagination, 3)
        page_obj = posts.get_page(page)
        return JsonResponse([post.serialize() for post in page_obj], safe=False)


def user_post_view(request, user):
    posts = Post.objects.raw("SELECT * FROM network_post WHERE publish_user_id=%s ORDER BY id DESC", [user])
    return JsonResponse([post.serialize() for post in posts], safe=False)


def profile_view(request, user):
    currentuser = request.user.username
    finduser = User.objects.filter(username=user)
    userfollowers = Follow.objects.filter(user_tofollow=user).count()
    userfollow = Follow.objects.filter(user_whofollow=user).count()
    for_pagination = Post.objects.all().order_by("-id")
    posts = Paginator(for_pagination, 3)
    followcheck = Follow.objects.filter(user_whofollow=currentuser, user_tofollow=user)
    if not followcheck:
        checker = 1
    else:
        checker = 2

    if finduser:
        if currentuser == user:
            return render(request, "network/profile.html", {
                "currentuser": user.capitalize(),
                "userfollow": userfollow,
                "userfollowers": userfollowers,
                "buttons": checker,
                "pagination": posts
            })
        else:
            return render(request, "network/profile.html", {
                "currentuser": user.capitalize(),
                "userfollow": userfollow,
                "userfollowers": userfollowers,
                "buttons": checker,
                "pagination": posts
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
