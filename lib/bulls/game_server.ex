defmodule Bulls.GameServer do
  use GenServer

  alias Bulls.Game
  alias Bulls.Leaderboard

  @guess_length 5_000


  def reg(name) do
    {:via, Registry, {Bulls.GameReg, name}}
  end

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
    game = Game.new(name)
    GenServer.start_link(
      __MODULE__,
      game,
      name: reg(name)
    )
  end

  def reset(name) do
    GenServer.call(reg(name), {:reset, name})
  end

  def guess(game_name, user_name, guess_string) do
    GenServer.call(reg(game_name), {:guess, game_name, user_name, guess_string})
  end

  def add_new_user(game_name, user_name) do
    GenServer.call(reg(game_name), {:join_user, game_name, user_name})
  end

  def set_player_ready(game_name, user_name, ready) do
    GenServer.call(reg(game_name), {:set_player_ready, game_name, user_name, ready})
  end

  def set_player_playing(game_name, user_name, playing) do
    GenServer.call(reg(game_name), {:set_player_playing, game_name, user_name, playing})
  end

  def game_ready?(game_name) do
    GenServer.call(reg(game_name), {:game_ready?, game_name})
  end

  def start_timer(game_name) do
    GenServer.call(reg(game_name), {:update_guesses})
  end

  def peek(name) do
    GenServer.call(reg(name), {:peek, name})
  end

  # implementation

  def init(game) do
    {:ok, game}
  end

  def handle_call({:reset, name}, _from, game) do
    game = Game.new
    {:reply, game, game}
  end

  def handle_call({:guess, name, user_name, guess_string}, _from, game) do
    game = Game.guess(game, user_name, guess_string)
    {:reply, game, game}
  end

  def handle_call({:join_user, name, user_name}, _from, game) do
    game = Game.add_new_user(game, user_name)
    {:reply, game, game}
  end

  def handle_call({:set_player_ready, name, user_name, ready}, _from, game) do
    game = Game.set_player_ready(game, user_name, ready)
    {:reply, game, game}
  end

  def handle_call({:set_player_playing, name, user_name, playing}, _from, game) do
    game = Game.set_player_playing(game, user_name, playing)
    {:reply, game, game}
  end

  def handle_call({:game_ready?, _name}, _from, game) do
    game = Game.game_ready?(game)
    {:reply, game, game}
  end

  def handle_call({:peek, _name}, _from, game) do
    {:reply, game, game}
  end

  def handle_call({:update_guesses}, _from, game) do
    Process.send_after(self(), :update_guesses, @guess_length)
    {:reply, game, game}
  end

  def handle_info(:update_guesses, game) do
    game = Game.update_guesses(game)
    |> Game.update_game_state
    IO.inspect(game)
    BullsWeb.Endpoint.broadcast!(
        game.game_name, "view", Game.view(game)
    )
    if game.playing do
      Process.send_after(self(), :update_guesses, @guess_length)
    end
    {:noreply, game}
  end

end
