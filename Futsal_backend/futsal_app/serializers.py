from rest_framework import serializers
from .models import Futsal,Player,TeamMatch,Team

# ---- Futsal Serializer ----
class FutsalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Futsal
        fields = '__all__'
        read_only_fields = ['owner']


# ---- Player Serializer ----
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'name', 'age', 'is_captain', 'is_goalkeeper', 'photo']
        read_only_fields = ['id']

# ---- Team Serializer ----
class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, required=False)

    class Meta:
        model = Team
        fields = ['id', 'name', 'owner', 'created_at', 'players']
        read_only_fields = ['owner', 'created_at']

    def create(self, validated_data):
        players_data = validated_data.pop('players', [])
        team = Team.objects.create(**validated_data)
        for player_data in players_data:
            Player.objects.create(team=team, **player_data)
        return team

# ---- Team Match Serializer ----
class TeamMatchSerializer(serializers.ModelSerializer):
    team_1_name = serializers.CharField(source='team_1.name', read_only=True)
    team_2_name = serializers.CharField(source='team_2.name', read_only=True)

    class Meta:
        model = TeamMatch
        fields = [
            'id', 'team_1','team_2',
            'team_1_name','team_2_name',
            'match_type', 'scheduled_time',
            'accepted', 'result', 'created_at'
        ]
        read_only_fields = ['accepted', 'result', 'created_at']