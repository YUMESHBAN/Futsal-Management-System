from django.contrib import admin
from .models import Team, Player, Futsal,Match, MatchRequest, TimeSlot, Payment

admin.site.register(Team)
admin.site.register(Player)
admin.site.register(Futsal)
admin.site.register(Match)
admin.site.register(MatchRequest)
admin.site.register(TimeSlot)
admin.site.register(Payment)
