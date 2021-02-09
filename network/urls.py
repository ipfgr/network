
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes

    path("posts", views.posts_view, name="posts"),
    path("posts/edit", views.posts_saveedit, name="postsedit"),
    path("posts/like", views.like_view, name="like"),
    path(r'^posts/(?P<page>\w+)/$', views.posts_view, name="page"),
    path("posts/<int:post_id>", views.singlepost_view, name="singlepost" ),
    path("posts/<str:user>", views.user_post_view, name="userposts"),
    path("profile/<str:user>", views.profile_view, name="profile"),
    path("profile/follow", views.follow_view, name="follow"),

]
