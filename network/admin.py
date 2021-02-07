from django.contrib import admin
from .models import Post
from .models import Like
from .models import Follow


admin.site.register(Post)
admin.site.register(Follow)
admin.site.register(Like)