defmodule Bulls.GameServer do
    use GenServer

    alias Bulls.Game

    def reg(name) do
        {:via, Registry, {Bulls.GameReg, name}}
    end

    # # only needs to be called after a game has completed
    # def regUser(name) do
    #     {:via, Registry, {Bulls.UserReg, name}}
    # end

    def start(name) do
        spec = %{
          id: __MODULE__,
          start: {__MODULE__, :start_link, [name]},
          restart: :permanent,
          type: :worker
        }
        Bulls.GameSup.start_child(spec)
      end
    
      def start_link(name) do
        game = BackupAgent.get(name) || Game.new
        GenServer.start_link(
          __MODULE__,
          game,
          name: reg(name)
        )
      end
    
      def reset(name) do
        GenServer.call(reg(name), {:reset, name})
      end
    
      def guess(game_name, guess_string, user_name) do
        GenServer.call(reg(name), {:guess, game_name, guess_string, user_name})
      end

      def peek(name) do
        GenServer.call(reg(name), {:peek, name})
      end
    
      # implementation
    
      def init(game) do
        # Process.send_after(self(), :pook, 10_000)
        {:ok, game}
      end
    
      def handle_call({:reset, name}, _from, game) do
        game = Game.new
        BackupAgent.put(name, game)
        {:reply, game, game}
      end
    
      def handle_call({:guess, name, guess_string, user_name}, _from, game) do
        game = Game.guess(game, guess_string, user_name)
        BackupAgent.put(name, game)
        {:reply, game, game}
      end

      def handle_call({:join_user, name, user_name}, _from, game) do
        game = Game.add_new_user(game, user_name)
        BackupAgent.put(name, game)
        {:reply, game, game}
      end

      def handle_call({:peek, _name}, _from, game) do
        {:reply, game, game}
      end

end