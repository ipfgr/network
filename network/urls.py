
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("followpage", views.follow, name="followpage"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes

    path("api/posts", views.posts_view, name="posts"),
    path("api/posts/edit", views.posts_saveedit, name="postsedit"),
    path("api/posts/like", views.like_view, name="like"),
    path("api/posts/follow", views.follow_user_view, name="follow"),
    path(r'^api/posts/follow(?P<page>\w+)/$', views.follow_user_view, name="followposts"),
    path(r'^api/posts/(?P<page>\w+)/$', views.posts_view, name="page"),
    path("api/posts/<str:user>", views.user_post_view, name="userposts"),
    path("profile/<str:user>", views.profile_view, name="profile"),


]
