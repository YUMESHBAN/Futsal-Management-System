from rest_framework import serializers
from .models import Futsal

class FutsalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Futsal
        fields = '__all__'
        read_only_fields = ['owner']
