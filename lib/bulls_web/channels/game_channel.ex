# Starting point taken from
# https://github.com/NatTuck/scratch-2021-01/blob/master/4550/0209/hangman/lib/hangman_web/channels/game_channel.ex
defmodule BullsWeb.GameChannel do
  use BullsWeb, :channel

  alias  Bulls.Game
  alias  Bulls.GameServer

  @impl true
  def join("game:" <> _id, payload, socket) do
    if authorized?(payload) do
      {:ok, %{}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("guess", %{"guess" => guess_digits, "user_name" => user_name}, socket0) do
    game0 = socket0.assigns[:name]
            |> GameServer.peek()
    game1 = Game.guess(game0, guess_digits, user_name)
    view = Game.view(game1)
    {:reply, {:ok, view}, socket0}
  end

  @impl true
  def handle_in("reset", _, socket) do
    game = Game.new
    socket = assign(socket, :game, game)
    view = Game.view(game)
    {:reply, {:ok, view}, socket}
  end

  @impl true
  def handle_in("login", %{"name" => game_name, "user_name" => user_name}, socket) do
    GameServer.start(game_name)
    socket = socket
             |> assign(:name, game_name)
    view = socket.assigns[:name]
           |> GameServer.add_new_user(user_name)
           |> Game.view()
    broadcast(socket, "view", view)
    {:reply, {:ok, view}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end

end
