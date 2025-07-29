from rest_framework import serializers
from .models import Futsal,Player,TeamMatch,Team,TimeSlot,MatchRequest,Match

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

    # Home futsal
    futsal = FutsalSerializer(read_only=True)
    futsal_id = serializers.PrimaryKeyRelatedField(
        source='futsal', queryset=Futsal.objects.all(), write_only=True, required=False
    )

    # Preferred futsals
    preferred_futsals = FutsalSerializer(many=True, read_only=True)
    preferred_futsal_ids = serializers.PrimaryKeyRelatedField(
        queryset=Futsal.objects.all(),
        write_only=True,
        many=True,
        required=True
    )

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'location', 'skill_level', 'owner',
            'futsal', 'futsal_id',
            'preferred_futsals', 'preferred_futsal_ids',
            'ranking', 'wins', 'matches_played', 'created_at', 'players'
        ]
        read_only_fields = ['id', 'owner', 'ranking', 'wins', 'matches_played', 'created_at']

    def create(self, validated_data):
        players_data = validated_data.pop('players', [])
        preferred_futsals = validated_data.pop('preferred_futsal_ids', [])

        # Validate minimum 2 preferred futsals
        if len(preferred_futsals) < 2:
            raise serializers.ValidationError("You must select at least 2 preferred futsals.")

        team = Team.objects.create(**validated_data)
        team.preferred_futsals.set(preferred_futsals)

        captain_count = 0
        for player_data in players_data:
            if player_data.get('is_captain'):
                captain_count += 1
            Player.objects.create(team=team, **player_data)

        if captain_count > 1:
            raise serializers.ValidationError("Only one captain is allowed per team.")

        return team

    def update(self, instance, validated_data):
        players_data = validated_data.pop('players', None)
        preferred_futsals = validated_data.pop('preferred_futsal_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if preferred_futsals is not None:
            if len(preferred_futsals) < 2:
                raise serializers.ValidationError("You must select at least 5 preferred futsals.")
            instance.preferred_futsals.set(preferred_futsals)

        instance.save()

       
        return instance

# ---- Team Match for friendly Serializer ----
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



# ---- Match for competitive Serializer ----
class MatchSerializer(serializers.ModelSerializer):
    team_1 = serializers.CharField(source='team_1.name', read_only=True)
    team_1_id = serializers.IntegerField(source='team_1.id', read_only=True)

    team_2 = serializers.CharField(source='team_2.name', read_only=True)
    team_2_id = serializers.IntegerField(source='team_2.id', read_only=True)

    futsal = serializers.CharField(source='futsal.name', read_only=True)

    class Meta:
        model = Match
        fields = [
            'id',
            'team_1', 'team_1_id',
            'team_2', 'team_2_id',
            'winner',
            'scheduled_date',
            'futsal',
            'status',
        ]


# ---- Match Request Serializer ----
class MatchRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchRequest
        fields = ['id', 'team_a', 'team_b', 'mode', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

