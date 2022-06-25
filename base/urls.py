from django.urls import path

from base import views

app_name = "base"
urlpatterns = [
    path('', views.lobby, name="lobby"),
    path('room/', views.room, name="room"),

    path('token-gen/', views.token_builder),

    path('member/<str:channel>/<str:uid>/', views.get_member),
]
