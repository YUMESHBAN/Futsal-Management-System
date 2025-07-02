from rest_framework import serializers
from .models import Team, TeamMember

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['name', 'age', 'position', 'photo', 'is_captain']

class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'location', 'members']

    def create(self, validated_data):
        members_data = validated_data.pop('members')
        user = self.context['request'].user
        team = Team.objects.create(created_by=user, **validated_data)

        if len(members_data) > 8:
            raise serializers.ValidationError("Max 8 members allowed per team.")

        captain_count = sum(1 for m in members_data if m.get('is_captain'))
        if captain_count != 1:
            raise serializers.ValidationError("One and only one captain is required.")

        for member in members_data:
            TeamMember.objects.create(team=team, **member)

        return team
