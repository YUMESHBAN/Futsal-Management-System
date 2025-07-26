from django.apps import AppConfig

class FutsalAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'futsal_app'

    def ready(self):
        import futsal_app.signals
