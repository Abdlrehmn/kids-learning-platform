from django.contrib import admin

from .models import ChildProfile, ParentProfile


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "email_verified_at", "created_at")
    search_fields = ("user__email", "user__username")


@admin.register(ChildProfile)
class ChildProfileAdmin(admin.ModelAdmin):
    list_display = ("nickname", "guardian", "age_band", "is_active", "created_at")
    list_filter = ("is_active", "age_band")
    search_fields = ("nickname", "guardian__email")
