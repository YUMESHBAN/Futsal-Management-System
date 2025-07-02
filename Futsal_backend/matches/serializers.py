from rest_framework import serializers
from .models import Match, MatchResult

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ['team_1', 'status', 'created_at']


class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = '__all__'
        read_only_fields = ['created_at']
