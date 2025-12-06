class GameInterface:
    def get_name(self):
        raise NotImplementedError

    def get_system_prompt_addition(self):
        raise NotImplementedError

    def check_game_state(self, game_data):
        """
        Analyzes the game data sent from frontend and returns a system injection string
        if there's a significant event (win/loss/etc).
        """
        return ""
