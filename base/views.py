import time
import random

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from agora_token_builder import RtcTokenBuilder


# Create your views here.
from base.models import Member


def token_builder(request):
    # Build token with uid
    appId = "438705e7ad5248b2856f46ddb69d0310"
    appCertificate = "f7a70ae984ea4de48a00f00f72c717fd"
    channelName = request.GET.get('channel')
    name = request.GET.get('name')
    uid = random.randint(1, 233)
    role = 1
    expiration_duration = 3600 * 24
    now = time.time()
    privilegeExpiredTs = now + expiration_duration

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)

    member = Member.objects.create(UID=uid, name=name, channel=channelName)

    return JsonResponse({'token': token, 'uid': uid}, safe=False)


def room(request):
    return render(request, 'base/room.html')


def lobby(request):
    return render(request, 'base/lobby.html')


def get_member(request, uid, channel):
    member = get_object_or_404(Member, UID=uid, channel=channel)

    return JsonResponse({'username': member.name}, safe=False)
