from datetime import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

    def serialize(self):
        return {
        "username": self.username
        }


class Post(models.Model):
    title = models.CharField(max_length=255, unique=True)
    publish_user = models.ForeignKey(User, to_field="username", on_delete=models.PROTECT, related_name="post_byuser")
    post_body = models.TextField()
    likes = models.PositiveIntegerField(default=0, null=False)
    post_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "Post by {} , Title '{}' ".format(self.publish_user, self.title)

    def serialize(self):
        return{
            "title": self.title,
            "publish_user": self.publish_user.username,
            "body": self.post_body,
            "likes": self.likes,
            "timestamp": self.post_date.strftime("%b %d %Y, %I:%M %p"),

        }

class Like(models.Model):
    like_topost = models.ForeignKey(Post, to_field="title", on_delete=models.PROTECT)
    like_by = models.CharField(max_length=200, default="none")

    def __str__(self):
        return "User {} lite post {}".format(self.like_by, self.like_topost)


class Follow(models.Model):
    user_whofollow = models.ForeignKey(User, to_field="username", on_delete=models.PROTECT, related_name="follow_by")
    user_tofollow = models.ForeignKey(User, to_field="username", on_delete=models.PROTECT, related_name="follow_to")
    date_startfollow = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "User {} start follow {}".format(self.user_whofollow, self.user_tofollow)
