from rest_framework import serializers
from .models import Futsal,Player,TeamMatch,Team,TimeSlot

# ---- Futsal Serializer ----
class FutsalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Futsal
        fields = '__all__'
        read_only_fields = ['owner']

class TimeSlotSerializer(serializers.ModelSerializer):
    futsal_name = serializers.CharField(source='futsal.name', read_only=True)
    team_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    match_result = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = [
            'id',
            'futsal',
            'futsal_name',
            'start_time',
            'end_time',
            'is_booked',
            'created_at',
            'booked_by_match',
            'team_name',
            'user_email',
            'match_result',
        ]

    def get_team_name(self, obj):
        if obj.booked_by_match and obj.booked_by_match.team_1:
            return obj.booked_by_match.team_1.name
        return None

    def get_user_email(self, obj):
        if obj.booked_by_match and obj.booked_by_match.team_1 and obj.booked_by_match.team_1.created_by:
            return obj.booked_by_match.team_1.created_by.email
        return None

    def get_match_result(self, obj):
        if obj.booked_by_match:
            return obj.booked_by_match.result
        return None

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
    time_slot = serializers.PrimaryKeyRelatedField(queryset=TimeSlot.objects.filter(is_booked=False), required=False)

    class Meta:
        model = TeamMatch
        fields = [
            'id', 'team_1', 'team_2',
            'team_1_name', 'team_2_name',
            'match_type', 'scheduled_time',
            'accepted', 'result', 'created_at',
            'time_slot',
        ]
        read_only_fields = ['id', 'accepted', 'result', 'created_at']

    def validate(self, data):
        time_slot = data.get('time_slot')
        if data['match_type'] == 'friendly':
            if not time_slot:
                raise serializers.ValidationError("Friendly matches require a time slot.")
            if time_slot.is_booked:
                raise serializers.ValidationError("Selected time slot is already booked.")
        return data
    
    def create(self, validated_data):
        time_slot = validated_data.get('time_slot')

        # Optional: validate booking before saving
        if time_slot:
            if time_slot.is_booked:
                raise serializers.ValidationError("This time slot is already booked.")

        match = TeamMatch.objects.create(**validated_data)

        if time_slot:
            time_slot.is_booked = True
            time_slot.booked_by_match = match
            time_slot.save()

        return match
