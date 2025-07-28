from rest_framework import serializers
from futsal_app.models import Futsal, Team, Player, Match, MatchRequest


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
        fields = ['id', 'name', 'age', 'position', 'is_captain', 'photo']
        read_only_fields = ['id']


# ---- Team Serializer ----
class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, required=False)
    futsal = FutsalSerializer(read_only=True)  # Optional: for nested futsal display
    futsal_id = serializers.PrimaryKeyRelatedField(
        source='futsal', queryset=Futsal.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'location', 'skill_level', 'owner', 'futsal', 'futsal_id',
            'ranking', 'wins', 'matches_played', 'created_at', 'players'
        ]
        read_only_fields = ['id', 'owner', 'ranking', 'wins', 'matches_played', 'created_at']

    def create(self, validated_data):
        players_data = validated_data.pop('players', [])
        team = Team.objects.create(**validated_data)

        captain_count = 0
        for player_data in players_data:
            if player_data.get('is_captain'):
                captain_count += 1
            Player.objects.create(team=team, **player_data)

        if captain_count > 1:
            raise serializers.ValidationError("Only one captain is allowed per team.")

        return team


# ---- Match Serializer ----
class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ['status', 'created_at']


# ---- Match Request Serializer ----
class MatchRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchRequest
        fields = ['id', 'team_a', 'team_b', 'mode', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']
