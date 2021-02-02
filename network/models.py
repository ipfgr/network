from datetime import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    title = models.CharField(max_length=255, unique=True)
    publish_user = models.ForeignKey(User, to_field="username", on_delete=models.PROTECT, related_name="post_byuser")
    post_body = models.TextField()
    likes = models.PositiveIntegerField(default=0, null=False)
    post_date = models.DateTimeField(default=datetime.now())


class Like(models.Model):
    like_topost = models.ForeignKey(Post, to_field="title", related_name="liked_post", on_delete=models.PROTECT)
    like_byuser = models.ForeignKey(User, to_field="username", on_delete=models.PROTECT, related_name="liked_byuser")


class Follow(models.Model):
    user_whofollow = models.ForeignKey(User, to_field="username", on_delete=models.PROTECT, related_name="follow_by")
    user_tofollow = models.ForeignKey(User, to_field="username", on_delete=models.PROTECT, related_name="follow_to")
    date_startfollow = models.DateTimeField(default=datetime.now())
