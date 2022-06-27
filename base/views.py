import time
import random

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from agora_token_builder import RtcTokenBuilder
from django.conf import settings
from django.core.cache import cache
# Create your views here.
from base.models import Member


def token_builder(request):
    print(settings.AGORA_APPID)
    # Build token with uid
    appId = settings.AGORA_APPID
    appCertificate = settings.AGORA_APPCERTIFICATE
    channelName = request.GET.get('channel')
    name = request.GET.get('name')
    uid = random.randint(1, 233)
    role = 1
    expiration_duration = 3600 * 24
    now = time.time()
    privilegeExpiredTs = now + expiration_duration

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    Member.objects.create(UID=uid, name=name, channel=channelName)
    cache.set(f'{uid}-{channelName}', name, timeout=None)

    return JsonResponse({'token': token, 'uid': uid}, safe=False)


def room(request):
    return render(request, 'base/room.html')


def lobby(request):
    return render(request, 'base/lobby.html')


def get_member(request, uid, channel):
    member = cache.get(f'{uid}-{channel}')
    print(member)
    return JsonResponse({'username': member}, safe=False)
